"""
Django settings for backend project.

Generated by 'django-admin startproject' using Django 3.0.2.

For more information on this file, see
https://docs.djangoproject.com/en/3.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.0/ref/settings/
"""
import os
from base64 import b64encode
import sys
from jwcrypto.jwk import JWKSet, JWK

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.0/howto/deployment/checklist/

DEBUG = os.environ.get("IS_DEBUG", "false").lower() == "true"
SECURE = not DEBUG
IN_ENVIRON = "SIP_POSTGRES_DB_SERVER" in os.environ
TESTING = sys.argv[1:2] == ["test"]

SECRET_KEY = (
    "VERY SAFE SECRET KEY"
    if DEBUG
    else os.environ.get(
        "RUNTIME_COMMUNITY_SOLUTIONS_SESSION_SECRET", "VERY SAFE SECRET KEY"
    )
)
API_KEY = (
    "API_KEY" if DEBUG else os.environ.get(
        "RUNTIME_COMMUNITY_SOLUTIONS_API_KEY", "")
)
DEFAULT_AUTO_FIELD = "django.db.models.AutoField"

COMSOL_UPLOAD_FOLDER = "intermediate_pdf_storage"
COMSOL_EXAM_DIR = "exams/"
COMSOL_PRINTONLY_DIR = "printonly/"
COMSOL_SOLUTION_DIR = "solutions/"
COMSOL_DOCUMENT_DIR = "documents/"
COMSOL_IMAGE_DIR = "imgs/"
COMSOL_FILESTORE_DIR = "files/"
COMSOL_EXAM_ALLOWED_EXTENSIONS = {"pdf"}
COMSOL_DOCUMENT_ALLOWED_EXTENSIONS = {
    (".pdf", "application/pdf"),
    (".tex", "application/x-tex"),
    (".tex", "text/x-tex"),
    (".md", "application/octet-stream"),
    (".md", "text/markdown"),
    (".md", "text/x-markdown"),
    (".txt", "text/plain"),
    (".zip", "application/zip"),
    (".zip", "application/octet-stream"),
    (".zip", "multipart/x-zip"),
    (".zip", "application/zip-compressed"),
    (".zip", "application/x-zip-compressed"),
    (".apkg", "application/octet-stream"),  # anki
    (".colpkg", "application/octet-stream"),  # anki collection
}
COMSOL_IMAGE_ALLOWED_EXTENSIONS = {
    "jfif", "jpg", "jpeg", "png", "svg", "gif", "webp"}
COMSOL_FILESTORE_ALLOWED_EXTENSIONS = {"pdf", "zip", "tar.gz", "tar.xz"}
COMSOL_CATEGORY_SLUG_CHARS = (
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
)
COMSOL_DOCUMENT_SLUG_CHARS = (
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-"
)

COMSOL_FRONTEND_GLOB_ID = os.environ.get(
    "FRONTEND_GLOB_ID", "") or "vseth-1116-vis"

# The following config settings configure the config with which a keycloak js client instance is
# constructed in the React frontend.
COMSOL_FRONTEND_KEYCLOAK_URL = os.environ.get(
    "FRONTEND_KEYCLOAK_URL", "https://auth.vseth.ethz.ch/auth"
)
COMSOL_FRONTEND_KEYCLOAK_REALM = os.environ.get(
    "FRONTEND_KEYCLOAK_REALM", "VSETH")
COMSOL_FRONTEND_KEYCLOAK_CLIENT_ID = os.environ.get(
    "SIP_AUTH_OIDC_CLIENT_ID", "vis-community-solutions"
)
FRONTEND_SERVER_DATA = {
    "title_prefix": os.environ.get("FRONTEND_TITLE_PREFIX", ""),
    "title_suffix": os.environ.get("FRONTEND_TITLE_SUFFIX", ""),
    "email_address": os.environ.get("FRONTEND_EMAIL_ADDRESS", ""),
    "imprint": os.environ.get("FRONTEND_IMPRINT", ""),
    "unlock_deposit_notice": os.environ.get("FRONTEND_UNLOCK_DEPOSIT_NOTICE", ""),
    "privacy_policy": os.environ.get("FRONTEND_PRIVACY_POLICY", "")
    or "https://account.vseth.ethz.ch/privacy",
}

FAVICON_URL = os.environ.get("FRONTEND_FAVICON_URL", "/favicon.ico")
IS_PREVIEW = os.environ.get("PDEP_IS_PREVIEW", "") == "TRUE"


# The public / private key path in the testing directory should only be used for unit testing and nothing else
# During testing we use the public / private key pair located in the testing directory
# We convert it from pem to a data_url so that even while testing the jwk is loaded from an url
test_pub_key_data = open("testing/jwtRS256.key.pub", "rb").read()
test_key = JWK()
test_key.import_from_pem(test_pub_key_data)
key_data = JWKSet(keys=test_key).export(private_keys=False)
pub_key_set_url = "data:text/plain;base64," + b64encode(
    key_data.encode("utf-8")
).decode("utf-8")

OAUTH2_CLIENT_ID = os.environ.get("SIP_AUTH_OIDC_CLIENT_ID", "")
OAUTH2_CLIENT_SECRET = os.environ.get("SIP_AUTH_OIDC_CLIENT_SECRET", "")
OAUTH2_TOKEN_URL = os.environ.get("SIP_AUTH_OIDC_TOKEN_ENDPOINT", "")
OAUTH2_AUTH_URL = os.environ.get("SIP_AUTH_OIDC_AUTH_ENDPOINT", "")

OIDC_JWKS_URL = (
    pub_key_set_url
    if TESTING
    else os.environ.get(
        "SIP_AUTH_OIDC_JWKS_URL",
        "https://auth.vseth.ethz.ch/auth/realms/VSETH/protocol/openid-connect/certs",
    )
)
JWT_VERIFY_SIGNATURE = (
    os.environ.get("RUNTIME_JWT_VERIFY_SIGNATURE",
                   "TRUE") != "FALSE" or not DEBUG
)
JWT_RESOURCE_GROUP = (
    "group" if TESTING else os.environ.get("SIP_AUTH_OIDC_CLIENT_ID", "")
)

CNAMES = os.environ.get("SIP_INGRESS_HTTP_DEFAULT_CNAMES", "")
PRIMARY_DEPLOYMENT_DOMAIN = os.environ.get(
    "SIP_INGRESS_HTTP_DEFAULT_DEPLOYMENT_DOMAIN", ""
)
DEPLOYMENT_DOMAINS = [PRIMARY_DEPLOYMENT_DOMAIN] + (
    [] if CNAMES == "" else CNAMES.split(" ")
)
BANNED_USERS = os.environ.get("BANNED_USERS", "").split(",")

ALLOWED_HOSTS = []
REAL_ALLOWED_HOSTS = []
if DEBUG:
    ALLOWED_HOSTS.append("localhost")
    REAL_ALLOWED_HOSTS.append("localhost")
else:
    # ALLOWED_HOSTS.append(os.environ['SIP_INGRESS_HTTP_DEFAULT_DEPLOYMENT_DOMAIN'])
    # USE_X_FORWARDED_HOST = True
    # In K8s, the host is the IP of the pod and can thus change
    # As we are behind a reverse proxy, it should be fine to ignore this...
    ALLOWED_HOSTS.append("*")
    REAL_ALLOWED_HOSTS = DEPLOYMENT_DOMAINS

CSP_DEFAULT_SRC = "'self'"
allowed_script_sources = []
if DEBUG:
    allowed_script_sources = [f"http://{host}:8080/static/"
               for host in REAL_ALLOWED_HOSTS]
else:
    allowed_script_sources = [f"https://{host}/static/"
               for host in REAL_ALLOWED_HOSTS]
CSP_SCRIPT_SRC = ("'unsafe-eval'", *allowed_script_sources)
CSP_STYLE_SRC = (
    "'self'",
    "'unsafe-inline'",
    "https://fonts.googleapis.com",
    "https://static.vseth.ethz.ch",
)
CSP_FONT_SRC = ("'self'", "https://fonts.gstatic.com")

s3_host = os.environ.get("SIP_S3_FILES_HOST", "s3")
s3_port = os.environ.get("SIP_S3_FILES_PORT", "9000")
CSP_CONNECT_SRC = (
    "'self'",
    "https://static.vseth.ethz.ch",
    "https://auth.vseth.ethz.ch",
    "https://" + s3_host + ":" + s3_port,
    "http://" + s3_host + ":" + s3_port,
)
CSP_IMG_SRC = ("'self'", "data:", "https://static.vseth.ethz.ch")


# Application definition

INSTALLED_APPS = [
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.postgres",
    "answers.apps.AnswersConfig",
    "documents.apps.DocumentsConfig",
    "categories.apps.CategoriesConfig",
    "faq.apps.FaqConfig",
    "feedback.apps.FeedbackConfig",
    "filestore.apps.FilestoreConfig",
    "frontend.apps.FrontendConfig",
    "health.apps.HealthConfig",
    "images.apps.ImagesConfig",
    "myauth.apps.MyAuthConfig",
    "util.apps.UtilConfig",
    "notifications.apps.NotificationsConfig",
    "payments.apps.PaymentsConfig",
    "scoreboard.apps.ScoreboardConfig",
    "testing.apps.TestingConfig",
    "django_probes",
]

MIDDLEWARE = [
    "django_prometheus.middleware.PrometheusBeforeMiddleware",
    "myauth.auth_backend.AuthenticationMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "csp.middleware.CSPMiddleware",
    "util.middleware.parse_request_middleware",
    "django_prometheus.middleware.PrometheusAfterMiddleware",
]

if DEBUG and not TESTING:
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
    "formatters": {
        "simple": {
            "format": "[{levelname}] {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {"class": "logging.StreamHandler", "formatter": "simple"},
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO" if DEBUG else "WARNING",
    },
}

WSGI_APPLICATION = "backend.wsgi.application"


# Database
# https://docs.djangoproject.com/en/3.0/ref/settings/#databases

if "SIP_POSTGRES_DB_NAME" in os.environ:
    DATABASES = {
        "default": {
            "ENGINE": "django_prometheus.db.backends.postgresql",
            "NAME": os.environ["SIP_POSTGRES_DB_NAME"],
            "USER": os.environ["SIP_POSTGRES_DB_USER"],
            "PASSWORD": os.environ["SIP_POSTGRES_DB_PW"],
            "HOST": os.environ["SIP_POSTGRES_DB_SERVER"],
            "PORT": os.environ["SIP_POSTGRES_DB_PORT"],
            "OPTIONS": {"sslmode": "disable"},
            "CONN_MAX_AGE": 60,
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.dummy",
        }
    }
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
