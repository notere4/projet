"""
URL configuration for medical_practice project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('django.contrib.auth.urls')),
    path('api/patients/', include('patients.urls')),
    path('api/consultations/', include('consultations.urls')),
    path('api/queue/', include('queue_management.urls')),
]