# Generated by Django 4.1.5 on 2023-11-18 21:34

from django.db import migrations, models
import django.db.models.deletion

def add_default_document_types(apps, schema_editor):
    db_alias = schema_editor.connection.alias
    Type = apps.get_model('documents', 'DocumentType')
    Type.objects.using(db_alias).create(display_name='Documents', order=-100)
    Type.objects.using(db_alias).create(display_name='Summaries', order=-99)
    Type.objects.using(db_alias).create(display_name='Cheat Sheets', order=-98)
    Type.objects.using(db_alias).create(display_name='Flashcards', order=-97)


class Migration(migrations.Migration):

    dependencies = [
        ('documents', '0011_add_document_type'),
    ]

    operations = [
        migrations.RunPython(add_default_document_types),
        migrations.AddField(
            model_name='document',
            name='document_type',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.PROTECT, related_name='type_set', to='documents.documenttype'),
            preserve_default=False,
        ),
    ]
