# Generated by Django 3.0.4 on 2021-04-04 09:27

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("documents", "0004_auto_20210330_2220"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="document",
            name="filename",
        ),
        migrations.RemoveField(
            model_name="document",
            name="mime_type",
        ),
        migrations.CreateModel(
            name="DocumentFile",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("display_name", models.CharField(max_length=256)),
                ("filename", models.CharField(max_length=256, unique=True)),
                ("mime_type", models.CharField(max_length=256)),
                (
                    "document",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="files",
                        to="documents.Document",
                    ),
                ),
            ],
        ),
    ]
