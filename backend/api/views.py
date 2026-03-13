from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import Note
from .serializers import NoteSerializer, UserSerializer


class UserNoteQuerysetMixin:
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Note.objects.filter(author=self.request.user).order_by('-created_at')

class NoteListCreateView(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Note.objects.filter(author=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class NoteDelete(UserNoteQuerysetMixin, generics.DestroyAPIView):
    pass


class NoteModify(UserNoteQuerysetMixin, generics.RetrieveUpdateDestroyAPIView):
    pass
    
    

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]




