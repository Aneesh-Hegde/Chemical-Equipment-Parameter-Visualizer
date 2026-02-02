import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User

# Check if admin exists
user = User.objects.filter(username='admin').first()
if user:
    print(f"User 'admin' exists: True")
    print(f"Can authenticate with 'admin123': {user.check_password('admin123')}")
else:
    print("User 'admin' does not exist. Creating...")
    user = User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print(f"Created user: {user.username}")
