from django.conf import settings
from django.contrib import admin
from django.http import HttpResponse, HttpResponseNotFound
from django.urls import include, path, re_path
from django.views.decorators.cache import never_cache

@never_cache
def spa(request, *args, **kwargs):
    """Serve the React app for every non-API route (client-side routing: /foods, /food/3, /checkout ...)."""
    index = settings.FRONTEND_DIST / 'index.html'
    if not index.is_file():
        return HttpResponseNotFound('Frontend not built yet. Run "npm install && npm run build" in the frontend folder, then reload.', content_type='text/plain')
    return HttpResponse(index.read_text(encoding='utf-8'), content_type='text/html')

urlpatterns = [path('admin/', admin.site.urls), path('api/', include('shop.urls')),
               re_path(r'^(?!api/|admin/|static/).*$', spa)]
