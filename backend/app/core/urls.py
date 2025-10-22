from django.urls import path
from . import views
urlpatterns=[
    path('students/<int:pk>/overview/',views.student_overview),
    path('students/<int:pk>/recommendation/',views.student_recommendation),
    path('attempts/',views.create_attempt),
    path('analyze-code/',views.analyze_code),
    path('courses/',views.course_list),
    path('courses/<int:pk>/',views.course_detail),
    path('courses/<int:course_id>/lessons/',views.lesson_list),
]
