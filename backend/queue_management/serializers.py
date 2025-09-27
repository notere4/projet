from rest_framework import serializers
from .models import QueueItem, Notification
from patients.serializers import PatientSerializer, DoctorSerializer


class QueueItemSerializer(serializers.ModelSerializer):
    """Serializer for QueueItem model"""
    
    patient = PatientSerializer(read_only=True)
    doctor = DoctorSerializer(read_only=True)
    waiting_time_minutes = serializers.ReadOnlyField()
    consultation_duration_minutes = serializers.ReadOnlyField()
    
    patient_id = serializers.IntegerField(write_only=True)
    doctor_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = QueueItem
        fields = [
            'id', 'patient', 'doctor', 'patient_id', 'doctor_id',
            'status', 'priority', 'arrival_time', 'called_time', 'completed_time',
            'reason', 'notes', 'waiting_time_minutes', 'consultation_duration_minutes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class QueueItemCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating queue items"""
    
    class Meta:
        model = QueueItem
        fields = [
            'patient', 'doctor', 'status', 'priority', 
            'arrival_time', 'reason', 'notes'
        ]

    def create(self, validated_data):
        # Auto-assign to available doctor if not specified
        if not validated_data.get('doctor'):
            from patients.models import Doctor
            available_doctor = Doctor.objects.filter(is_available=True).first()
            if available_doctor:
                validated_data['doctor'] = available_doctor
        
        return super().create(validated_data)


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification model"""
    
    patient = PatientSerializer(read_only=True)
    doctor = DoctorSerializer(read_only=True)

    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'title', 'message',
            'patient', 'doctor', 'is_read', 'created_at'
        ]
        read_only_fields = ['created_at']


class QueueStatsSerializer(serializers.Serializer):
    """Serializer for queue statistics"""
    
    waiting_count = serializers.IntegerField()
    in_consultation_count = serializers.IntegerField()
    completed_today_count = serializers.IntegerField()
    average_waiting_time = serializers.FloatField()
    urgent_count = serializers.IntegerField()