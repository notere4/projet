from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

from .models import Consultation, Prescription, ExamRequest
from .serializers import (
    ConsultationSerializer, 
    ConsultationCreateSerializer,
    PrescriptionSerializer, 
    ExamRequestSerializer
)


class ConsultationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing consultations"""
    
    queryset = Consultation.objects.all()
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'patient', 'doctor']
    ordering_fields = ['date', 'created_at']
    ordering = ['-date']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ConsultationCreateSerializer
        return ConsultationSerializer

    @action(detail=False, methods=['get'])
    def in_progress(self, request):
        """Get consultations currently in progress"""
        in_progress_consultations = self.queryset.filter(status='in_progress')
        serializer = self.get_serializer(in_progress_consultations, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_patient(self, request):
        """Get consultations for a specific patient"""
        patient_id = request.query_params.get('patient_id')
        
        if not patient_id:
            return Response(
                {'error': 'patient_id parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        consultations = self.queryset.filter(patient_id=patient_id)
        serializer = self.get_serializer(consultations, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark consultation as completed"""
        consultation = self.get_object()
        consultation.status = 'completed'
        consultation.save()
        
        # Mark doctor as available
        consultation.doctor.is_available = True
        consultation.doctor.save()
        
        serializer = self.get_serializer(consultation)
        return Response({
            'message': 'Consultation terminée avec succès',
            'consultation': serializer.data
        })

    @action(detail=True, methods=['post'])
    def add_prescription(self, request, pk=None):
        """Add a prescription to the consultation"""
        consultation = self.get_object()
        serializer = PrescriptionSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(consultation=consultation)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def add_exam_request(self, request, pk=None):
        """Add an exam request to the consultation"""
        consultation = self.get_object()
        serializer = ExamRequestSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(consultation=consultation)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PrescriptionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing prescriptions"""
    
    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['consultation']


class ExamRequestViewSet(viewsets.ModelViewSet):
    """ViewSet for managing exam requests"""
    
    queryset = ExamRequest.objects.all()
    serializer_class = ExamRequestSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['consultation', 'urgent']
    ordering_fields = ['created_at', 'urgent']
    ordering = ['-urgent', '-created_at']

    @action(detail=False, methods=['get'])
    def urgent(self, request):
        """Get urgent exam requests"""
        urgent_exams = self.queryset.filter(urgent=True)
        serializer = self.get_serializer(urgent_exams, many=True)
        return Response(serializer.data)