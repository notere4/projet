from rest_framework import serializers
from .models import Consultation, Prescription, ExamRequest
from patients.serializers import PatientSerializer, DoctorSerializer


class PrescriptionSerializer(serializers.ModelSerializer):
    """Serializer for Prescription model"""
    
    class Meta:
        model = Prescription
        fields = ['id', 'medication', 'dosage', 'duration', 'instructions', 'created_at']
        read_only_fields = ['created_at']


class ExamRequestSerializer(serializers.ModelSerializer):
    """Serializer for ExamRequest model"""
    
    class Meta:
        model = ExamRequest
        fields = ['id', 'exam_type', 'description', 'urgent', 'created_at']
        read_only_fields = ['created_at']


class ConsultationSerializer(serializers.ModelSerializer):
    """Serializer for Consultation model"""
    
    patient = PatientSerializer(read_only=True)
    doctor = DoctorSerializer(read_only=True)
    prescriptions = PrescriptionSerializer(many=True, read_only=True)
    exam_requests = ExamRequestSerializer(many=True, read_only=True)
    
    patient_id = serializers.IntegerField(write_only=True)
    doctor_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Consultation
        fields = [
            'id', 'patient', 'doctor', 'patient_id', 'doctor_id',
            'date', 'status', 'observations', 'diagnosis', 'treatment_plan',
            'prescriptions', 'exam_requests', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class ConsultationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating consultations with nested prescriptions and exams"""
    
    prescriptions = PrescriptionSerializer(many=True, required=False)
    exam_requests = ExamRequestSerializer(many=True, required=False)

    class Meta:
        model = Consultation
        fields = [
            'patient', 'doctor', 'date', 'status', 'observations', 
            'diagnosis', 'treatment_plan', 'prescriptions', 'exam_requests'
        ]

    def create(self, validated_data):
        prescriptions_data = validated_data.pop('prescriptions', [])
        exam_requests_data = validated_data.pop('exam_requests', [])
        
        consultation = Consultation.objects.create(**validated_data)
        
        # Create prescriptions
        for prescription_data in prescriptions_data:
            Prescription.objects.create(consultation=consultation, **prescription_data)
        
        # Create exam requests
        for exam_data in exam_requests_data:
            ExamRequest.objects.create(consultation=consultation, **exam_data)
        
        return consultation

    def update(self, instance, validated_data):
        prescriptions_data = validated_data.pop('prescriptions', [])
        exam_requests_data = validated_data.pop('exam_requests', [])
        
        # Update consultation fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update prescriptions (simple approach: delete and recreate)
        if prescriptions_data:
            instance.prescriptions.all().delete()
            for prescription_data in prescriptions_data:
                Prescription.objects.create(consultation=instance, **prescription_data)
        
        # Update exam requests
        if exam_requests_data:
            instance.exam_requests.all().delete()
            for exam_data in exam_requests_data:
                ExamRequest.objects.create(consultation=instance, **exam_data)
        
        return instance