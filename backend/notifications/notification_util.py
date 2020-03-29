from notifications.models import Notification, NotificationType, NotificationSetting
from answers.models import Answer


def is_notification_enabled(receiver, notification_type):
    return NotificationSetting.objects.filter(user=receiver, type=notification_type.value, enabled=True).exists()


def send_notification(sender, receiver, type_, title, message, answer):
    if sender == receiver:
        return
    if not is_notification_enabled(receiver, type_):
        return
    notification = Notification(
        sender=sender,
        receiver=receiver,
        type=type_.value,
        title=title,
        text=message,
        answer=answer,
    )
    notification.save()


def new_comment_to_answer(answer, new_comment):
    if answer.is_legacy_answer:
        return
    send_notification(
        new_comment.author,
        answer.author,
        NotificationType.NEW_COMMENT_TO_ANSWER,
        'New comment',
        'A new comment to your answer was added.\n\n{}'.format(new_comment.text),
        answer,
    )


def _new_comment_to_comment(old_comment, new_comment):
    send_notification(
        new_comment.author,
        old_comment.author,
        NotificationType.NEW_COMMENT_TO_COMMENT,
        'New comment',
        'A new comment to an answer you commented was added.\n\n{}'.format(new_comment.text),
        old_comment.answer,
    )


def new_comment_to_comment(answer, new_comment):
    done = set()
    for comment in answer.comment_set.all():
        if comment != new_comment and comment.author not in done:
            done.add(comment.author)
            _new_comment_to_comment(comment, new_comment)


def _new_answer_to_answer(old_answer, new_answer):
    if old_answer.is_legacy_answer:
        return
    send_notification(
        new_answer.author,
        old_answer.author,
        NotificationType.NEW_ANSWER_TO_ANSWER,
        'New answer',
        'A new answer was posted to a question you answered.',
        new_answer,
    )


def new_answer_to_answer(new_answer):
    for other_answer in Answer.objects.filter(answer_section=new_answer.answer_section, is_legacy_answer=False):
        if other_answer != new_answer:
            _new_answer_to_answer(other_answer, new_answer)