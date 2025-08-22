from django.urls import path
from .views import MyTokenObtainPairView, user_profile_view, create_managed_user, admin_management_view, delete_managed_user, edit_managed_user
from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns = [
    path('profile/', user_profile_view, name='verify_user'),
    path('create/', create_managed_user, name='create-managed-user'),
    path('edit/<int:user_id>/', edit_managed_user, name='edit-managed-user'),
    path('delete/<int:user_id>/', delete_managed_user, name='delete-managed-user'),
    path('managed/', admin_management_view, name='list-managed'),
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh')
]
