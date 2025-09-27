from django.contrib import admin
from .models import Patient, Doctor


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    """Admin interface for Patient model"""
    
    list_display = [
        'cin', 'last_name', 'first_name', 'phone', 
        'age', 'created_at', 'created_by'
    ]
    list_filter = ['created_at', 'date_of_birth', 'created_by']
    search_fields = ['cin', 'first_name', 'last_name', 'phone', 'email']
    readonly_fields = ['created_at', 'updated_at', 'age']
    
    fieldsets = (
        ('Informations personnelles', {
            'fields': ('first_name', 'last_name', 'cin', 'date_of_birth')
        }),
        ('Contact', {
            'fields': ('phone', 'email', 'address')
        }),
        ('Informations médicales', {
            'fields': ('allergies', 'current_treatments', 'last_consultation_reason')
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at', 'created_by'),
            'classes': ('collapse',)
        }),
    )

    def age(self, obj):
        return obj.age
    age.short_description = 'Âge'

    def save_model(self, request, obj, form, change):
        if not change:  # If creating new patient
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    """Admin interface for Doctor model"""
    
    list_display = ['full_name', 'specialty', 'is_available', 'created_at']
    list_filter = ['specialty', 'is_available', 'created_at']
    search_fields = ['user__first_name', 'user__last_name', 'specialty']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Informations du médecin', {
            'fields': ('user', 'specialty', 'is_available')
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )