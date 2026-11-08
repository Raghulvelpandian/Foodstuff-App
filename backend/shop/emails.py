import logging
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import EmailMessage
from .tokens import encode_uid, verification_token

log = logging.getLogger(__name__)

def _send(to, subject, body):
    try: EmailMessage(subject=subject, body=body, from_email=settings.DEFAULT_FROM_EMAIL, to=[to]).send(fail_silently=False); return True
    except Exception: log.exception('Email to %s failed', to); return False   # never break the request because email is down

def send_verification_email(user):
    link = f"{settings.SITE_URL}/verify-email?uid={encode_uid(user)}&token={verification_token.make_token(user)}"
    return _send(user.email, 'Verify your Foodstuff email', f"Hi {user.full_name},\n\nConfirm your email address to finish setting up your account:\n{link}\n\nThis link expires in 1 hour. If you did not create an account, ignore this email.\n")

def send_password_reset_email(user):
    link = f"{settings.SITE_URL}/reset-password?uid={encode_uid(user)}&token={default_token_generator.make_token(user)}"
    return _send(user.email, 'Reset your Foodstuff password', f"Hi {user.full_name},\n\nUse this link to choose a new password:\n{link}\n\nThe link expires in 1 hour and works once. If you did not ask for this, ignore this email; your password is unchanged.\n")
