# Generated by Django 3.2.18 on 2023-10-22 16:55

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("ediauth", "0003_auto"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="verificationcode",
            name="expires_at",
        ),
    ]
