# your_app/views.py

import pandas as pd
import numpy as np
from io import BytesIO
from collections import defaultdict
import copy
import warnings
import re

from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import Company
from .serializer import CompanySerializer
from django.contrib.auth import get_user_model
from django.http import HttpResponse

User = get_user_model()

# --- Data Processing Service ---

def parse_cmmi_rating(rating_str):
    """Safely parses a CMMI rating string to a float."""
    try:
        # Ensure it's a string
        if not isinstance(rating_str, str):
            rating_str = str(rating_str)

        # Find the first number (integer or float)
        match = re.search(r'\b(\d+(\.\d+)?)\b', rating_str)
        if match:
            return float(match.group(1))
    except (ValueError, TypeError):
        pass
    return None

def calculate_summary(records, region=None, sector=None):
    """
    Takes a list of records, performs all calculations, and returns a
    summary dictionary that includes region and sector
    """
    if not isinstance(records, list):
        return {}
        
    # --- Data Gathering ---
    spe_subdomain_ratings = defaultdict(lambda: defaultdict(list))
    spe_subdomain_target_ratings = defaultdict(lambda: defaultdict(list))
    all_control_ratings = []
    all_control_target_ratings = []

    for record in records:
        if record.get("Control ID"):
            # Observed Rating
            rating = parse_cmmi_rating(record.get("CMMI Tier Observed Rating"))
            if rating is not None:
                spe = record.get("SPE")
                sub = record.get("Sub Domain")
                if spe and sub:
                    spe_subdomain_ratings[spe][sub].append(rating)
                    all_control_ratings.append(rating)

            # Target Rating
            target_rating = parse_cmmi_rating(record.get("CMMI Tier Target Rating"))
            if target_rating is not None:
                spe = record.get("SPE")
                sub = record.get("Sub Domain")
                if spe and sub:
                    spe_subdomain_target_ratings[spe][sub].append(target_rating)
                    all_control_target_ratings.append(target_rating)

    # --- Calculation for OBSERVED ratings ---
    observed_summary = {}
    for spe, subdomains in spe_subdomain_ratings.items():
        all_ratings_in_spe = [r for sub_ratings in subdomains.values() for r in sub_ratings]
        subdomain_averages = {sub: round(sum(sub_ratings) / len(sub_ratings), 2) for sub, sub_ratings in subdomains.items() if sub_ratings}
        domain_avg = round(sum(all_ratings_in_spe) / len(all_ratings_in_spe), 2) if all_ratings_in_spe else 0
        observed_summary[spe] = {"domain_average": domain_avg, "subdomain_averages": subdomain_averages}

    # --- Calculation for TARGET ratings ---
    target_summary = {}
    for spe, subdomains in spe_subdomain_target_ratings.items():
        all_ratings_in_spe = [r for sub_ratings in subdomains.values() for r in sub_ratings]
        subdomain_averages = {sub: round(sum(sub_ratings) / len(sub_ratings), 2) for sub, sub_ratings in subdomains.items() if sub_ratings}
        domain_avg = round(sum(all_ratings_in_spe) / len(all_ratings_in_spe), 2) if all_ratings_in_spe else 0
        target_summary[spe] = {"domain_average": domain_avg, "subdomain_averages": subdomain_averages}


    # Calculate Overall Scores
    overall_domain_score = round(sum(all_control_ratings) / len(all_control_ratings), 2) if all_control_ratings else 0
    maturity_percent = round((overall_domain_score / 5) * 100, 2)
    overall_domain_target_score = round(sum(all_control_target_ratings) / len(all_control_target_ratings), 2) if all_control_target_ratings else 0
    target_maturity_percent = round((overall_domain_target_score / 5) * 100, 2)

    # --- Final Summary Object ---
    return {
        "final_calculation": {
            "region": region,
            "sector": sector,
            "spe_domain_summary": observed_summary,
            "overall_domain_score": overall_domain_score,
            "maturity_percent": maturity_percent,
            "spe_domain_target_summary": target_summary,
            "overall_domain_target_score": overall_domain_target_score,
            "target_maturity_percent": target_maturity_percent
        }
    }

def process_excel_data(excel_bytes, region=None, sector=None):
    """
    Orchestrates data processing, now passing region and sector
    down to the calculation function.
    """
    if not excel_bytes:
        return None

    try:
        excel_io = BytesIO(excel_bytes)
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            df = pd.read_excel(excel_io, sheet_name=0)

        df = df.replace({np.nan: None})
        df = df.dropna(how='all')
        records = df.to_dict(orient='records')

        if not records:
            return []

    except Exception as e:
        return [{'error': f'Failed to parse Excel file: {str(e)}'}]

    # Call the dedicated calculation function with the extra data
    final_summary = calculate_summary(records, region=region, sector=sector)
    
    # Append the summary to the list of records
    records.append(final_summary)

    return records


# --- API ViewSet ---
# It handles list, create, retrieve, update, and destroy actions.

class CompanyViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows companies to be viewed or edited.
    """
    serializer_class = CompanySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        This view should return a list of all the companies based on the
        user's role and their relationship to an Admin.
        - An Admin sees companies they own.
        - An OA or Entity user sees companies owned by THEIR creating Admin.
        """
        user = self.request.user

        if user.role == User.Role.ADMIN:
            # An Admin sees all companies they are the owner of.
            return Company.objects.filter(owner=user)
        
        if user.role in [User.Role.OA, User.Role.ENTITY]:
            # An OA or Entity user should only see companies owned by their creator.
            if user.created_by:
                # Get the admin who created this user.
                admin_creator = user.created_by
                # Return all companies that this admin owns AND the current user is a member of.
                return admin_creator.owned_companies.filter(users=user)
            else:
                # If an OA/Entity user has no creator, they see nothing.
                return Company.objects.none()
            
        # Fallback for any other case (e.g., superuser not in a role)
        return Company.objects.none()

    def get_serializer_context(self):
        """
        Pass the request context to the serializer. This is crucial for the
        serializer's create method to access the current user.
        """
        return {'request': self.request}

    def list(self, request, *args, **kwargs):
        """
        Custom list view to return data in a dictionary format where keys
        are company names. This version injects the company ID into the
        final_calculation object for use on the frontend.
        """
        queryset = self.get_queryset()
        response_data = {}

        for company in queryset:
            if not company.company_data:
                continue

            # Make a deep copy to avoid modifying the original data in memory
            company_data_copy = list(company.company_data)

            # Find the final_calculation object and add the ID
            for item in company_data_copy:
                if 'final_calculation' in item:
                    item['final_calculation']['id'] = company.id
                    break # Stop after finding and updating it
            
            response_data[company.company_name] = company_data_copy

        return Response(response_data, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        """
        Custom create method to handle Excel file upload and processing.
        """
        # --- File and Data Extraction ---
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No Excel file provided.'}, status=status.HTTP_400_BAD_REQUEST)

        company_name = request.data.get('company_name')
        if not company_name:
            return Response({'error': 'Company name is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if Company.objects.filter(owner=request.user, company_name=company_name).exists():
            return Response(
                {'error': f"A company with the name '{company_name}' already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )


        region = request.data.get('region')
        sector = request.data.get('sector')

        # --- Data Processing ---
        excel_bytes = file.read()
        # Pass region and sector to the processing function
        processed_data = process_excel_data(excel_bytes, region=region, sector=sector)

        # Check if processing returned an error
        if processed_data and isinstance(processed_data, list) and processed_data[0].get('error'):
            return Response(processed_data[0], status=status.HTTP_400_BAD_REQUEST)

        # --- Prepare data for the serializer ---
        serializer_data = {
            'company_name': company_name,
            'standard': request.data.get('standard'),
            'sector': sector,
            'region': region,
            'company_data': processed_data
        }

        # --- Validation and Saving ---
        serializer = self.get_serializer(data=serializer_data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        """
        Handles partial updates to a company with a more robust flow that
        supports metadata edits, in-line data edits, and file re-uploads.
        """
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        data = request.data.copy()

        # Step 1: Handle simple metadata fields directly.
        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Refresh the instance to get the newly saved data
        instance.refresh_from_db()

        # Step 2: Handle updates to the company_data JSON blob.
        # This is needed if the table data was edited, a new file was uploaded,
        # or if any metadata that is duplicated in the JSON has changed.
        if 'company_data' in data or 'file' in request.FILES or 'sector' in data or 'region' in data or 'company_name' in data:
            
            # If a new file is uploaded, its records replace the old ones.
            if 'file' in request.FILES:
                file = request.FILES.get('file')
                excel_bytes = file.read()
                # Use the now-updated instance data for calculation
                new_data_list = process_excel_data(excel_bytes, region=instance.region, sector=instance.sector)
                records = [item for item in new_data_list if 'final_calculation' not in item]
            elif 'company_data' in data:
                # If just company_data is sent (from the editable table), use those records.
                records = [item for item in data['company_data'] if 'final_calculation' not in item]
            else:
                # If only metadata changed, use the existing records.
                records = [item for item in instance.company_data if 'final_calculation' not in item]

            # Recalculate the summary using the final, saved instance data and the new records
            new_summary = calculate_summary(records, region=instance.region, sector=instance.sector)
            
            # Reconstruct the full company_data list and save it directly
            records.append(new_summary)
            instance.company_data = records
            instance.save(update_fields=['company_data'])

        # Return the final, fully updated instance using the serializer
        return Response(self.get_serializer(instance).data)

    @action(detail=True, methods=['get'], url_path='download-excel')
    def download_excel(self, request, pk=None):
        """
        Converts the company's JSON data back to an Excel file for download,
        with a specific column order.
        """
        company = self.get_object()
        
        if not company.company_data:
            return Response({'error': 'No data available to download.'}, status=status.HTTP_404_NOT_FOUND)

        records = [item for item in company.company_data if 'final_calculation' not in item]

        if not records:
            return Response({'error': 'No records found to export.'}, status=status.HTTP_404_NOT_FOUND)

        df = pd.DataFrame(records)

        # --- ADD THIS BLOCK TO REORDER COLUMNS ---
        # Define the exact order you want for the columns.
        desired_order = [
            'SPE',
            'Sub Domain',
            'Control ID',
            'Control Name',
            'Control Name.1',
            'In Place?',
            'CMMI Tier Target Rating',
            'CMMI Tier Observed Rating'
        ]
        
        # Filter the desired order to only include columns that actually exist in the DataFrame.
        # This prevents errors if a column is missing from the data.
        final_order = [col for col in desired_order if col in df.columns]
        
        # Reorder the DataFrame according to the final order.
        df = df[final_order]
        # --- END OF BLOCK ---

        output = BytesIO()
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            df.to_excel(writer, index=False, sheet_name='Report')
        
        output.seek(0)

        response = HttpResponse(
            output,
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename="{company.company_name}_report.xlsx"'

        return response