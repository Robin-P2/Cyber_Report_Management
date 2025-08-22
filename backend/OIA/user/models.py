# user/models.py
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

# No need to import Company model here anymore

class UserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")
        
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', User.Role.ADMIN)

        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(username, email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):

    class Role(models.TextChoices):
        ADMIN = 'admin', 'Admin'
        OA = 'OA', 'oa'
        ENTITY = 'entity', 'Entity'
    
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.ENTITY)

    # This field links an OA or Entity user to the Admin who created them.
    # It is nullable because Admins themselves do not have a creator within this hierarchy.
    created_by = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL, # If an admin is deleted, don't delete their users.
        null=True,
        blank=True,
        related_name='managed_users', # An admin can access user.managed_users.all()
        help_text="The admin who created this user."
    )

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    objects = UserManager()

    def __str__(self):
        return self.username

    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN

    @property
    def is_staff(self):
        return self.role in [self.Role.ADMIN, self.Role.OA]