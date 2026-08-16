from django.urls import include, path

urlpatterns = [
    path("api/", include("ai_engine.urls")),
]