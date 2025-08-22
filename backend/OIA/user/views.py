# user/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializer import UserSerializer, ManagedUserSerializer

# user/views.py
from rest_framework.permissions import BasePermission
from .models import User
from report.models import Company

class IsAdminRole(BasePermission):
    """
    Custom permission to only allow users with the 'admin' role.
    """
    def has_permission(self, request, view):
        # Check if the user is authenticated and has the 'admin' role.
        return request.user and request.user.is_authenticated and request.user.role == User.Role.ADMIN #and not request.user.is_superuser (add later)



@api_view(['GET'])
@permission_classes([IsAdminRole])
def admin_management_view(request):
    """
    Returns all the necessary data for an admin's user management page
    in a single API call.
    """
    admin_user = request.user

    # 1. Get managed users
    managed_users = admin_user.managed_users.all()
    users_serializer = ManagedUserSerializer(managed_users, many=True)

    # 2. Get owned companies
    owned_companies = Company.objects.filter(owner=admin_user)
    # Create a simple list of company objects for the frontend
    companies_data = [{"id": c.id, "name": c.company_name} for c in owned_companies]

    # 3. Combine into a single response object
    response_data = {
        "managed_users": users_serializer.data,
        "owned_companies": companies_data
    }

    return Response(response_data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile_view(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAdminRole]) # Only Admins can create users
def create_managed_user(request):
    """
    Creates a new OA or Entity user and, if applicable, associates
    the user with a company.
    """
    data = request.data.copy()
    
    # An admin cannot create another admin.
    if data.get('role') == User.Role.ADMIN:
        return Response(
            {'error': 'Admins cannot create other admins.'},
            status=status.HTTP_403_FORBIDDEN
        )

    # Pop the company ID from the data so the UserSerializer doesn't see it.
    company_id = data.pop('company', None)

    serializer = UserSerializer(data=data, context={'request': request})
    if serializer.is_valid():
        # Create the user first.
        user = serializer.save()

        # If the role is 'entity' and a company ID was provided,
        # associate the user with the company.
        if user.role == User.Role.ENTITY and company_id:
            try:
                company = Company.objects.get(id=company_id, owner=request.user)
                # Use the 'users' ManyToManyField manager to add the user.
                company.users.add(user)
            except Company.DoesNotExist:
                # If the company doesn't exist or isn't owned by the admin,
                # we can delete the newly created user for consistency
                # or just return an error. Deleting is cleaner.
                user.delete()
                return Response(
                    {'error': 'Company not found or you are not the owner.'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        # Return the data for the successfully created user.
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAdminRole])
def delete_managed_user(request, user_id):
    """
    Deletes a user, ensuring the requesting admin is the user's creator.
    """
    admin_user = request.user
    try:
        # Find the user to delete, but only from the list of users
        # managed by the current admin. This is a critical security check.
        user_to_delete = admin_user.managed_users.get(id=user_id)
        user_to_delete.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found or you do not have permission to delete them.'},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['PATCH'])
@permission_classes([IsAdminRole])
def edit_managed_user(request, user_id):
    """
    Updates a user, ensuring the requesting admin is the user's creator
    and correctly hashing the password if it's changed.
    """
    admin_user = request.user
    try:
        user_to_edit = admin_user.managed_users.get(id=user_id)
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found or you do not have permission to edit them.'},
            status=status.HTTP_404_NOT_FOUND
        )

    data = request.data.copy()
    company_id = data.pop('company', None)
    password = data.pop('password', None) # Extract password

    serializer = UserSerializer(user_to_edit, data=data, partial=True, context={'request': request})
    if serializer.is_valid():
        user = serializer.save()

        # If a new password was provided, hash it and save it.
        if password:
            user.set_password(password)
            user.save()

        # Handle company association logic
        if 'company' in request.data:
            if user.role == User.Role.ENTITY:
                try:
                    company = Company.objects.get(id=company_id, owner=request.user)
                    user.companies.set([company])
                except Company.DoesNotExist:
                    # Note: In a real-world scenario, you might want to handle this error more gracefully
                    return Response(
                        {'error': 'Company not found or you are not the owner.'},
                        status=status.HTTP_404_NOT_FOUND
                    )
            else: 
                user.companies.clear()

        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        # This method is called to generate the token.
        # We first call the parent class's method to get the basic token.
        token = super().get_token(user)

        # --- Add Custom Claims ---
        # You can add any custom data to the token's payload here.
        # This data will be encoded into the JWT.
        # For example, we add the username and admin status.
        token['username'] = user.username
        token['is_admin'] = user.is_staff # or user.is_superuser

        return token

    def validate(self, attrs):
        # This method is called upon login to validate credentials
        # and return the final response dictionary.
        
        # Call the parent class's validation to get the access/refresh tokens.
        data = super().validate(attrs)

        # Now, we serialize the user data using our UserSerializer
        # and add it to the response.
        # `self.user` is the authenticated user instance.
        serializer = UserSerializer(self.user)
        user_data = serializer.data
        
        # Merge the user data into the response
        data['user'] = user_data
            
        return data


class MyTokenObtainPairView(TokenObtainPairView):
    """
    Replaces the default TokenObtainPairView to use our custom serializer.
    """
    serializer_class = MyTokenObtainPairSerializer


