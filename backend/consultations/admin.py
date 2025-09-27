from django.contrib import admin
from .models import Consultation, Prescription, ExamRequest


class PrescriptionInline(admin.TabularInline):
    model = Prescription
    extra = 0


class ExamRequestInline(admin.TabularInline):
    model = ExamRequest
    extra = 0


@admin.register(Consultation)
class ConsultationAdmin(admin.ModelAdmin):
    """Admin interface for Consultation model"""
    
    list_display = [
        'patient', 'doctor', 'date', 'status', 'created_at'
    ]
    list_filter = ['status', 'date', 'doctor', 'created_at']
    search_fields = [
        'patient__first_name', 'patient__last_name', 'patient__cin',
        'doctor__user__first_name', 'doctor__user__last_name'
    ]
    readonly_fields = ['created_at', 'updated_at']
    
    inlines = [PrescriptionInline, ExamRequestInline]
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('patient', 'doctor', 'date', 'status')
        }),
        ('Détails médicaux', {
            'fields': ('observations', 'diagnosis', 'treatment_plan')
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Prescription)
class PrescriptionAdmin(admin.ModelAdmin):
    """Admin interface for Prescription model"""
    
    list_display = ['consultation', 'medication', 'dosage', 'duration', 'created_at']
    list_filter = ['created_at', 'consultation__doctor']
    search_fields = ['medication', 'consultation__patient__first_name', 'consultation__patient__last_name']


@admin.register(ExamRequest)
class ExamRequestAdmin(admin.ModelAdmin):
    """Admin interface for ExamRequest model"""
    
    list_display = ['consultation', 'exam_type', 'urgent', 'created_at']
    list_filter = ['urgent', 'created_at', 'consultation__doctor']
    search_fields = ['exam_type', 'description', 'consultation__patient__first_name']