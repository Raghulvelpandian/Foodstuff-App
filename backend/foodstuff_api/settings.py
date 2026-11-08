import os
import sys
from datetime import timedelta
from decimal import Decimal
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse
from dotenv import load_dotenv

try:  # pure-Python MySQL driver: no C build needed, so it installs on Windows, Vercel and Docker
    import pymysql
    pymysql.version_info = (2, 2, 1, 'final', 0)
    pymysql.install_as_MySQLdb()
except ImportError:
    pass

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env')
load_dotenv(BASE_DIR.parent / '.env.local')   # written by `neon env pull` / `neon deploy` (never committed)
load_dotenv(BASE_DIR.parent / '.env')
env = os.environ.get
def csv(name, default=''): return [x.strip() for x in env(name, default).split(',') if x.strip()]

DEBUG = env('DJANGO_DEBUG', '1') == '1'
SECRET_KEY = env('DJANGO_SECRET_KEY') or ('dev-insecure-key-change-me' if DEBUG else None)
if not SECRET_KEY:
    raise RuntimeError('Set DJANGO_SECRET_KEY when DJANGO_DEBUG=0')
# Hosts that announce their public domain automatically (Railway, Render, Vercel)
_PUBLIC = [h for h in (env('RAILWAY_PUBLIC_DOMAIN'), env('RENDER_EXTERNAL_HOSTNAME'), env('VERCEL_URL'), env('VERCEL_PROJECT_PRODUCTION_URL')) if h]
ALLOWED_HOSTS = csv('DJANGO_ALLOWED_HOSTS', 'localhost,127.0.0.1,testserver') + _PUBLIC

INSTALLED_APPS = ['django.contrib.admin', 'django.contrib.auth', 'django.contrib.contenttypes', 'django.contrib.sessions',
                  'django.contrib.messages', 'django.contrib.staticfiles', 'rest_framework', 'corsheaders', 'shop']
MIDDLEWARE = ['django.middleware.security.SecurityMiddleware', 'whitenoise.middleware.WhiteNoiseMiddleware', 'corsheaders.middleware.CorsMiddleware',
              'django.contrib.sessions.middleware.SessionMiddleware', 'django.middleware.common.CommonMiddleware',
              'django.middleware.csrf.CsrfViewMiddleware', 'django.contrib.auth.middleware.AuthenticationMiddleware',
              'django.contrib.messages.middleware.MessageMiddleware', 'django.middleware.clickjacking.XFrameOptionsMiddleware']
ROOT_URLCONF = 'foodstuff_api.urls'
WSGI_APPLICATION = 'foodstuff_api.wsgi.application'
TEMPLATES = [{'BACKEND': 'django.template.backends.django.DjangoTemplates', 'DIRS': [], 'APP_DIRS': True,
              'OPTIONS': {'context_processors': ['django.template.context_processors.request', 'django.contrib.auth.context_processors.auth',
                                                 'django.contrib.messages.context_processors.messages']}}]

def db_from_url(url):
    """DATABASE_URL like postgresql://user:pass@host:5432/name?sslmode=require or mysql://user:pass@host:3306/name"""
    u = urlparse(url); scheme = u.scheme.split('+')[0]; q = parse_qs(u.query)
    engines = {'postgres': 'django.db.backends.postgresql', 'postgresql': 'django.db.backends.postgresql', 'mysql': 'django.db.backends.mysql'}
    if scheme not in engines: raise RuntimeError(f'Unsupported DATABASE_URL scheme: {scheme}')
    opts = {'charset': 'utf8mb4'} if scheme == 'mysql' else ({'sslmode': q['sslmode'][0]} if 'sslmode' in q else {})
    cfg = {'ENGINE': engines[scheme], 'NAME': u.path.lstrip('/'), 'USER': unquote(u.username or ''), 'PASSWORD': unquote(u.password or ''),
           'HOST': u.hostname or '', 'PORT': str(u.port or ''), 'OPTIONS': opts}
    if scheme != 'mysql' and '-pooler' in (u.hostname or ''):
        # Neon pooled connection (PgBouncer, transaction mode): no server-side cursors, no server-side prepared statements
        cfg['DISABLE_SERVER_SIDE_CURSORS'] = True; opts['prepare_threshold'] = None
    return cfg

# Neon: the pooled DATABASE_URL serves normal traffic; schema migrations use the direct DATABASE_URL_UNPOOLED when it is set
_MIGRATING = 'migrate' in sys.argv[1:3]
_DB_URL = (env('DATABASE_URL_UNPOOLED') if _MIGRATING else None) or env('DATABASE_URL')
if _DB_URL:
    DATABASES = {'default': db_from_url(_DB_URL)}
# MySQL is used when DB_ENGINE=mysql, or automatically when the host provides MYSQLHOST (e.g. Railway's MySQL service)
elif env('DB_ENGINE', 'mysql' if env('MYSQLHOST') else 'sqlite') == 'mysql':
    DATABASES = {'default': {'ENGINE': 'django.db.backends.mysql', 'NAME': env('DB_NAME') or env('MYSQLDATABASE') or 'foodstuff', 'USER': env('DB_USER') or env('MYSQLUSER') or 'foodstuff',
                             'PASSWORD': env('DB_PASSWORD') or env('MYSQLPASSWORD') or '', 'HOST': env('DB_HOST') or env('MYSQLHOST') or '127.0.0.1', 'PORT': env('DB_PORT') or env('MYSQLPORT') or '3306',
                             'OPTIONS': {'charset': 'utf8mb4'}}}
else:
    DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': BASE_DIR / 'db.sqlite3'}}

if env('VERCEL') and DATABASES['default']['ENGINE'].endswith('sqlite3'):
    raise RuntimeError('Vercel has no persistent disk. Set DATABASE_URL to an external PostgreSQL or MySQL database.')

AUTH_USER_MODEL = 'shop.User'
AUTH_PASSWORD_VALIDATORS = [{'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
                            {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 8}},
                            {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
                            {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'}]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': ['rest_framework_simplejwt.authentication.JWTAuthentication'],
    'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.AllowAny'],
    'DEFAULT_RENDERER_CLASSES': ['rest_framework.renderers.JSONRenderer'] + (['rest_framework.renderers.BrowsableAPIRenderer'] if DEBUG else []),
    'DEFAULT_THROTTLE_CLASSES': ['rest_framework.throttling.AnonRateThrottle', 'rest_framework.throttling.UserRateThrottle',
                                 'rest_framework.throttling.ScopedRateThrottle'],
    'DEFAULT_THROTTLE_RATES': {'anon': '300/hour', 'user': '1000/hour', 'auth': '20/hour', 'orders': '60/hour', 'contact': '5/hour', 'password_reset': '10/hour', 'verify': '10/hour'},
    'COERCE_DECIMAL_TO_STRING': False,
    'DEFAULT_PAGINATION_CLASS': None,
}
SIMPLE_JWT = {'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30), 'REFRESH_TOKEN_LIFETIME': timedelta(days=7), 'ROTATE_REFRESH_TOKENS': True}
CSRF_TRUSTED_ORIGINS = csv('CSRF_TRUSTED_ORIGINS') + [f'https://{h}' for h in _PUBLIC]
CORS_ALLOWED_ORIGINS = csv('CORS_ALLOWED_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173')

EMAIL_BACKEND = env('EMAIL_BACKEND', 'django.core.mail.backends.console.EmailBackend')
EMAIL_HOST = env('EMAIL_HOST', ''); EMAIL_PORT = int(env('EMAIL_PORT', '587'))
EMAIL_HOST_USER = env('EMAIL_HOST_USER', ''); EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD', '')
EMAIL_USE_TLS = env('EMAIL_USE_TLS', '1') == '1'
DEFAULT_FROM_EMAIL = env('DEFAULT_FROM_EMAIL', 'Foodstuff <no-reply@foodstuff.local>')
CONTACT_RECIPIENT = env('CONTACT_RECIPIENT', '')

# Links in emails point at the website (set SITE_URL to your real domain, e.g. https://foodstuff-pi.vercel.app)
SITE_URL = env('SITE_URL', 'http://localhost:5173').rstrip('/')
PASSWORD_RESET_TIMEOUT = 3600   # reset and verification links expire after 1 hour
# Turn on only after SMTP email works, otherwise nobody can verify and ordering is blocked
REQUIRE_EMAIL_VERIFICATION = env('REQUIRE_EMAIL_VERIFICATION', '0') == '1'

# Business rules (prices are always recalculated on the server)
DELIVERY_FEE = Decimal('2.99'); FREE_DELIVERY_OVER = Decimal('30.00'); PROMO_CODES = {'FRESH10': Decimal('10')}  # code -> percent off


LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Django static files
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# React frontend build directory
FRONTEND_DIST = Path(
    env('FRONTEND_DIST') or BASE_DIR.parent / 'frontend' / 'dist'
)

# Include React assets in Django collectstatic
STATICFILES_DIRS = [FRONTEND_DIST] if FRONTEND_DIST.is_dir() else []

STORAGES = {
    'default': {
        'BACKEND': 'django.core.files.storage.FileSystemStorage'
    },
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedStaticFilesStorage'
    }
}

FRONTEND_DIST = Path(
    env('FRONTEND_DIST') or BASE_DIR.parent / 'frontend' / 'dist'
)

STATICFILES_DIRS = [FRONTEND_DIST] if FRONTEND_DIST.is_dir() else []


if not DEBUG:
    SECURE = env('SECURE_SSL_REDIRECT', '1') == '1'   # set to 0 only for local HTTP testing of a production build
    SECURE_SSL_REDIRECT = SECURE; SESSION_COOKIE_SECURE = SECURE; CSRF_COOKIE_SECURE = SECURE
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    if SECURE: SECURE_HSTS_SECONDS = 31536000
