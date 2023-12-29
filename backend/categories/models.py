from django.db import models


class Category(models.Model):
    displayname = models.CharField(max_length=256)
    slug = models.CharField(max_length=256, unique=True)
    form = models.CharField(
        max_length=256, choices=[(x, x) for x in ["written", "oral"]], default="written"
    )
    remark = models.TextField(default="")
    semester = models.CharField(
        max_length=10,
        choices=[(x, x) for x in ["--", "Semester 1", "Semester 2", "Full Year"]],
        default="--",
    )
    permission = models.CharField(
        max_length=64,
        choices=[(x, x) for x in ["public", "internal", "hidden", "none"]],
        default="public",
    )
    more_exams_link = models.CharField(max_length=512, default="")
    admins = models.ManyToManyField("auth.User", related_name="category_admin_set")
    experts = models.ManyToManyField("auth.User", related_name="category_expert_set")
    meta_categories = models.ManyToManyField(
        "MetaCategory", related_name="category_set"
    )

    def answer_progress(self):
        if self.meta.total_cuts == 0:
            return 0
        return self.meta.answered_cuts / self.meta.total_cuts


class CategoryMetaData(models.Model):
    category = models.OneToOneField(
        "Category", related_name="meta", on_delete=models.DO_NOTHING
    )
    # number of exams that are public
    examcount_public = models.IntegerField()
    # number of exams that are public and have at least one answer
    examcount_answered = models.IntegerField()
    # number of cuts in public exams
    total_cuts = models.IntegerField()
    # number of cuts in public exams that have at least one answer
    answered_cuts = models.IntegerField()

    class Meta:
        managed = False


class ExamCounts(models.Model):
    exam = models.OneToOneField(
        "answers.Exam", related_name="counts", on_delete=models.DO_NOTHING
    )

    count_cuts = models.IntegerField()
    count_answered = models.IntegerField()

    class Meta:
        managed = False


class MetaCategory(models.Model):
    displayname = models.CharField(max_length=256)
    parent = models.ForeignKey("MetaCategory", null=True, on_delete=models.CASCADE)
    order = models.IntegerField(default=0)
