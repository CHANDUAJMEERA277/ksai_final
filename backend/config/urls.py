from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),

    # Java Execution Engine
    path("api/", include("ai_engine.urls")),

    # AI Gateway
    path("api/ai/", include("ai_gateway.urls")),
]