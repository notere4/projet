from django.db import models
from patients.models import Patient, Doctor


class Consultation(models.Model):
    """Model for medical consultations"""
    
    STATUS_CHOICES = [
        ('in_progress', 'En cours'),
        ('completed', 'Terminée'),
        ('cancelled', 'Annulée'),
    ]
    
    patient = models.ForeignKey(
        Patient, 
        on_delete=models.CASCADE, 
        related_name='consultations',
        verbose_name="Patient"
    )
    doctor = models.ForeignKey(
        Doctor, 
        on_delete=models.CASCADE, 
        related_name='consultations',
        verbose_name="Médecin"
    )
    
    date = models.DateTimeField(verbose_name="Date de consultation")
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='in_progress',
        verbose_name="Statut"
    )
    
    # Medical information
    observations = models.TextField(
        blank=True, 
        null=True, 
        verbose_name="Observations et Anamnèse"
    )
    diagnosis = models.TextField(
        blank=True, 
        null=True, 
        verbose_name="Diagnostic"
    )
    treatment_plan = models.TextField(
        blank=True, 
        null=True, 
        verbose_name="Plan de traitement"
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Consultation"
        verbose_name_plural = "Consultations"
        ordering = ['-date']

    def __str__(self):
        return f"Consultation {self.patient.full_name} - {self.date.strftime('%d/%m/%Y %H:%M')}"


class Prescription(models.Model):
    """Model for prescriptions within consultations"""
    
    consultation = models.ForeignKey(
        Consultation, 
        on_delete=models.CASCADE, 
        related_name='prescriptions',
        verbose_name="Consultation"
    )
    
    medication = models.CharField(max_length=200, verbose_name="Médicament")
    dosage = models.CharField(max_length=100, verbose_name="Dosage")
    duration = models.CharField(max_length=100, verbose_name="Durée")
    instructions = models.TextField(
        blank=True, 
        null=True, 
        verbose_name="Instructions particulières"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Ordonnance"
        verbose_name_plural = "Ordonnances"

    def __str__(self):
        return f"{self.medication} - {self.dosage}"


class ExamRequest(models.Model):
    """Model for exam requests within consultations"""
    
    consultation = models.ForeignKey(
        Consultation, 
        on_delete=models.CASCADE, 
        related_name='exam_requests',
        verbose_name="Consultation"
    )
    
    exam_type = models.CharField(max_length=200, verbose_name="Type d'examen")
    description = models.TextField(verbose_name="Description")
    urgent = models.BooleanField(default=False, verbose_name="Urgent")
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Demande d'examen"
        verbose_name_plural = "Demandes d'examens"

    def __str__(self):
        urgent_text = " (URGENT)" if self.urgent else ""
        return f"{self.exam_type}{urgent_text}"