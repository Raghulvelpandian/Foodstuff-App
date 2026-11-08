from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from .models import User

class EmailVerificationTokenGenerator(PasswordResetTokenGenerator):
    """Separate salt from password reset; invalid once the email is verified or changed."""
    key_salt = 'shop.tokens.EmailVerificationTokenGenerator'
    def _make_hash_value(self, user, timestamp): return f'{user.pk}{user.email}{user.email_verified}{timestamp}'

verification_token = EmailVerificationTokenGenerator()
def encode_uid(user): return urlsafe_base64_encode(force_bytes(user.pk))
def user_from_uid(uid):
    try: return User.objects.get(pk=force_str(urlsafe_base64_decode(uid)))
    except (TypeError, ValueError, OverflowError, User.DoesNotExist): return None
