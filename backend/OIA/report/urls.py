# report/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompanyViewSet

# 1. Create a router instance
router = DefaultRouter()

# 2. Register CompanyViewSet with the router.
#    - 'companies' is the URL prefix for this set of routes.
#    - 'company' is the base name used for generating URL names.
router.register(r'companies', CompanyViewSet, basename='company')

# 3. The API URLs are now determined automatically by the router.
urlpatterns = [
    path('', include(router.urls)),
]