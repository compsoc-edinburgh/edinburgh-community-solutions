from functools import wraps
from django.conf import settings

from util import response

if settings.IN_ENVIRON:
    from myauth.people_auth import get_vis_groups


def check_api_key(request):
    api_key = request.headers.get('X-COMMUNITY-SOLUTIONS-API-KEY')
    return bool(api_key and api_key == settings.API_KEY)


def user_authenticated(request):
    if request.user.is_authenticated:
        return True
    if check_api_key(request):
        return True
    return False


def has_admin_rights(request):
    """
    Check whether the given user should have global admin rights.
    :param username: the user to check
    :return: True iff the user has global admin rights
    """
    if request.session['simulate_nonadmin'] == '1':
        return False
    if check_api_key(request):
        return True
    vis_groups = get_vis_groups(request.user.username)
    return any(("vorstand" == group or "cat" == group or "luk" == group or "serviceaccounts" == group) for group in vis_groups)


def has_admin_rights_for_any_category(request):
    if has_admin_rights(request):
        return True
    return request.user.category_admin_set.exists()


def has_admin_rights_for_category(request, category):
    if has_admin_rights(request):
        return True
    return request.user.category_admin_set.filter(pk=category.pk).exists()


def has_admin_rights_for_exam(request, exam):
    return has_admin_rights_for_category(request, exam.category)


def is_expert_for_category(request, category):
    return request.user.category_expert_set.filter(pk=category.pk).exists()


def is_expert_for_exam(request, exam):
    return is_expert_for_category(request, exam.category)


def require_login(f):
    @wraps(f)
    def wrapper(request, *args, **kwargs):
        if not user_authenticated(request):
            return response.not_allowed()
        return f(request, *args, **kwargs)
    return wrapper


def require_admin(f):
    @wraps(f)
    def wrapper(request, *args, **kwargs):
        if not user_authenticated(request):
            return response.not_allowed()
        if not has_admin_rights(request):
            return response.not_allowed()
        return f(request, *args, **kwargs)
    return wrapper
