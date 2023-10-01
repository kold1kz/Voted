from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'login', 'email', 'password', 'is_active', 'userType']
        extra_kwargs = {
            'password': {'write_only': True}
        }
