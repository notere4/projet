from django.db import models
from patients.models import Patient, Doctor


class QueueItem(models.Model):
    """Model for managing patient queue"""
    
    STATUS_CHOICES = [
        ('waiting', 'En attente'),
        ('in_consultation', 'En consultation'),
        ('completed', 'Terminé'),
        ('cancelled', 'Annulé'),
    ]
    
    PRIORITY_CHOICES = [
        ('normal', 'Normal'),
        ('urgent', 'Urgent'),
    ]
    
    patient = models.ForeignKey(
        Patient, 
        on_delete=models.CASCADE, 
        related_name='queue_items',
        verbose_name="Patient"
    )
    doctor = models.ForeignKey(
        Doctor, 
        on_delete=models.CASCADE, 
        related_name='queue_items',
        verbose_name="Médecin assigné"
    )
    
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='waiting',
        verbose_name="Statut"
    )
    priority = models.CharField(
        max_length=10, 
        choices=PRIORITY_CHOICES, 
        default='normal',
        verbose_name="Priorité"
    )
    
    # Timestamps
    arrival_time = models.DateTimeField(verbose_name="Heure d'arrivée")
    called_time = models.DateTimeField(
        null=True, 
        blank=True, 
        verbose_name="Heure d'appel"
    )
    completed_time = models.DateTimeField(
        null=True, 
        blank=True, 
        verbose_name="Heure de fin"
    )
    
    # Additional information
    reason = models.TextField(
        blank=True, 
        null=True, 
        verbose_name="Motif de consultation"
    )
    notes = models.TextField(
        blank=True, 
        null=True, 
        verbose_name="Notes"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Élément de file d'attente"
        verbose_name_plural = "File d'attente"
        ordering = ['priority', 'arrival_time']

    def __str__(self):
        return f"{self.patient.full_name} - {self.get_status_display()}"

    @property
    def waiting_time_minutes(self):
        """Calculate waiting time in minutes"""
        from django.utils import timezone
        
        if self.status == 'waiting':
            end_time = timezone.now()
        elif self.called_time:
            end_time = self.called_time
        else:
            return 0
        
        delta = end_time - self.arrival_time
        return int(delta.total_seconds() / 60)

    @property
    def consultation_duration_minutes(self):
        """Calculate consultation duration in minutes"""
        if self.called_time and self.completed_time:
            delta = self.completed_time - self.called_time
            return int(delta.total_seconds() / 60)
        return 0


class Notification(models.Model):
    """Model for system notifications"""
    
    TYPE_CHOICES = [
        ('doctor_available', 'Médecin disponible'),
        ('patient_ready', 'Patient prêt'),
        ('urgent', 'Urgent'),
        ('info', 'Information'),
    ]
    
    notification_type = models.CharField(
        max_length=20, 
        choices=TYPE_CHOICES,
        verbose_name="Type"
    )
    title = models.CharField(max_length=200, verbose_name="Titre")
    message = models.TextField(verbose_name="Message")
    
    # Related objects
    patient = models.ForeignKey(
        Patient, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='notifications'
    )
    doctor = models.ForeignKey(
        Doctor, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='notifications'
    )
    
    is_read = models.BooleanField(default=False, verbose_name="Lu")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.created_at.strftime('%d/%m/%Y %H:%M')}"