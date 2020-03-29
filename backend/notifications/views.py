from util import response
from myauth import auth_check
from myauth.models import get_my_user
from notifications.models import NotificationSetting, Notification, NotificationType
from django.shortcuts import get_object_or_404


@auth_check.require_login
def getenabled(request):
    return response.success(value=list(
        NotificationSetting.objects.filter(
            user=request.user, enabled=True
        ).values_list('type', flat=True)
    ))


@response.args_post('type', 'enabled')
@auth_check.require_login
def setenabled(request):
    type_ = int(request.POST['type'])
    if type_ < 1 or type_ > len(NotificationType.__members__):
        return response.not_possible('Invalid Type')
    setting, _ = NotificationSetting.objects.get_or_create(user=request.user, type=type_)
    setting.enabled = request.POST['enabled'] != 'false'
    setting.save()
    return response.success()


def get_notifications(request, unread):
    notifications = Notification.objects.filter(receiver=request.user).select_related('receiver', 'sender', 'answer', 'answer__answer_section', 'answer__answer_section__exam')
    if unread:
        notifications = notifications.filter(read=False)
    res = [
        {
            'oid': notification.id,
            'receiver': notification.receiver.username,
            'type': notification.type,
            'time': notification.time,
            'sender': notification.sender.username,
            'senderDisplayName': get_my_user(notification.sender).displayname(),
            'title': notification.title,
            'message': notification.text,
            'link': '/exams/{}#{}'.format(notification.answer.answer_section.exam.filename, notification.answer.long_id) if notification.answer else '',
            'read': notification.read,
        } for notification in sorted(
            notifications,
            key=lambda x: x.time
        )
    ]
    return response.success(value=res)


@auth_check.require_login
def unread(request):
    return get_notifications(request, True)


@auth_check.require_login
def unreadcount(request):
    return response.success(value=Notification.objects.filter(receiver=request.user, read=False).count())


@auth_check.require_login
def all(request):
    return get_notifications(request, False)


@response.args_post('read')
@auth_check.require_login
def setread(request, oid):
    notification = get_object_or_404(Notification, pk=oid)
    notification.read = request.POST['read'] != 'false'
    notification.save()
    return response.success()