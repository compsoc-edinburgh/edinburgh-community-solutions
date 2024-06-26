import datetime
import logging

from django.conf import settings
from django.contrib.auth.models import User
from django.test import Client, TestCase
from django.test.client import BOUNDARY, MULTIPART_CONTENT, encode_multipart
from http.cookies import SimpleCookie
import jwt

from answers.models import Answer, AnswerSection, Comment, Exam, ExamType
from categories.models import Category


def get_token(user):
    jwt_claims = {
        "uun": user["username"],
        "email": user["username"] + "@sms.ed.ac.uk",
        "exp": datetime.datetime.now(datetime.timezone.utc)
        + datetime.timedelta(weeks=4),
        "admin": user["admin"],
    }

    token = jwt.encode(
        jwt_claims,
        settings.JWT_PRIVATE_KEY,
        algorithm="RS256",
    )

    return token


class ComsolTest(TestCase):
    loginUsers = [
        {
            "sub": "42",
            "username": "schneij",
            "given_name": "Jonas",
            "family_name": "Schneider",
            "admin": True,
            "displayname": "schneij",
        },
        {
            "sub": "42-1",
            "username": "fletchz",
            "given_name": "Zoe",
            "family_name": "Fletcher",
            "admin": True,
            "displayname": "fletchz",
        },
        {
            "sub": "42-2",
            "username": "morica",
            "given_name": "Carla",
            "family_name": "Morin",
            "admin": False,
            "displayname": "morica",
        },
    ]
    loginUser = 0
    user = {}
    test_http_methods = True

    def get(self, path, status_code=200, test_post=True, as_json=True):
        if self.user:
            self.client.cookies = SimpleCookie({"access_token": get_token(self.user)})
        else:
            self.client.cookies = SimpleCookie()

        if test_post and self.test_http_methods:
            response = self.client.post(path)
            self.assertEqual(response.status_code, 405)
        response = self.client.get(path)
        self.assertEqual(response.status_code, status_code)
        if as_json:
            return response.json()
        return response

    def post(self, path, args, status_code=200, test_get=True, as_json=True):
        if self.user:
            self.client.cookies = SimpleCookie({"access_token": get_token(self.user)})
        else:
            self.client.cookies = SimpleCookie()

        if test_get and self.test_http_methods:
            response = self.client.get(path)
            self.assertEqual(response.status_code, 405)
        for arg in args:
            if isinstance(args[arg], bool):
                args[arg] = "true" if args[arg] else "false"
        response = self.client.post(path, args)
        self.assertEqual(response.status_code, status_code)
        if as_json:
            return response.json()
        return response

    def put(self, path, args, status_code=200, as_json=True):
        if self.user:
            self.client.cookies = SimpleCookie({"access_token": get_token(self.user)})
        else:
            self.client.cookies = SimpleCookie()

        for arg in args:
            if isinstance(args[arg], bool):
                args[arg] = "true" if args[arg] else "false"
        response = self.client.put(
            path,
            encode_multipart(BOUNDARY, args),
            content_type=MULTIPART_CONTENT,
        )
        self.assertEqual(response.status_code, status_code)
        if as_json:
            return response.json()
        return response

    def delete(self, path, status_code=200, as_json=True):
        if self.user:
            self.client.cookies = SimpleCookie({"access_token": get_token(self.user)})
        else:
            self.client.cookies = SimpleCookie()

        response = self.client.delete(path)
        self.assertEqual(response.status_code, status_code)
        if as_json:
            return response.json()
        return response

    def get_my_user(self):
        return User.objects.get(username=self.user["username"])

    def setUp(self, call_my_setup=True):
        logger = logging.getLogger("django.request")
        logger.setLevel(logging.ERROR)

        self.client = Client()
        if self.loginUser >= 0:
            self.user = self.loginUsers[self.loginUser]
            r = self.get("/api/auth/me/")
        if call_my_setup:
            self.mySetUp()

    def mySetUp(self):
        pass

    def tearDown(self):
        self.myTearDown()

    def myTearDown(self):
        pass


class ComsolTestExamData(ComsolTest):
    add_sections = True
    add_answers = True
    add_comments = True

    def setUp(self, call_my_setup=True):
        super(ComsolTestExamData, self).setUp(call_my_setup=False)
        saved = self.user
        for user in self.loginUsers:
            self.user = user
            self.get("/api/notification/unreadcount/")
        self.user = saved

        self.category = Category(
            displayname="Test Category",
            slug="TestCategory",
        )
        self.category.save()

        self.exam = Exam(
            filename="abc.pdf",
            displayname="Test Displayname",
            category=self.category,
            exam_type=ExamType.objects.get(displayname="Exams"),
            remark="Test Remark",
            resolve_alias="resolve.pdf",
            public=True,
            finished_cuts=True,
        )
        self.exam.save()
        self.sections = []
        self.answers = []
        self.comments = []
        if not self.add_sections:
            return
        for i in range(1, 5):
            self.sections.append(
                AnswerSection(
                    exam=self.exam,
                    author=self.get_my_user(),
                    page_num=1,
                    rel_height=0.25 * i,
                    name="Aufgabe " + str(i),
                )
            )
        for section in self.sections:
            section.save()
            if not self.add_answers:
                continue
            for i in range(3):
                self.answers.append(
                    Answer(
                        answer_section=section,
                        author=User.objects.get(
                            username=self.loginUsers[i]["username"]
                        ),
                        text="Test Answer {}/{}".format(section.id, i),
                    )
                )
        for answer in self.answers:
            answer.save()
            if not self.add_comments:
                continue
            for i in range(3):
                self.comments.append(
                    Comment(
                        answer=answer,
                        author=User.objects.get(
                            username=self.loginUsers[i]["username"]
                        ),
                        text="Comment {}/{}".format(answer.id, i),
                    )
                )
        for comment in self.comments:
            comment.save()

        if call_my_setup:
            self.mySetUp()


class ComsolTestExamsData(ComsolTest):
    def setUp(self, call_my_setup=True):
        super(ComsolTestExamsData, self).setUp(call_my_setup=False)
        self.category = Category(
            displayname="Test Category",
            slug="TestCategory",
        )
        self.category.save()
        self.exams = []
        for i in range(3):
            self.exams.append(
                Exam(
                    filename="test{}.pdf".format(i),
                    category=self.category,
                    displayname="test{}".format(i),
                    exam_type=ExamType.objects.get(displayname="Exams"),
                    finished_cuts=True,
                    public=True,
                )
            )
        for exam in self.exams:
            exam.save()

        if call_my_setup:
            self.mySetUp()
