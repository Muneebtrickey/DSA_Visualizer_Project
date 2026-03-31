from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='home'),
    path('api/bubble-sort/', views.BubbleSortView.as_view(), name='bubble_sort_api'),
]