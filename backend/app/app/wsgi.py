import os
from django.core.wsgi import get_wsgi_application

# Use production settings if DJANGO_SETTINGS_MODULE is not set
if not os.environ.get('DJANGO_SETTINGS_MODULE'):
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings_prod')

application = get_wsgi_application()