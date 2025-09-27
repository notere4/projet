from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend

from .models import Patient, Doctor
from .serializers import PatientSerializer, PatientSearchSerializer, DoctorSerializer


class PatientViewSet(viewsets.ModelViewSet):
    """ViewSet for managing patients with CIN search functionality"""
    
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['cin']
    search_fields = ['first_name', 'last_name', 'cin', 'phone']
    ordering_fields = ['last_name', 'first_name', 'created_at']
    ordering = ['last_name', 'first_name']

    def perform_create(self, serializer):
        """Set the created_by field when creating a patient"""
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['get'])
    def search_by_cin(self, request):
        """
        Search patients specifically by CIN
        Usage: GET /api/patients/search_by_cin/?cin=12345678
        """
        cin = request.query_params.get('cin', '')
        
        if not cin:
            return Response(
                {'error': 'Le paramètre CIN est requis'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate CIN format
        import re
        if not re.match(r'^\d{8}$', cin):
            return Response(
                {'error': 'Le CIN doit contenir exactement 8 chiffres'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            patient = Patient.objects.get(cin=cin)
            serializer = self.get_serializer(patient)
            return Response(serializer.data)
        except Patient.DoesNotExist:
            return Response(
                {'error': f'Aucun patient trouvé avec le CIN: {cin}'}, 
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['post'])
    def advanced_search(self, request):
        """
        Advanced search with multiple criteria including CIN
        Usage: POST /api/patients/advanced_search/
        Body: {"cin": "12345678", "name": "Martin", "phone": "06"}
        """
        search_serializer = PatientSearchSerializer(data=request.data)
        
        if not search_serializer.is_valid():
            return Response(
                search_serializer.errors, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        search_data = search_serializer.validated_data
        queryset = Patient.objects.all()
        
        # Filter by CIN if provided
        if search_data.get('cin'):
            queryset = queryset.filter(cin=search_data['cin'])
        
        # Filter by name if provided (search in both first_name and last_name)
        if search_data.get('name'):
            name_query = search_data['name']
            queryset = queryset.filter(
                Q(first_name__icontains=name_query) | 
                Q(last_name__icontains=name_query)
            )
        
        # Filter by phone if provided
        if search_data.get('phone'):
            queryset = queryset.filter(phone__icontains=search_data['phone'])
        
        # Paginate results
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def consultation_history(self, request, pk=None):
        """Get consultation history for a specific patient"""
        patient = self.get_object()
        # This will be implemented when we create the consultations app
        return Response({
            'patient_id': patient.id,
            'patient_name': patient.full_name,
            'consultations': []  # Will be populated from consultations app
        })


class DoctorViewSet(viewsets.ModelViewSet):
    """ViewSet for managing doctors"""
    
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['user__first_name', 'user__last_name', 'specialty']
    ordering_fields = ['user__last_name', 'specialty', 'created_at']
    ordering = ['user__last_name']

    @action(detail=False, methods=['get'])
    def available(self, request):
        """Get only available doctors"""
        available_doctors = self.queryset.filter(is_available=True)
        serializer = self.get_serializer(available_doctors, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def toggle_availability(self, request, pk=None):
        """Toggle doctor availability"""
        doctor = self.get_object()
        doctor.is_available = not doctor.is_available
        doctor.save()
        
        serializer = self.get_serializer(doctor)
        return Response({
            'message': f'Disponibilité mise à jour pour {doctor.full_name}',
            'doctor': serializer.data
        })