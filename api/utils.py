# import datetime
import jwt
from django.utils import timezone

from app.settings import ACCESS_TOKEN_TIME_IN_MINUTES, REFRESH_TOKEN_TIME_IN_DAYS, SECRET_KEY


def generate_access_token(user):
    access_token_payload = {
        'userId': user.id,
        'userType': user.userType,
        'exp': timezone.now() + timezone.timedelta(days=0, minutes=ACCESS_TOKEN_TIME_IN_MINUTES),
        'iat': timezone.now(),
    }
    access_token = jwt.encode(access_token_payload,
                              SECRET_KEY, algorithm='HS256')
    return access_token


def generate_refresh_token(user):
    expiresIn = timezone.now(
    ) + timezone.timedelta(days=REFRESH_TOKEN_TIME_IN_DAYS)
    refresh_token_payload = {
        'userId': user.id,
        'exp': expiresIn,
        'iat': timezone.now()
    }
    refresh_token = jwt.encode(
        refresh_token_payload, SECRET_KEY, algorithm='HS256')

    return expiresIn, refresh_token
