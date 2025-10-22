#!/usr/bin/env python
"""
WSGI config for the Django project.
It exposes the WSGI callable as a module-level variable named ``application``.
"""

import os
import sys
from pathlib import Path

# Add the app directory to Python path
app_dir = Path(__file__).resolve().parent / 'app'
sys.path.insert(0, str(app_dir))

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings_prod')

from django.core.wsgi import get_wsgi_application

application = get_wsgi_application()
