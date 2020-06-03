# Generated by Django 3.0.4 on 2020-06-03 12:29

import django.contrib.postgres.search
from django.db import migrations
from django.contrib.postgres.search import SearchVector


def forwards_func(apps, schema_editor):
    Answer = apps.get_model("answers", "Answer")
    Answer.objects.update(search_vector=SearchVector('text'))

    Comment = apps.get_model("answers", "Comment")
    Comment.objects.update(search_vector=SearchVector('text'))

    Exam = apps.get_model("answers", "Exam")
    Exam.objects.update(
        search_vector=SearchVector('displayname') + SearchVector('remark')
    )

    ExamPage = apps.get_model("answers", "ExamPage")
    ExamPage.objects.update(search_vector=SearchVector('text'))


def reverse_func(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('answers', '0008_trigram'),
    ]

    operations = [
        migrations.AddField(
            model_name='answer',
            name='search_vector',
            field=django.contrib.postgres.search.SearchVectorField(null=True),
        ),
        migrations.AddField(
            model_name='comment',
            name='search_vector',
            field=django.contrib.postgres.search.SearchVectorField(null=True),
        ),
        migrations.AddField(
            model_name='exam',
            name='search_vector',
            field=django.contrib.postgres.search.SearchVectorField(null=True),
        ),
        migrations.AddField(
            model_name='exampage',
            name='search_vector',
            field=django.contrib.postgres.search.SearchVectorField(null=True),
        ),
        migrations.RunPython(forwards_func, reverse_func),
        migrations.AlterField(
            model_name='answer',
            name='search_vector',
            field=django.contrib.postgres.search.SearchVectorField(null=False),
        ),
        migrations.AlterField(
            model_name='comment',
            name='search_vector',
            field=django.contrib.postgres.search.SearchVectorField(null=False),
        ),
        migrations.AlterField(
            model_name='exam',
            name='search_vector',
            field=django.contrib.postgres.search.SearchVectorField(null=False),
        ),
        migrations.AlterField(
            model_name='exampage',
            name='search_vector',
            field=django.contrib.postgres.search.SearchVectorField(null=False),
        ),
        migrations.RunSQL(
            sql='''
            CREATE TRIGGER answer_update_trigger
            BEFORE INSERT OR UPDATE OF text
            ON answers_answer
            FOR EACH ROW EXECUTE PROCEDURE
            tsvector_update_trigger(search_vector, 'pg_catalog.english', text);
            ''',

            reverse_sql='''
            DROP TRIGGER IF EXISTS answer_update_trigger
            ON answers_answer;
            '''),
        migrations.RunSQL(
            sql='''
            CREATE TRIGGER comment_update_trigger
            BEFORE INSERT OR UPDATE OF text
            ON answers_comment
            FOR EACH ROW EXECUTE PROCEDURE
            tsvector_update_trigger(search_vector, 'pg_catalog.english', text);
            ''',

            reverse_sql='''
            DROP TRIGGER IF EXISTS comment_update_trigger
            ON answers_comment;
            '''),
        migrations.RunSQL(
            sql='''
            CREATE TRIGGER exam_update_trigger
            BEFORE INSERT OR UPDATE OF displayname, remark
            ON answers_exam
            FOR EACH ROW EXECUTE PROCEDURE
            tsvector_update_trigger(search_vector, 'pg_catalog.english', displayname, remark);
            ''',

            reverse_sql='''
            DROP TRIGGER IF EXISTS exam_update_trigger
            ON answers_exam;
            '''),
        migrations.RunSQL(
            sql='''
            CREATE TRIGGER exampage_update_trigger
            BEFORE INSERT OR UPDATE OF text
            ON answers_exampage
            FOR EACH ROW EXECUTE PROCEDURE
            tsvector_update_trigger(search_vector, 'pg_catalog.english', text);
            ''',

            reverse_sql='''
            DROP TRIGGER IF EXISTS exampage_update_trigger
            ON answers_exampage;
            '''),
    ]
