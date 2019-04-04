import fcntl
import time
import sys
import server

DB_VERSION = 5
DB_VERSION_KEY = "dbversion"
DB_LOCK_FILE = ".dblock"


def set_db_version(mongo_db, version):
    mongo_db.dbmeta.update_one({"key": DB_VERSION_KEY}, {"$set": {"value": version}})


def init_migration(mongo_db):
    print("Init migration", file=sys.stderr)
    mongo_db.categorymetadata.insert_one({
        "category": "default",
        "admins": []
    })
    mongo_db.dbmeta.insert_one({
        "key": DB_VERSION_KEY,
        "value": 1
    })


def add_downvotes(mongo_db):
    print("Migrate 'add downvotes'", file=sys.stderr)
    sections = mongo_db.answersections.find({}, {"answersection": 1})
    for section in sections:
        for answer in section["answersection"]["answers"]:
            print("Update Answer", answer["_id"], file=sys.stderr)
            mongo_db.answersections.update_one({
                "answersection.answers._id": answer["_id"]
            }, {
                "$set": {"answersection.answers.$.downvotes": []}
            })
    set_db_version(mongo_db, 2)


def add_user_profiles(mongo_db):
    print("Migrate 'add user profiles'", file=sys.stderr)
    sections = mongo_db.answersections.find({}, {"answersection": 1})
    for section in sections:
        for answer in section["answersection"]["answers"]:
            server.adjust_user_score(answer["authorId"], len(answer["upvotes"]) - len(answer["downvotes"]))
    set_db_version(mongo_db, 3)


def add_notifications(mongo_db):
    print("Migrate 'add notifications", file=sys.stderr)
    users = mongo_db.userdata.find({}, {"username": 1})
    for user in users:
        mongo_db.userdata.update_one({
            "username": user["username"]
        }, {
            "$set": {
                "notifications": [],
                "enabled_notifications": [
                    server.NotificationType.NEW_COMMENT_TO_ANSWER.value,
                    server.NotificationType.NEW_ANSWER_TO_ANSWER.value,
                ],
            }
        })
    sections = mongo_db.answersections.find({}, {"filename": 1, "answersection": 1})
    for section in sections:
        for answer in section["answersection"]["answers"]:
            for comment in answer["comments"]:
                if comment["authorId"] != answer["authorId"]:
                    server.send_user_notification(
                        answer["authorId"],
                        server.NotificationType.NEW_COMMENT_TO_ANSWER,
                        comment["authorId"],
                        "New comment",
                        "A new comment to your answer was added.",
                        "/exams/{}#{}".format(section["filename"], answer["_id"])
                    )
    set_db_version(mongo_db, 4)


def add_cutversion(mongo_db):
    print("Migrate 'add cutversion'", file=sys.stderr)
    sections = mongo_db.answersections.find({}, {"_id"})
    for section in sections:
        mongo_db.answersections.update_one({
            "_id": section["_id"]
        }, {
            "$set": {
                "cutVersion": 1
            }
        })
    set_db_version(mongo_db, 5)


MIGRATIONS = [
    init_migration,
    add_downvotes,
    add_user_profiles,
    add_notifications,
    add_cutversion,
]


def migrate(mongo_db):
    open(DB_LOCK_FILE, "a").close()
    meta = mongo_db.dbmeta
    # access all collections to make sure they exist
    answer_sections = mongo_db.answersections
    user_data = mongo_db.userdata
    category_metadata = mongo_db.categorymetadata
    exam_metadata = mongo_db.exammetadata
    image_metadata = mongo_db.imagemetadata
    payments = mongo_db.payments
    feedback = mongo_db.feedback
    # give mongodb time to wake up...
    # it crashes with an authentication failure otherwise, yay!
    time.sleep(2)
    with open(DB_LOCK_FILE, "w") as f:
        fcntl.lockf(f, fcntl.LOCK_EX)
        maybe_version = meta.find_one({
            "key": DB_VERSION_KEY
        })
        version = 0
        if maybe_version:
            version = int(maybe_version["value"])
        print("found db version", version, file=sys.stderr)
        for i in range(DB_VERSION):
            if version <= i:
                MIGRATIONS[i](mongo_db)
        fcntl.lockf(f, fcntl.LOCK_UN)