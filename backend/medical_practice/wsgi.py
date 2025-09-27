"""
WSGI config for medical_practice project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medical_practice.settings')

application = get_wsgi_application()