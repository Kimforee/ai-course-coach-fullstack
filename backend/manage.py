#!/usr/bin/env python
import os, sys
from pathlib import Path

def main():
    # Add the app directory to Python path
    app_dir = Path(__file__).resolve().parent / 'app'
    sys.path.insert(0, str(app_dir))
    
    os.environ.setdefault('DJANGO_SETTINGS_MODULE','app.settings')
    from django.core.management import execute_from_command_line
    execute_from_command_line(sys.argv)
if __name__=='__main__':
    main()
