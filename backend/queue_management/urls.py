from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QueueItemViewSet, NotificationViewSet

router = DefaultRouter()
router.register(r'', QueueItemViewSet, basename='queue')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),
]