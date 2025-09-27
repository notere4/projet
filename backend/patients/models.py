from django.db import models
from django.contrib.auth.models import User
import re


class Patient(models.Model):
    """Model for patient information including CIN"""
    
    # Personal Information
    first_name = models.CharField(max_length=100, verbose_name="Prénom")
    last_name = models.CharField(max_length=100, verbose_name="Nom")
    cin = models.CharField(
        max_length=8, 
        unique=True, 
        verbose_name="CIN (Carte d'Identité Nationale)",
        help_text="Format: 12345678 (8 chiffres)"
    )
    date_of_birth = models.DateField(verbose_name="Date de naissance")
    
    # Contact Information
    phone = models.CharField(max_length=20, verbose_name="Téléphone")
    email = models.EmailField(blank=True, null=True, verbose_name="Email")
    address = models.TextField(blank=True, null=True, verbose_name="Adresse")
    
    # Medical Information
    allergies = models.TextField(
        blank=True, 
        null=True, 
        verbose_name="Allergies",
        help_text="Séparer par des virgules"
    )
    current_treatments = models.TextField(
        blank=True, 
        null=True, 
        verbose_name="Traitements en cours",
        help_text="Séparer par des virgules"
    )
    last_consultation_reason = models.TextField(
        blank=True, 
        null=True, 
        verbose_name="Dernier motif de consultation"
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='created_patients'
    )

    class Meta:
        verbose_name = "Patient"
        verbose_name_plural = "Patients"
        ordering = ['last_name', 'first_name']

    def __str__(self):
        return f"{self.first_name} {self.last_name} (CIN: {self.cin})"

    def clean(self):
        """Validate CIN format"""
        from django.core.exceptions import ValidationError
        
        if self.cin and not re.match(r'^\d{8}$', self.cin):
            raise ValidationError({
                'cin': 'Le CIN doit contenir exactement 8 chiffres.'
            })

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def age(self):
        from datetime import date
        today = date.today()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )

    @property
    def allergies_list(self):
        """Return allergies as a list"""
        if self.allergies:
            return [allergy.strip() for allergy in self.allergies.split(',') if allergy.strip()]
        return []

    @property
    def current_treatments_list(self):
        """Return current treatments as a list"""
        if self.current_treatments:
            return [treatment.strip() for treatment in self.current_treatments.split(',') if treatment.strip()]
        return []


class Doctor(models.Model):
    """Model for doctor information"""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    specialty = models.CharField(max_length=100, verbose_name="Spécialité")
    is_available = models.BooleanField(default=True, verbose_name="Disponible")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Médecin"
        verbose_name_plural = "Médecins"

    def __str__(self):
        return f"Dr. {self.user.first_name} {self.user.last_name} - {self.specialty}"

    @property
    def full_name(self):
        return f"Dr. {self.user.first_name} {self.user.last_name}"