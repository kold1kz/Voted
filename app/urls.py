from baton.autodiscover import admin
from django.conf import settings
from django.urls import path, include
from django.conf.urls import url
from django.conf.urls.static import static
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

from api.authentication import JWTAuthentication

schema_view = get_schema_view(
    openapi.Info(
        title="Выборы API",
        default_version='v1',
        description="Описание моделей запросов к БД через API Routes и прочее",
        # terms_of_service="https://www.google.com/policies/terms/",
        # contact=openapi.Contact(email="contact@snippets.local"),
        # license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny, ),
    authentication_classes=(),
)


urlpatterns = [
    url(r'^swagger(?P<format>\.json|\.yaml)',
        schema_view.without_ui(cache_timeout=0), name='schema-json'),
    url(r'^swagger/', schema_view.with_ui('swagger',
        cache_timeout=0), name='schema-swagger-ui'),
    url(r'^redoc/', schema_view.with_ui('redoc',
        cache_timeout=0), name='schema-redoc'),
    path('admin/', admin.site.urls),
    path('baton/', include('baton.urls')),
    url(r'^api/', include('api.urls')),
    re_path('(^(?!(api|admin|swagger|media)).*$)',
            TemplateView.as_view(template_name="index.html")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)
