# Generated by Django 3.0.4 on 2021-03-30 22:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("documents", "0003_document_likes"),
    ]

    operations = [
        migrations.AlterField(
            model_name="document",
            name="slug",
            field=models.CharField(db_index=True, max_length=256),
        ),
    ]
