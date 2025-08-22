from rest_framework import serializers
from .models import Company
from django.contrib.auth import get_user_model

User = get_user_model()

class CompanySerializer(serializers.ModelSerializer):
    # 'users' field will accept a list of primary keys (user IDs).
    # It's not required on creation, as the owner will be added automatically.
    users = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=User.objects.all(),
        required=False
    )

    # 'owner' is read-only. It will be set automatically in the view/serializer logic
    # and not directly from the request payload. We display the owner's username for clarity.
    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Company
        fields = [
            'id',
            'company_name',
            'owner',
            'users',
            'standard',
            'sector',
            'region',
            'company_data',
        ]
        read_only_fields = ['id', 'owner']

    def create(self, validated_data):
        """
        Custom create method to set the owner and add them to the users list.
        """
        # Extract 'users' data before creating the company instance.
        users_data = validated_data.pop('users', [])
        
        # Get the current user from the request context. This is the owner.
        request_user = self.context['request'].user
        
        # Create the company, assigning the owner.
        company = Company.objects.create(owner=request_user, **validated_data)
        
        # Add the owner to the list of users associated with the company.
        # We use a set to prevent duplicates if the owner's ID was also in the request.
        user_set = set(users_data)
        user_set.add(request_user)
        
        # Set the users for the company.
        company.users.set(user_set)
        
        return company

