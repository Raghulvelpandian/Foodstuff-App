import os
from django.core.management.base import BaseCommand
from shop.models import User

class Command(BaseCommand):
    help = 'Create the admin account from ADMIN_EMAIL / ADMIN_PASSWORD (/ ADMIN_NAME) if it does not exist. For hosts without a shell.'
    def handle(self, *a, **kw):
        email, pw = (os.environ.get('ADMIN_EMAIL') or '').lower(), os.environ.get('ADMIN_PASSWORD')
        if not email or not pw: return self.stdout.write('ADMIN_EMAIL / ADMIN_PASSWORD not set; skipped.')
        if User.objects.filter(email=email).exists(): return self.stdout.write('Admin already exists; skipped.')
        User.objects.create_superuser(email=email, password=pw, full_name=os.environ.get('ADMIN_NAME', 'Admin'))
        self.stdout.write(self.style.SUCCESS(f'Admin {email} created.'))
