# Generated by Django 3.2.18 on 2023-10-22 15:43

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("ediauth", "0002_myuser"),
    ]

    operations = [
        migrations.CreateModel(
            name="Profile",
            fields=[
                (
                    "display_username",
                    models.CharField(max_length=256, primary_key=True, serialize=False),
                ),
                (
                    "user",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="profile",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
        migrations.DeleteModel(
            name="MyUser",
        ),
        migrations.RemoveField(
            model_name="verificationcode",
            name="email",
        ),
        migrations.AddField(
            model_name="verificationcode",
            name="uun",
            field=models.CharField(
                default="s0000000", max_length=150, primary_key=True, serialize=False
            ),
            preserve_default=False,
        ),
    ]
