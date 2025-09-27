from django.contrib import admin
from .models import QueueItem, Notification


@admin.register(QueueItem)
class QueueItemAdmin(admin.ModelAdmin):
    """Admin interface for QueueItem model"""
    
    list_display = [
        'patient', 'doctor', 'status', 'priority', 
        'arrival_time', 'waiting_time_minutes', 'created_at'
    ]
    list_filter = ['status', 'priority', 'doctor', 'arrival_time']
    search_fields = [
        'patient__first_name', 'patient__last_name', 'patient__cin',
        'doctor__user__first_name', 'doctor__user__last_name'
    ]
    readonly_fields = ['waiting_time_minutes', 'consultation_duration_minutes', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('patient', 'doctor', 'status', 'priority')
        }),
        ('Horaires', {
            'fields': ('arrival_time', 'called_time', 'completed_time')
        }),
        ('Détails', {
            'fields': ('reason', 'notes')
        }),
        ('Statistiques', {
            'fields': ('waiting_time_minutes', 'consultation_duration_minutes'),
            'classes': ('collapse',)
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def waiting_time_minutes(self, obj):
        return f"{obj.waiting_time_minutes} min"
    waiting_time_minutes.short_description = 'Temps d\'attente'


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    """Admin interface for Notification model"""
    
    list_display = ['title', 'notification_type', 'patient', 'doctor', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read', 'created_at']
    search_fields = ['title', 'message', 'patient__first_name', 'patient__last_name']
    readonly_fields = ['created_at']
    
    actions = ['mark_as_read', 'mark_as_unread']

    def mark_as_read(self, request, queryset):
        updated = queryset.update(is_read=True)
        self.message_user(request, f'{updated} notifications marquées comme lues.')
    mark_as_read.short_description = 'Marquer comme lu'

    def mark_as_unread(self, request, queryset):
        updated = queryset.update(is_read=False)
        self.message_user(request, f'{updated} notifications marquées comme non lues.')
    mark_as_unread.short_description = 'Marquer comme non lu'