from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ConsultationViewSet, PrescriptionViewSet, ExamRequestViewSet

router = DefaultRouter()
router.register(r'', ConsultationViewSet, basename='consultation')
router.register(r'prescriptions', PrescriptionViewSet, basename='prescription')
router.register(r'exam-requests', ExamRequestViewSet, basename='exam-request')

urlpatterns = [
    path('', include(router.urls)),
]