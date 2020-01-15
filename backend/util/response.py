from datetime import datetime, timezone, timedelta
from functools import wraps
from django.http import JsonResponse, FileResponse
from django.http import HttpResponseNotAllowed


def args_post(*req_args, optional=False):
    def wrap_func(f):
        @wraps(f)
        def wrapper(request, *args, **kwargs):
            if request.method != 'POST':
                return HttpResponseNotAllowed(['POST'])
            if not optional:
                for arg in req_args:
                    if arg not in request.POST:
                        return missing_argument()
            return f(request, *args, **kwargs)
        return wrapper
    return wrap_func


def args_get(*req_args):
    def wrap_func(f):
        @wraps(f)
        def wrapper(request, *args, **kwargs):
            for arg in req_args:
                if arg not in request.GET:
                    return missing_argument()
            return f(request, *args, **kwargs)
        return wrapper
    return wrap_func


def data_dumper(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    else:
        return obj


def success(**obj):
    return JsonResponse(obj, json_dumps_params={'default': data_dumper})


def not_allowed():
    return JsonResponse({'err': 'Not allowed'}, status=403)


def not_found():
    return JsonResponse({'err': 'Not found'}, status=404)


def not_possible(msg):
    return JsonResponse({"err": msg}, status=400)


def missing_argument():
    return not_possible('Missing argument')


def send_file(file_):
    return FileResponse(open(file_, 'rb'))