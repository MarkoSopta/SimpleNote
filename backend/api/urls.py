from django.urls import path
from . import views
urlpatterns = [
    path("notes/", views.NoteListCreateView.as_view(), name="note-list"),
    path("notes/delete/<int:pk>/", views.NoteDelete.as_view(), name="note-delete"),
    path("notes/modify/<int:pk>/", views.NoteModify.as_view(), name="note-modify"),
]