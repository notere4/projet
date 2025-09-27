from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Avg, Count, Q
from datetime import datetime, time

from .models import QueueItem, Notification
from .serializers import (
    QueueItemSerializer, 
    QueueItemCreateSerializer,
    NotificationSerializer,
    QueueStatsSerializer
)


class QueueItemViewSet(viewsets.ModelViewSet):
    """ViewSet for managing queue items"""
    
    queryset = QueueItem.objects.all()
    
    def get_serializer_class(self):
        if self.action in ['create']:
            return QueueItemCreateSerializer
        return QueueItemSerializer

    @action(detail=False, methods=['get'])
    def waiting(self, request):
        """Get patients currently waiting"""
        waiting_items = self.queryset.filter(status='waiting').order_by('priority', 'arrival_time')
        serializer = self.get_serializer(waiting_items, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def in_consultation(self, request):
        """Get patients currently in consultation"""
        in_consultation_items = self.queryset.filter(status='in_consultation')
        serializer = self.get_serializer(in_consultation_items, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def urgent(self, request):
        """Get urgent queue items"""
        urgent_items = self.queryset.filter(priority='urgent', status__in=['waiting', 'in_consultation'])
        serializer = self.get_serializer(urgent_items, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def call_patient(self, request, pk=None):
        """Call patient for consultation"""
        queue_item = self.get_object()
        
        if queue_item.status != 'waiting':
            return Response(
                {'error': 'Le patient n\'est pas en attente'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update queue item
        queue_item.status = 'in_consultation'
        queue_item.called_time = timezone.now()
        queue_item.save()
        
        # Mark doctor as unavailable
        queue_item.doctor.is_available = False
        queue_item.doctor.save()
        
        # Create notification
        Notification.objects.create(
            notification_type='patient_ready',
            title='Patient envoyé en consultation',
            message=f'{queue_item.patient.full_name} a été envoyé chez {queue_item.doctor.full_name}',
            patient=queue_item.patient,
            doctor=queue_item.doctor
        )
        
        serializer = self.get_serializer(queue_item)
        return Response({
            'message': f'{queue_item.patient.full_name} appelé en consultation',
            'queue_item': serializer.data
        })

    @action(detail=True, methods=['post'])
    def complete_consultation(self, request, pk=None):
        """Complete consultation"""
        queue_item = self.get_object()
        
        if queue_item.status != 'in_consultation':
            return Response(
                {'error': 'Le patient n\'est pas en consultation'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update queue item
        queue_item.status = 'completed'
        queue_item.completed_time = timezone.now()
        queue_item.save()
        
        # Mark doctor as available
        queue_item.doctor.is_available = True
        queue_item.doctor.save()
        
        # Create notification
        Notification.objects.create(
            notification_type='doctor_available',
            title='Médecin disponible',
            message=f'{queue_item.doctor.full_name} est maintenant disponible',
            doctor=queue_item.doctor
        )
        
        serializer = self.get_serializer(queue_item)
        return Response({
            'message': 'Consultation terminée avec succès',
            'queue_item': serializer.data
        })

    @action(detail=True, methods=['post'])
    def reassign_doctor(self, request, pk=None):
        """Reassign patient to another doctor"""
        queue_item = self.get_object()
        new_doctor_id = request.data.get('doctor_id')
        
        if not new_doctor_id:
            return Response(
                {'error': 'doctor_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from patients.models import Doctor
            new_doctor = Doctor.objects.get(id=new_doctor_id)
        except Doctor.DoesNotExist:
            return Response(
                {'error': 'Doctor not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        old_doctor = queue_item.doctor
        queue_item.doctor = new_doctor
        queue_item.save()
        
        # Create notification
        Notification.objects.create(
            notification_type='info',
            title='Patient réassigné',
            message=f'{queue_item.patient.full_name} réassigné de {old_doctor.full_name} à {new_doctor.full_name}',
            patient=queue_item.patient,
            doctor=new_doctor
        )
        
        serializer = self.get_serializer(queue_item)
        return Response({
            'message': f'Patient réassigné à {new_doctor.full_name}',
            'queue_item': serializer.data
        })

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get queue statistics"""
        today = timezone.now().date()
        today_start = timezone.make_aware(datetime.combine(today, time.min))
        today_end = timezone.make_aware(datetime.combine(today, time.max))
        
        stats = {
            'waiting_count': self.queryset.filter(status='waiting').count(),
            'in_consultation_count': self.queryset.filter(status='in_consultation').count(),
            'completed_today_count': self.queryset.filter(
                status='completed',
                completed_time__range=[today_start, today_end]
            ).count(),
            'urgent_count': self.queryset.filter(
                priority='urgent',
                status__in=['waiting', 'in_consultation']
            ).count(),
        }
        
        # Calculate average waiting time for completed consultations today
        avg_waiting = self.queryset.filter(
            status='completed',
            completed_time__range=[today_start, today_end]
        ).aggregate(
            avg_wait=Avg('waiting_time_minutes')
        )['avg_wait']
        
        stats['average_waiting_time'] = round(avg_waiting or 0, 1)
        
        serializer = QueueStatsSerializer(stats)
        return Response(serializer.data)


class NotificationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing notifications"""
    
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    ordering = ['-created_at']

    @action(detail=False, methods=['get'])
    def unread(self, request):
        """Get unread notifications"""
        unread_notifications = self.queryset.filter(is_read=False)
        serializer = self.get_serializer(unread_notifications, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark notification as read"""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        
        serializer = self.get_serializer(notification)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read"""
        updated_count = self.queryset.filter(is_read=False).update(is_read=True)
        return Response({
            'message': f'{updated_count} notifications marquées comme lues'
        })