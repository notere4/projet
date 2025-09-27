#!/usr/bin/env python
"""
Script to create sample data for the medical practice management system
"""
import os
import sys
import django
from datetime import datetime, timedelta
from django.utils import timezone

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medical_practice.settings')
django.setup()

from django.contrib.auth.models import User
from patients.models import Patient, Doctor
from queue_management.models import QueueItem, Notification


def create_sample_data():
    """Create sample data for testing"""
    
    print("Creating sample users...")
    
    # Create secretary user
    secretary_user, created = User.objects.get_or_create(
        username='secretaire',
        defaults={
            'email': 'secretaire@cabinet.fr',
            'first_name': 'Marie',
            'last_name': 'Dupont',
            'is_staff': True
        }
    )
    if created:
        secretary_user.set_password('password123')
        secretary_user.save()
        print(f"Created secretary user: {secretary_user.username}")
    
    # Create doctor users
    doctor1_user, created = User.objects.get_or_create(
        username='dr.martin',
        defaults={
            'email': 'dr.martin@cabinet.fr',
            'first_name': 'Sophie',
            'last_name': 'Martin',
            'is_staff': True
        }
    )
    if created:
        doctor1_user.set_password('password123')
        doctor1_user.save()
        print(f"Created doctor user: {doctor1_user.username}")
    
    doctor2_user, created = User.objects.get_or_create(
        username='dr.durand',
        defaults={
            'email': 'dr.durand@cabinet.fr',
            'first_name': 'Pierre',
            'last_name': 'Durand',
            'is_staff': True
        }
    )
    if created:
        doctor2_user.set_password('password123')
        doctor2_user.save()
        print(f"Created doctor user: {doctor2_user.username}")
    
    # Create doctor profiles
    doctor1, created = Doctor.objects.get_or_create(
        user=doctor1_user,
        defaults={
            'specialty': 'Médecine Générale',
            'is_available': True
        }
    )
    if created:
        print(f"Created doctor profile: {doctor1}")
    
    doctor2, created = Doctor.objects.get_or_create(
        user=doctor2_user,
        defaults={
            'specialty': 'Médecine Générale',
            'is_available': False
        }
    )
    if created:
        print(f"Created doctor profile: {doctor2}")
    
    print("Creating sample patients...")
    
    # Create sample patients with CIN
    patients_data = [
        {
            'first_name': 'Marie',
            'last_name': 'Dubois',
            'cin': '12345678',
            'date_of_birth': '1985-03-15',
            'phone': '06 12 34 56 78',
            'email': 'marie.dubois@email.com',
            'allergies': 'Pénicilline, Arachides',
            'current_treatments': 'Doliprane 1000mg',
            'last_consultation_reason': 'Grippe saisonnière'
        },
        {
            'first_name': 'Jean',
            'last_name': 'Martin',
            'cin': '87654321',
            'date_of_birth': '1970-07-22',
            'phone': '06 98 76 54 32',
            'email': 'jean.martin@email.com',
            'allergies': '',
            'current_treatments': 'Traitement pour l\'hypertension',
            'last_consultation_reason': 'Contrôle tension'
        },
        {
            'first_name': 'Sophie',
            'last_name': 'Bernard',
            'cin': '11223344',
            'date_of_birth': '1992-11-08',
            'phone': '07 11 22 33 44',
            'email': 'sophie.bernard@email.com',
            'allergies': 'Aspirine',
            'current_treatments': '',
            'last_consultation_reason': 'Consultation de routine'
        },
        {
            'first_name': 'Ahmed',
            'last_name': 'Ben Ali',
            'cin': '55667788',
            'date_of_birth': '1988-05-12',
            'phone': '06 55 66 77 88',
            'email': 'ahmed.benali@email.com',
            'allergies': '',
            'current_treatments': 'Vitamines',
            'last_consultation_reason': 'Mal de dos'
        }
    ]
    
    created_patients = []
    for patient_data in patients_data:
        patient, created = Patient.objects.get_or_create(
            cin=patient_data['cin'],
            defaults=patient_data
        )
        if created:
            print(f"Created patient: {patient}")
        created_patients.append(patient)
    
    print("Creating sample queue items...")
    
    # Create sample queue items
    now = timezone.now()
    
    queue_items_data = [
        {
            'patient': created_patients[0],
            'doctor': doctor1,
            'status': 'waiting',
            'priority': 'normal',
            'arrival_time': now - timedelta(minutes=30),
            'reason': 'Consultation de routine'
        },
        {
            'patient': created_patients[1],
            'doctor': doctor1,
            'status': 'waiting',
            'priority': 'urgent',
            'arrival_time': now - timedelta(minutes=15),
            'reason': 'Douleur thoracique'
        },
        {
            'patient': created_patients[2],
            'doctor': doctor2,
            'status': 'in_consultation',
            'priority': 'normal',
            'arrival_time': now - timedelta(minutes=45),
            'called_time': now - timedelta(minutes=10),
            'reason': 'Suivi médical'
        }
    ]
    
    for queue_data in queue_items_data:
        queue_item, created = QueueItem.objects.get_or_create(
            patient=queue_data['patient'],
            doctor=queue_data['doctor'],
            arrival_time=queue_data['arrival_time'],
            defaults=queue_data
        )
        if created:
            print(f"Created queue item: {queue_item}")
    
    print("Creating sample notifications...")
    
    # Create sample notifications
    notifications_data = [
        {
            'notification_type': 'patient_ready',
            'title': 'Nouveau patient',
            'message': 'Marie Dubois est en attente',
            'patient': created_patients[0],
            'doctor': doctor1,
            'is_read': False
        },
        {
            'notification_type': 'urgent',
            'title': 'Patient urgent',
            'message': 'Jean Martin - Douleur thoracique',
            'patient': created_patients[1],
            'doctor': doctor1,
            'is_read': False
        }
    ]
    
    for notif_data in notifications_data:
        notification, created = Notification.objects.get_or_create(
            title=notif_data['title'],
            patient=notif_data['patient'],
            defaults=notif_data
        )
        if created:
            print(f"Created notification: {notification}")
    
    print("\nSample data created successfully!")
    print("\nLogin credentials:")
    print("Secretary: secretaire@cabinet.fr / password123")
    print("Doctor 1: dr.martin@cabinet.fr / password123")
    print("Doctor 2: dr.durand@cabinet.fr / password123")
    print("Admin: admin@cabinet.fr / admin")
    
    print("\nSample patients with CIN:")
    for patient in created_patients:
        print(f"- {patient.full_name} (CIN: {patient.cin})")


if __name__ == '__main__':
    create_sample_data()