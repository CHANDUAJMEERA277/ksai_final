from django.urls import path

from .views import (
    explain_code,
    chat_code,
    autocode_code,
)

from .guide_views import guide
from .teach_views import teach
from .interview_views import evaluate_interview


urlpatterns = [

    path(
        "explain/",
        explain_code,
    ),

    path(
        "chat/",
        chat_code,
    ),

    path(
        "guide/",
        guide,
    ),

    path(
        "teach/",
        teach,
    ),

    path(
        "autocode/",
        autocode_code,
    ),

    path(
        "interview/evaluate/",
        evaluate_interview,
    ),

]