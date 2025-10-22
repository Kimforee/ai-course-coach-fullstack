# Use Python 3.11 image with more packages
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Create required directories
RUN mkdir -p /app/staticfiles /app/logs

# Collect static files using development settings (no DB required)
RUN python manage.py collectstatic --noinput --settings=app.settings

# Expose port
EXPOSE 8000

# Create startup script
RUN echo '#!/bin/bash\n\
echo "Setting production environment..."\n\
export DJANGO_SETTINGS_MODULE=app.settings_prod\n\
echo "Testing WSGI configuration..."\n\
python test_wsgi.py\n\
if [ $? -eq 0 ]; then\n\
    echo "WSGI test passed. Starting database check..."\n\
    python check_db.py\n\
    if [ $? -eq 0 ]; then\n\
        echo "Database check passed. Starting Django application..."\n\
        exec gunicorn --bind 0.0.0.0:8000 --workers 3 --timeout 120 wsgi:application\n\
    else\n\
        echo "Database check failed. Exiting..."\n\
        exit 1\n\
    fi\n\
else\n\
    echo "WSGI test failed. Exiting..."\n\
    exit 1\n\
fi' > /app/start.sh && chmod +x /app/start.sh

# Run the application
CMD ["/app/start.sh"]
