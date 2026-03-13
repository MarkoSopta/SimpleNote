from rest_framework import serializers

from .models import Note
from django.contrib.auth.models import User


def normalize_note_content(content):
    if isinstance(content, list):
        return content

    if isinstance(content, str):
        return [{"type": "text", "value": content}]

    return []

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password']
        extra_kwargs = {'password': {'write_only': True}}


    def create(self, validated_data):    
        user = User.objects.create_user(**validated_data)
        return user
    
class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['id', 'title', 'content', 'completed', 'created_at', 'author']
        extra_kwargs = {'author': {'read_only': True}}

    def validate_content(self, value):
        return normalize_note_content(value)
