from util import response, minio_util
from filestore.models import Attachment
from categories.models import Category
from answers.models import Exam
from myauth import auth_check
from django.conf import settings
from django.shortcuts import get_object_or_404


@response.args_post('displayname')
@response.args_post('category', 'exam', optional=True)
@auth_check.require_admin
def upload(request):
    file = request.FILES.get('file')
    if not file:
        return response.missing_argument()
    ext = minio_util.check_filename(file.name, settings.COMSOL_FILESTORE_ALLOWED_EXTENSIONS)
    if not ext:
        return response.not_possible('Invalid File Extension')
    filename = minio_util.generate_filename(16, settings.COMSOL_FILESTORE_DIR, '.' + ext)
    att = Attachment(filename=filename, displayname=request.POST['displayname'])
    if 'category' in request.POST:
        att.category = get_object_or_404(Category, slug=request.POST['category'])
    elif 'exam' in request.POST:
        att.exam = get_object_or_404(Exam, filename=request.POST['exam'])
    else:
        return response.missing_argument()
    att.save()
    minio_util.save_uploaded_file_to_minio(settings.COMSOL_FILESTORE_DIR, filename, file)
    return response.success(filename=filename)


@auth_check.require_admin
def remove(request, filename):
    att = get_object_or_404(Attachment, filename=filename)
    att.delete()
    import logging
    logging.info(att)
    minio_util.delete_file(settings.COMSOL_FILESTORE_DIR, filename)
    return response.success()


@auth_check.require_login
def get(request, filename):
    get_object_or_404(Attachment, filename=filename)
    return minio_util.send_file(settings.COMSOL_FILESTORE_DIR, filename, attachment_filename=filename)
