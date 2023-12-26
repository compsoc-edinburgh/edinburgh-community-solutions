from django.db.models.expressions import Case, When
from util import response, func_cache
from ediauth import auth_check
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.db.models import Count, F, Q, Value as V
from django.db.models.functions import Concat


def get_user_scores(user, res):
    res.update(
        {
            "score": user.scores.document_likes
            + user.scores.upvotes
            - user.scores.downvotes,
            "score_answers": user.answer_set.count(),
            "score_comments": user.answers_comments.count(),
            "score_cuts": user.answersection_set.count(),
            "score_documents": user.document_set.count(),
        }
    )
    return res


@func_cache.cache(600)
def get_scoreboard_top(scoretype, limit):
    users = User.objects.annotate(
        displayName=Case(
            When(
                Q(first_name__isnull=True),
                "last_name",
            ),
            default=Concat("first_name", V(" "), "last_name"),
        ),
        score=F("scores__document_likes")
        + F("scores__upvotes")
        - F("scores__downvotes"),
        score_answers=F("scores__answers"),
        score_comments=F("scores__comments"),
        score_documents=F("scores__documents"),
        score_cuts=F("scores__cuts"),
    )

    if scoretype == "score":
        users = users.order_by("-score")
    elif scoretype == "score_answers":
        users = users.order_by("-score_answers")
    elif scoretype == "score_comments":
        users = users.order_by("-score_comments")
    elif scoretype == "score_documents":
        users = users.order_by("-score_documents")
    elif scoretype == "score_cuts":
        users = users.order_by("-score_cuts")
    else:
        return response.not_found()

    return list(
        users[:limit].values(
            "username",
            "displayName",
            "score",
            "score_answers",
            "score_comments",
            "score_cuts",
            "score_documents",
        )
    )


@response.request_get()
@auth_check.require_login
def userinfo(request, username):
    user = get_object_or_404(User, username=username)
    res = {
        "username": username,
        "displayName": user.profile.display_username,
    }
    get_user_scores(user, res)
    return response.success(value=res)


@response.request_get()
@auth_check.require_login
def scoreboard_top(request, scoretype):
    limit = int(request.GET.get("limit", "10"))
    return response.success(value=get_scoreboard_top(scoretype, limit))
