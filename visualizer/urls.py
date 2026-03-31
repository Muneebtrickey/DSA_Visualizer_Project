from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='home'),
    path('api/sort/', views.SortingView.as_view(), name='sorting_api'), # Changed to /api/sort/
]