from myauth.models import get_my_user
from myauth import auth_check


def get_answer_response(request, answer):
    exam_admin = auth_check.has_admin_rights_for_exam(request, answer.answer_section.exam)
    comments = [
        {
            'oid': comment.id,
            'longId': comment.long_id,
            'text': comment.text,
            'authorId': comment.author.username,
            'authorDisplayName': get_my_user(comment.author).displayname(),
            'canEdit': comment.author == request.user,
            'time': comment.time,
            'edittime': comment.edittime,
        } for comment in sorted(
            answer.comment_set.all(),
            key=lambda x: (x.time, x.id)
        )
    ]
    return {
        'oid': answer.id,
        'longId': answer.long_id,
        'upvotes': answer.upvotes.count() - answer.downvotes.count(),
        'expertvotes': answer.expertvotes.count(),
        'authorId': '' if answer.is_legacy_answer else answer.author.username,
        'authorDisplayName': 'Old VISki Solution' if answer.is_legacy_answer else get_my_user(answer.author).displayname(),
        'canEdit': answer.author == request.user or (answer.is_legacy_answer and exam_admin),
        'isUpvoted': answer.upvotes.filter(pk=request.user.pk).exists(),
        'isDownvoted': answer.downvotes.filter(pk=request.user.pk).exists(),
        'isExpertVoted': answer.expertvotes.filter(pk=request.user.pk).exists(),
        'isFlagged': answer.flagged.filter(pk=request.user.pk).exists(),
        'flagged': answer.flagged.count(),
        'comments': comments,
        'text': answer.text,
        'time': answer.time,
        'edittime': answer.edittime,
        'filename': answer.answer_section.exam.filename,
        'sectionId': answer.answer_section.id,
        'isLegacyAnswer': answer.is_legacy_answer,
    }


def get_answersection_response(request, section):
    answers = [
        get_answer_response(request, answer)
        for answer in sorted(
            section.answer_set.all(),
            key=lambda x: (-x.expertvotes.count(), x.downvotes.count() - x.upvotes.count(), x.time)
        )
    ]
    return {
        'oid': section.id,
        'answers': answers,
        'allow_new_answer': not section.answer_set.filter(author=request.user).exists(),
        'allow_new_legacy_answer': not section.answer_set.filter(is_legacy_answer=True).exists(),
        'cutVersion': section.cut_version,
    }


def increase_section_version(section):
    section.cut_version += 1
    section.save()
