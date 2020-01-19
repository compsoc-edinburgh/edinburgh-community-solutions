"""
Django settings for backend project.

Generated by 'django-admin startproject' using Django 3.0.2.

For more information on this file, see
https://docs.djangoproject.com/en/3.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.0/ref/settings/
"""

import os

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.0/howto/deployment/checklist/

DEBUG = os.environ.get('RUNTIME_POSTGRES_DB_USER', 'docker') == 'docker'
IN_ENVIRON = 'RUNTIME_POSTGRES_DB_SERVER' in os.environ

SECRET_KEY = 'VERY SAFE SECRET KEY' if DEBUG else os.environ['RUNTIME_COMMUNITY_SOLUTIONS_SESSION_SECRET']
API_KEY = 'API_KEY' if DEBUG else os.environ['RUNTIME_COMMUNITY_SOLUTIONS_API_KEY']

COMSOL_UPLOAD_FOLDER = 'intermediate_pdf_storage'
COMSOL_EXAM_DIR = 'exams/'
COMSOL_PRINTONLY_DIR = 'printonly/'
COMSOL_SOLUTION_DIR = 'solutions/'
COMSOL_IMAGE_DIR = 'imgs/'
COMSOL_FILESTORE_DIR = 'files/'
COMSOL_EXAM_ALLOWED_EXTENSIONS = {'pdf'}
COMSOL_IMAGE_ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'svg', 'gif'}
COMSOL_FILESTORE_ALLOWED_EXTENSIONS = {'pdf', 'zip', 'tar.gz', 'tar.xz'}
COMSOL_CATEGORY_SLUG_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

ALLOWED_HOSTS = []


# Application definition

INSTALLED_APPS = [
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'answers.apps.AnswersConfig',
    'categories.apps.CategoriesConfig',
    'feedback.apps.FeedbackConfig',
    'filestore.apps.FilestoreConfig',
    'frontend.apps.FrontendConfig',
    'health.apps.HealthConfig',
    'images.apps.ImagesConfig',
    'myauth.apps.MyAuthConfig',
    'notifications.apps.NotificationsConfig',
    'payments.apps.PaymentsConfig',
    'scoreboard.apps.ScoreboardConfig',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

if DEBUG:
    MIDDLEWARE.append('backend.debugging.db_profiling_middleware')

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

LOGGING = {
    'version': 1,
    'disable_existing_loggers': not DEBUG,
    'formatters': {
        'simple': {
            'format': '[{levelname}] {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'simple'
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO' if DEBUG else 'WARNING',
    },
}

WSGI_APPLICATION = 'backend.wsgi.application'


# Database
# https://docs.djangoproject.com/en/3.0/ref/settings/#databases

if IN_ENVIRON:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql_psycopg2',
            'NAME': os.environ['RUNTIME_POSTGRES_DB_NAME'],
            'USER': os.environ['RUNTIME_POSTGRES_DB_USER'],
            'PASSWORD': os.environ['RUNTIME_POSTGRES_DB_PW'],
            'HOST': os.environ['RUNTIME_POSTGRES_DB_SERVER'],
            'PORT': os.environ['RUNTIME_POSTGRES_DB_PORT'],
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.dummy',
        }
    }
    print('Warning: no database configured!')


# Password validation
# https://docs.djangoproject.com/en/3.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = []

AUTHENTICATION_BACKENDS = ['myauth.people_auth.PeopleAuthBackend']

# Internationalization
# https://docs.djangoproject.com/en/3.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = False

USE_L10N = False

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.0/howto/static-files/

STATIC_URL = '/static/'
