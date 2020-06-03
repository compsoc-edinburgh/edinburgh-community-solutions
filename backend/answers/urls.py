from django.urls import path

from . import views
from . import views_answers
from . import views_comments
from . import views_cuts
from . import views_files
from . import views_listings

urlpatterns = [
    path('search/', views_listings.search, name='search'),
    path('listexamtypes/', views_listings.list_exam_types, name='listexamtypes'),
    path('listexams/', views_listings.list_exams, name='listexams'),
    path('listimportexams/', views_listings.list_import_exams, name='listimportexams'),
    path('listpaymentcheckexams/', views_listings.list_payment_check_exams, name='listpaymentcheckexams'),
    path('listflagged/', views_listings.list_flagged, name='listflagged'),
    path('listbyuser/<str:username>/', views_listings.get_by_user, name='listbyuser'),
    path('cuts/<str:filename>/', views_cuts.get_cuts, name='cuts'),
    path('addcut/<str:filename>/', views_cuts.add_cut, name='addcut'),
    path('editcut/<int:oid>/', views_cuts.edit_cut, name='editcut'),
    path('removecut/<int:oid>/', views_cuts.remove_cut, name='removecut'),
    path('cutversions/<str:filename>/', views_cuts.get_cut_versions, name='cutversions'),
    path('answersection/<int:oid>/', views_cuts.get_answersection, name='answersection'),
    path('metadata/<str:filename>/', views.exam_metadata, name='metadata'),
    path('setmetadata/<str:filename>/', views.exam_set_metadata, name='setmetadata'),
    path('answer/<str:long_id>/', views_answers.get_answer, name='getanswer'),
    path('setanswer/<int:oid>/', views_answers.set_answer, name='setanswer'),
    path('removeanswer/<int:oid>/', views_answers.remove_answer, name='removeanswer'),
    path('setlike/<int:oid>/', views_answers.set_like, name='setlike'),
    path('setexpertvote/<int:oid>/', views_answers.set_expertvote, name='setexpertvote'),
    path('setflagged/<int:oid>/', views_answers.set_flagged, name='setflagged'),
    path('resetflagged/<int:oid>/', views_answers.reset_flagged, name='resetflagged'),
    path('addcomment/<int:oid>/', views_comments.add_comment, name='addcomment'),
    path('setcomment/<int:oid>/', views_comments.set_comment, name='setcomment'),
    path('removecomment/<int:oid>/', views_comments.remove_comment, name='removecomment'),
    path('claimexam/<str:filename>/', views.claim_exam, name='claimexam'),
    path('upload/exam/', views_files.upload_exam_pdf, name='upload_exam_pdf'),
    path('upload/transcript/', views_files.upload_transcript, name='upload_transcript'),
    path('upload/printonly/', views_files.upload_printonly, name='upload_printonly'),
    path('upload/solution/', views_files.upload_solution, name='upload_solution'),
    path('remove/exam/<str:filename>/', views_files.remove_exam, name='remove_exam'),
    path('remove/printonly/<str:filename>/', views_files.remove_printonly, name='remove_printonly'),
    path('remove/solution/<str:filename>/', views_files.remove_solution, name='remove_solution'),
    path('pdf/exam/<str:filename>/', views_files.get_exam_pdf, name='get_exam_pdf'),
    path('pdf/solution/<str:filename>/', views_files.get_solution_pdf, name='get_solution_pdf'),
    path('pdf/printonly/<str:filename>/', views_files.get_printonly_pdf, name='get_printonly_pdf'),
    path('printpdf/exam/<str:filename>/', views_files.print_exam, name='printexam'),
    path('printpdf/solution/<str:filename>/', views_files.print_solution, name='printsolution'),
    path('zipexport/', views_files.zip_export, name='zipexport'),
]
