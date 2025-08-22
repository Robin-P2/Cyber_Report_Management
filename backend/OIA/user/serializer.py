# user/serializers.py
from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    
    # Make created_by a read-only field that shows the creator's username.
    created_by_username = serializers.ReadOnlyField(source='created_by.username')

    class Meta:
        model = User
        fields = [
            'id', 
            'username', 
            'email', 
            'password', 
            'role', 
            'created_by', # The ID
            'created_by_username' # The username for display
        ]
        read_only_fields = ['id', 'created_by']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        """
        Creates a user and assigns the creator (the requesting admin).
        """
        # Create the user instance using the custom manager.
        user = User.objects.create_user(**validated_data)
        
        # Get the admin user from the context passed by the view.
        requesting_user = self.context.get('request').user
        
        # If the user creating this new user is an Admin,
        # assign them as the creator.
        if requesting_user and requesting_user.is_authenticated and requesting_user.role == User.Role.ADMIN:
            user.created_by = requesting_user
            user.save()
            
        return user
    
class ManagedUserSerializer(serializers.ModelSerializer):
    """
    A simple serializer for listing users managed by an admin.
    It only exposes non-sensitive fields.
    """
    company_name = serializers.SerializerMethodField()
    class Meta:
        model = User
        # These are the fields that will be returned in the API response.
        fields = ['id', 'username', 'email', 'role', 'company_name']

    def get_company_name(self, obj):
        """
        If the user is an entity, return the name of the first company
        they are associated with.
        """
        if obj.role == User.Role.ENTITY:
            # An entity user should only be in one company.
            company = obj.companies.first()
            return company.company_name if company else None
        return None