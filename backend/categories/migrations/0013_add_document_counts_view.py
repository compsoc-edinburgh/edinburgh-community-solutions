# Generated by hand on 2023-12-29 21:27

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("categories", "0012_remove_category_has_payments"),
        ("documents", "0001_initial"),
    ]

    sql = """
    CREATE OR REPLACE VIEW categories_categorymetadata (id, category_id, examcount_public, examcount_answered, total_cuts, answered_cuts, documentcount) AS
        SELECT row_number() OVER () as id,
            cc.id AS category_id,
            (SELECT COUNT(*) FROM answers_exam ae WHERE (ae.category_id = cc.id AND ae.public = true)),
            (SELECT COUNT(*) FROM answers_exam ae WHERE (ae.category_id = cc.id AND ae.public=true AND EXISTS (
                SELECT aa.id FROM answers_answer aa INNER JOIN answers_answersection aas ON (aa.answer_section_id = aas.id) WHERE aas.exam_id = ae.id
            ))),
            (SELECT COUNT(*) FROM answers_answersection aas INNER JOIN answers_exam ae ON (aas.exam_id = ae.id) WHERE (ae.category_id = cc.id AND ae.public = true AND aas.has_answers = true)),
            (SELECT COUNT(*) FROM answers_answersection aas INNER JOIN answers_exam ae ON (aas.exam_id = ae.id) WHERE (ae.category_id = cc.id AND ae.public = true AND aas.has_answers = true AND EXISTS (
                SELECT aa.id FROM answers_answer aa WHERE aa.answer_section_id = aas.id
            ))),
            (SELECT COUNT(*) FROM documents_document dd WHERE (dd.category_id = cc.id))
        FROM categories_category cc
    ;
    """

    operations = [migrations.RunSQL(sql)]
