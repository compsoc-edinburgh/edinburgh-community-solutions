"""
Django settings for backend project.

Generated by 'django-admin startproject' using Django 3.0.2.

For more information on this file, see
https://docs.djangoproject.com/en/3.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.0/ref/settings/
"""
import os
import sys

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.0/howto/deployment/checklist/

DEBUG = os.environ.get("RUNTIME_POSTGRES_DB_USER", "docker") == "docker"
IN_ENVIRON = "RUNTIME_POSTGRES_DB_SERVER" in os.environ
TESTING = sys.argv[1:2] == ["test"]
STAGING = os.environ.get("DEPLOYMENT_DOMAIN", "").endswith("svis.ethz.ch")

SECRET_KEY = (
    "VERY SAFE SECRET KEY"
    if DEBUG
    else os.environ["RUNTIME_COMMUNITY_SOLUTIONS_SESSION_SECRET"]
)
API_KEY = "API_KEY" if DEBUG else os.environ["RUNTIME_COMMUNITY_SOLUTIONS_API_KEY"]

COMSOL_UPLOAD_FOLDER = "intermediate_pdf_storage"
COMSOL_EXAM_DIR = "exams/"
COMSOL_PRINTONLY_DIR = "printonly/"
COMSOL_SOLUTION_DIR = "solutions/"
COMSOL_IMAGE_DIR = "imgs/"
COMSOL_FILESTORE_DIR = "files/"
COMSOL_EXAM_ALLOWED_EXTENSIONS = {"pdf"}
COMSOL_IMAGE_ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "svg", "gif"}
COMSOL_FILESTORE_ALLOWED_EXTENSIONS = {"pdf", "zip", "tar.gz", "tar.xz"}
COMSOL_CATEGORY_SLUG_CHARS = (
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
)

COMSOL_FRONTEND_GLOB_ID = os.environ.get("RUNTIME_FRONTEND_GLOB_ID", "vseth-1116-vis")

# The following config settings configure the config with which a keycloak js client instance is
# constructed in the React frontend.
COMSOL_FRONTEND_KEYCLOAK_URL = os.environ.get(
    "RUNTIME_FRONTEND_KEYCLOAK_URL", "https://auth.vseth.ethz.ch/auth"
)
COMSOL_FRONTEND_KEYCLOAK_REALM = os.environ.get(
    "RUNTIME_FRONTEND_KEYCLOAK_REALM", "VSETH"
)
COMSOL_FRONTEND_KEYCLOAK_CLIENT_ID = os.environ.get(
    "RUNTIME_FRONTEND_KEYCLOAK_CLIENT_ID", "vis-community-solutions"
)

# The public / private key path in the testing directory should only be used for unit testing and nothing else
test_public_key = open("testing/jwtRS256.key.pub", "rb").read()
JWT_PUBLIC_KEY = (
    test_public_key
    if TESTING
    else (
        bytes(os.environ["JWT_PUBLIC_KEY"], "utf-8").decode("unicode_escape")
        if "JWT_PUBLIC_KEY" in os.environ
        else b""
    )
)
JWT_VERIFY_SIGNATURE = (
    os.environ.get("JWT_VERIFY_SIGNATURE", "TRUE") != "FALSE" or not DEBUG
)
JWT_RESOURCE_GROUP = "group" if TESTING else os.environ.get("JWT_RESOURCE_GROUP", "")

ALLOWED_HOSTS = []
REAL_ALLOWED_HOSTS = []
if DEBUG:
    ALLOWED_HOSTS.append("localhost")
    REAL_ALLOWED_HOSTS.append("localhost")
else:
    # ALLOWED_HOSTS.append(os.environ['DEPLOYMENT_DOMAIN'])
    # USE_X_FORWARDED_HOST = True
    # In K8s, the host is the IP of the pod and can thus change
    # As we are behind a reverse proxy, it should be fine to ignore this...
    ALLOWED_HOSTS.append("*")
    REAL_ALLOWED_HOSTS.append(os.environ["DEPLOYMENT_DOMAIN"])

CSP_DEFAULT_SRC = "'self'"
if DEBUG:
    CSP_SCRIPT_SRC = (
        "'unsafe-eval'",
        "http://localhost:8080/static/",
        "http://localhost:3000/static/",
    )
else:
    allowed = ["https://{}/static/".format(host) for host in REAL_ALLOWED_HOSTS]
    CSP_SCRIPT_SRC = ("'unsafe-eval'", *allowed)
CSP_STYLE_SRC = (
    "'self'",
    "'unsafe-inline'",
    "https://fonts.googleapis.com",
    "https://static.vseth.ethz.ch",
)
CSP_FONT_SRC = ("'self'", "https://fonts.gstatic.com")
CSP_CONNECT_SRC = (
    "'self'",
    "https://static.vseth.ethz.ch",
    "https://auth.vseth.ethz.ch",
)
CSP_IMG_SRC = ("'self'", "data:", "https://static.vseth.ethz.ch")


# Application definition

INSTALLED_APPS = [
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "answers.apps.AnswersConfig",
    "categories.apps.CategoriesConfig",
    "faq.apps.FaqConfig",
    "feedback.apps.FeedbackConfig",
    "filestore.apps.FilestoreConfig",
    "frontend.apps.FrontendConfig",
    "health.apps.HealthConfig",
    "images.apps.ImagesConfig",
    "myauth.apps.MyAuthConfig",
    "notifications.apps.NotificationsConfig",
    "payments.apps.PaymentsConfig",
    "scoreboard.apps.ScoreboardConfig",
    "testing.apps.TestingConfig",
]

MIDDLEWARE = [
    "myauth.auth_backend.AuthenticationMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "csp.middleware.CSPMiddleware",
    "util.middleware.parse_request_middleware",
]

if (STAGING or DEBUG) and not TESTING:
    MIDDLEWARE.append("backend.debugging.db_profiling_middleware")

ROOT_URLCONF = "backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [os.path.join(BASE_DIR, "templates")],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

LOGGING = {
    "version": 1,
    "disable_existing_loggers": not DEBUG,
    "formatters": {"simple": {"format": "[{levelname}] {message}", "style": "{",},},
    "handlers": {"console": {"class": "logging.StreamHandler", "formatter": "simple"},},
    "root": {
        "handlers": ["console"],
        "level": "INFO" if (DEBUG or STAGING) else "WARNING",
    },
}

WSGI_APPLICATION = "backend.wsgi.application"


# Database
# https://docs.djangoproject.com/en/3.0/ref/settings/#databases

if IN_ENVIRON:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql_psycopg2",
            "NAME": os.environ["RUNTIME_POSTGRES_DB_NAME"],
            "USER": os.environ["RUNTIME_POSTGRES_DB_USER"],
            "PASSWORD": os.environ["RUNTIME_POSTGRES_DB_PW"],
            "HOST": os.environ["RUNTIME_POSTGRES_DB_SERVER"],
            "PORT": os.environ["RUNTIME_POSTGRES_DB_PORT"],
            "OPTIONS": {"sslmode": "disable"},
            "CONN_MAX_AGE": 60,
        }
    }
else:
    DATABASES = {"default": {"ENGINE": "django.db.backends.dummy",}}
    print("Warning: no database configured!")


# Password validation
# https://docs.djangoproject.com/en/3.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = []

AUTHENTICATION_BACKENDS = []

# Internationalization
# https://docs.djangoproject.com/en/3.0/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = False

USE_L10N = False

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.0/howto/static-files/

STATIC_URL = "/static/"
