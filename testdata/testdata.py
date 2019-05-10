#!/usr/bin/env python3

import argparse
import requests


class Client:

    def __init__(self, host, username, password):
        self.host = host
        self.username = username
        self.password = password

    def get(self, path, **kwargs):
        print('GET', self.username, path)
        r = requests.get('http://{}{}'.format(self.host, path), auth=(self.username, self.password), params=kwargs)
        print(r.status_code, r.text)
        return r

    def post(self, path, files=None, **kwargs):
        print('POST', self.username, path, kwargs)
        r = requests.post('http://{}{}'.format(self.host, path), auth=(self.username, self.password), data=kwargs, files=files)
        print(r.status_code, r.text)
        return r


"""
[DONE] @app.route("/api/exam/<filename>/newanswersection", methods=['POST'])
[DONE] @app.route("/api/exam/<filename>/removeanswersection", methods=['POST'])
[DONE] @app.route("/api/exam/<filename>/setlike/<sectionoid>/<answeroid>", methods=['POST'])
[DONE] @app.route("/api/exam/<filename>/addanswer/<sectionoid>", methods=['POST'])
[DONE] @app.route("/api/exam/<filename>/setanswer/<sectionoid>", methods=['POST'])
[DONE] @app.route("/api/exam/<filename>/removeanswer/<sectionoid>", methods=['POST'])
[DONE] @app.route("/api/exam/<filename>/addcomment/<sectionoid>/<answeroid>", methods=['POST'])
@app.route("/api/exam/<filename>/setcomment/<sectionoid>/<answeroid>", methods=['POST'])
@app.route("/api/exam/<filename>/removecomment/<sectionoid>/<answeroid>", methods=['POST'])
@app.route("/api/exam/<filename>/claim", methods=['POST'])
[DONE] @app.route("/api/exam/<filename>/metadata", methods=['POST'])
@app.route("/api/exam/<filename>/markpaymentchecked", methods=['POST'])
[DONE] @app.route("/api/exam/<filename>/remove", methods=['POST'])
[DONE] @app.route("/api/category/add", methods=['POST'])
[DONE] @app.route("/api/category/remove", methods=['POST'])
[DONE] @app.route("/api/category/addadmin", methods=['POST'])
[DONE] @app.route("/api/category/removeadmin", methods=['POST'])
[DONE] @app.route("/api/category/metadata", methods=['POST'])
[DONE] @app.route("/api/metacategory/setorder", methods=['POST'])
[DONE] @app.route("/api/metacategory/addcategory", methods=['POST'])
[DONE] @app.route("/api/metacategory/removecategory", methods=['POST'])
[DONE] @app.route("/api/image/<filename>/remove", methods=['POST'])
[DONE] @app.route("/api/image/<filename>/metadata", methods=['POST'])
[DONE] @app.route("/api/notifications/setenabled", methods=['POST'])
@app.route("/api/notifications/setread", methods=['POST'])
@app.route("/api/payment/pay", methods=['POST'])
@app.route("/api/payment/remove", methods=['POST'])
@app.route("/api/payment/refund", methods=['POST'])
@app.route("/api/feedback/submit", methods=['POST'])
@app.route("/api/feedback/<feedbackid>/flags", methods=['POST'])
[DONE] @app.route("/api/uploadpdf/<pdftype>", methods=['POST'])
[DONE] @app.route("/api/removepdf/<pdftype>", methods=['POST'])
[DONE] @app.route("/api/uploadimg", methods=['POST'])
[CAN NOT TEST] @app.route("/api/printpdf/<filename>", methods=['POST'])
"""


class Creator:

    def __init__(self, host):
        self.host = host
        self.board = [
            Client(host, 'fletchz', '123456abc'),
            Client(host, 'meyee', 'Ub5JBim39HC'),
        ]
        self.cat = [
            Client(host, 'schneij', 'UOmtnC7{\'%G'),
            Client(host, 'kellerju', '1234561'),
        ]
        self.ordinary = [
            Client(host, 'baumanso', 'hLsfTvWz5J'),
            Client(host, 'brunh', 'test'),
            Client(host, 'morica', 'admin666'),
            Client(host, 'mosep', 'schemes gallery busty'),
            Client(host, 'widmjo', 'designed latest wax'),
            Client(host, 'steinewe', '1234561'),
        ]
        self.categories = [
            'Analysis',
            'Algorithmen Und Datenstrukturen',
            'Numerical Methods for CSE',
            'Visual Computing',
        ]

    def all(self):
        self.create_categories()
        self.remove_categories()
        self.add_category_admins()
        self.remove_category_admins()
        self.add_metacategories()
        self.remove_metacategories()
        self.set_notification_settings()
        self.reset_notification_settings()
        self.upload_exams()
        self.upload_images()
        self.add_cuts()
        self.exam_metadata()
        self.add_answers()
        self.upvote_answers()
        self.add_comments()

    def user_info(self):
        for user in self.board + self.cat + self.ordinary:
            user.get('/api/me')

    def create_categories(self):
        for cat in self.categories:
            for i in range(10):
                self.board[0].post(
                    '/api/category/add',
                    category=cat + ' ' + str(i+1),
                )

    def remove_categories(self):
        for cat in self.categories:
            self.cat[1].post(
                '/api/category/remove',
                category=cat + ' 10',
            )

    def add_category_admins(self):
        for cat in self.categories:
            for i in range(6):
                for j in range(2):
                    self.cat[0].post(
                        '/api/category/addadmin',
                        category=cat + ' ' + str(i+1),
                        username=self.ordinary[i % 2 + j * 2].username,
                    )

    def remove_category_admins(self):
        for cat in self.categories:
            self.board[1].post(
                '/api/category/removeadmin',
                category=cat + ' 1',
                username=self.ordinary[0].username,
            )

    def category_metadata(self):
        idx = 0
        for cat in self.categories:
            for i in range(9):
                self.board[0].post(
                    '/api/category/metadata',
                    category=cat + ' ' + str(i+1),
                    semester=["HS", "FS"][idx % 2],
                    form=["written", "oral"][idx % 2],
                    permission="public",
                    remark="This is a test " + str(idx),
                    has_payments=[False, False, False, True][idx % 4],
                    nonsense="nonsense",
                )
                idx += 1

    def add_metacategories(self):
        meta1 = ["Bachelor"] * 6 + ["Master"] * 3
        meta2 = ["Semester " + str(i+1) for i in range(10)]
        for cat in self.categories:
            for i in range(9):
                self.cat[0].post(
                    '/api/metacategory/addcategory',
                    meta1=meta1[i],
                    meta2=meta2[i],
                    category=cat + ' ' + str(i+1),
                )
                self.cat[0].post(
                    '/api/metacategory/addcategory',
                    meta1='Delete Me',
                    meta2='Really!',
                    category=cat + ' ' + str(i+1),
                )
            self.cat[1].post(
                '/api/metacategory/addcategory',
                meta1='General',
                meta2='GESS',
                category=cat + ' 2',
            )
        self.cat[0].post(
            '/api/metacategory/setorder',
            meta1='General',
            order=100,
        )

    def remove_metacategories(self):
        for cat in self.categories:
            for i in range(9):
                self.board[0].post(
                    '/api/metacategory/removecategory',
                    meta1='Delete Me',
                    meta2='Really!',
                    category=cat + ' ' + str(i+1),
                )

    def set_notification_settings(self):
        for lst in self.board, self.cat, self.ordinary:
            lst[1].post(
                '/api/notifications/setenabled',
                enabled=1,
                type=2,
            )
            lst[1].post(
                '/api/notifications/setenabled',
                enabled=0,
                type=3,
            )

    def reset_notification_settings(self):
        for lst in self.board, self.cat, self.ordinary:
            lst[1].post(
                '/api/notifications/setenabled',
                enabled=1,
                type=3,
            )

    def upload_exams(self):
        for cat in self.categories:
            for i in range(9):
                for j in range(6):
                    fil = open('../frontend/public/exam10.pdf', 'rb')
                    r = self.board[j % 2].post(
                        '/api/uploadpdf/exam',
                        files={'file': fil},
                        category=cat + ' ' + str(i+1),
                        displayname='HS ' + str(15+j),
                    )
                    fil.close()
                    rj = r.json()
                    if j in [0, 5]:
                        fil = open('../frontend/public/exam10.pdf', 'rb')
                        self.board[j % 2].post(
                            '/api/uploadpdf/printonly',
                            files={'file': fil},
                            category=cat + ' ' + str(i+1),
                            filename=rj['filename'],
                        )
                        fil.close()
                    if j in [2, 3, 5]:
                        fil = open('../frontend/public/exam10.pdf', 'rb')
                        self.board[j % 2].post(
                            '/api/uploadpdf/solution',
                            files={'file': fil},
                            category=cat + ' ' + str(i+1),
                            filename=rj['filename'],
                        )
                        fil.close()
                    if j == 5:
                        self.cat[1].post(
                            '/api/removepdf/printonly',
                            filename=rj['filename']
                        )
                        self.cat[1].post(
                            '/api/removepdf/solution',
                            filename=rj['filename']
                        )
                        self.cat[0].post(
                            '/api/exam/' + rj['filename'] + '/remove'
                        )

    def upload_images(self):
        for usr in self.board + self.cat:
            for i in range(3):
                fil = open('../frontend/public/static/upvote_orange.svg', 'rb')
                r = usr.post(
                    '/api/uploadimg',
                    files={'file': fil},
                )
                fil.close()
                rj = r.json()
                usr.post(
                    '/api/image/' + rj['filename'] + '/metadata',
                    displayname='Img ' + str(i+1),
                )
                if i == 1:
                    usr.post(
                        '/api/image/' + rj['filename'] + '/remove'
                    )

    def add_cuts(self):
        idx = 0
        usrs = self.cat + self.board
        for cat in self.categories:
            for i in range(4):
                usr = usrs[idx % len(usrs)]
                exams = usr.get(
                    '/api/category/list',
                    category=cat + ' ' + str(i+1),
                ).json()['value']
                for exam in exams[:4]:
                    for j in range(6):
                        for k in range(9):
                            usr = usrs[idx % len(usrs)]
                            r = usr.post(
                                '/api/exam/' + exam['filename'] + '/newanswersection',
                                pageNum=j,
                                relHeight=0.1*k+0.1
                            ).json()['value']
                            if k == 4:
                                usr.post(
                                    '/api/exam/' + exam['filename'] + '/removeanswersection',
                                    oid=r['_id'],
                                )
                            idx += 1

    def exam_metadata(self):
        idx = 0
        usrs = self.cat + self.board
        for cat in self.categories:
            for i in range(9):
                usr = usrs[idx % len(usrs)]
                exams = usr.get(
                    '/api/category/list',
                    category=cat + ' ' + str(i+1),
                ).json()['value']
                for exam in exams:
                    usr.post(
                        '/api/exam/' + exam['filename'] + '/metadata',
                        remark='Remark #' + str(idx),
                        public=True,
                        finished_cuts=idx % 5 == 0,
                        finished_wiki_transfer=idx % 3 == 0,
                    )
                    idx += 1

    def add_answers(self):
        idx = 0
        usrs = self.cat + self.board + self.ordinary
        for cat in self.categories[:1]:
            for i in range(1):
                usr = usrs[idx % len(usrs)]
                exams = usr.get(
                    '/api/category/list',
                    category=cat + ' ' + str(i+1),
                ).json()['value']
                for exam in exams[:1]:
                    cuts = usr.get(
                        '/api/exam/' + exam['filename'] + '/cuts'
                    ).json()['value']
                    for page in cuts:
                        for cut in cuts[page]:
                            for u in usrs:
                                if idx % 5 < 3:
                                    u.post(
                                        '/api/exam/' + exam['filename'] + '/addanswer/' + cut['oid'],
                                    )
                                    u.post(
                                        '/api/exam/' + exam['filename'] + '/setanswer/' + cut['oid'],
                                        text="Answer #" + str(idx) + "\n\n$\\pi = 3.141$",
                                    )
                                    if idx % 5 == 0:
                                        u.post(
                                            '/api/exam/' + exam['filename'] + '/removeanswer/' + cut['oid'],
                                        )
                                idx += 1
                        if idx % 3 == 0:
                            self.cat[1].post(
                                '/api/exam/' + exam['filename'] + '/addanswer/' + cut['oid'],
                                legacyuser=1,
                                )
                            self.cat[1].post(
                                '/api/exam/' + exam['filename'] + '/setanswer/' + cut['oid'],
                                legacyuser=1,
                                text="Legacy Answer #" + str(idx) + "\n\n$\\pi = 3.141$",
                                )

    def upvote_answers(self):
        idx = 0
        usrs = self.cat + self.board + self.ordinary
        for cat in self.categories[:1]:
            for i in range(1):
                usr = usrs[idx % len(usrs)]
                exams = usr.get(
                    '/api/category/list',
                    category=cat + ' ' + str(i+1),
                ).json()['value']
                for exam in exams[:1]:
                    cuts = usr.get(
                        '/api/exam/' + exam['filename'] + '/cuts'
                    ).json()['value']
                    for page in cuts:
                        for cut in cuts[page]:
                            section = usr.get(
                                '/api/exam/' + exam['filename'] + '/answersection/' + cut['oid'],
                            ).json()['value']
                            for answer in section['answersection']['answers']:
                                for u in usrs:
                                    u.post(
                                        '/api/exam/' + exam['filename'] + '/setlike/' + cut['oid'] + '/' + answer['oid'],
                                        like=-1 if idx % 5 == 0 else 1
                                    )
                                    idx += 1

    def add_comments(self):
        idx = 0
        usrs = self.cat + self.board + self.ordinary
        for cat in self.categories[:1]:
            for i in range(1):
                usr = usrs[idx % len(usrs)]
                exams = usr.get(
                    '/api/category/list',
                    category=cat + ' ' + str(i+1),
                ).json()['value']
                for exam in exams[:1]:
                    cuts = usr.get(
                        '/api/exam/' + exam['filename'] + '/cuts'
                    ).json()['value']
                    for page in cuts:
                        for cut in cuts[page]:
                            section = usr.get(
                                '/api/exam/' + exam['filename'] + '/answersection/' + cut['oid'],
                                ).json()['value']
                            for answer in section['answersection']['answers']:
                                for j in range(5):
                                    for u in usrs:
                                        if idx % 7 == 0:
                                            u.post(
                                                '/api/exam/' + exam['filename'] + '/addcomment/' + cut['oid'] + '/' + answer['oid'],
                                                text='Comment #' + str(idx) + '\n\n$\\tau = 6$',
                                            )
                                        idx += 1


def main():
    parser = argparse.ArgumentParser(description='Create testdata by issuing requests to the API.')
    parser.add_argument('--host', default='localhost:8080', help='Host to make requests to.')
    parser.add_argument('method', help='Method to execute')
    args = parser.parse_args()
    creator = Creator(args.host)
    getattr(creator, args.method)()


if __name__ == '__main__':
    main()