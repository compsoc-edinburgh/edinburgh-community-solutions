# Generated by Django 4.1.13 on 2023-12-29 00:41

from django.db import migrations, models
import ediauth.models


class Migration(migrations.Migration):
    dependencies = [
        ("ediauth", "0004_remove_verificationcode_expires_at"),
    ]

    operations = [
        migrations.AlterField(
            model_name="verificationcode",
            name="created_at",
            field=models.DateTimeField(default=ediauth.models.current_time),
        ),
    ]
