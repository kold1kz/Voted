from django.contrib.auth import get_user_model
from django.conf import settings
from django.middleware.csrf import CsrfViewMiddleware
from rest_framework.authentication import BaseAuthentication
import jwt

from app.settings import SECRET_KEY
from .models import User
from rest_framework import authentication
from rest_framework import exceptions


class JWTAuthentication(authentication.BaseAuthentication):

    def authenticate(self, request):
        authorization_header = request.headers.get('Authorization')
        if not authorization_header:
            # return None
            raise exceptions.AuthenticationFailed('No Authorization header')
        try:
            access_token = authorization_header.split(' ')[1]
            payload = jwt.decode(
                access_token, SECRET_KEY, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('access_token expired')
        except jwt.DecodeError:
            raise exceptions.AuthenticationFailed('access_token  is spoiled')
        except IndexError:
            raise exceptions.AuthenticationFailed('Token prefix missing')

        user = User.objects.filter(id=payload['userId']).first()

        if user is None:
            raise exceptions.AuthenticationFailed('User not found')
        if not user.is_active:
            raise exceptions.AuthenticationFailed('user is inactive')
        return (user, None)
