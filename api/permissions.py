import jwt
from rest_framework.permissions import BasePermission
from app.settings import SECRET_KEY


class IsEmployee(BasePermission):
    def has_permission(self, request, view):
        authorization_heaader = request.headers.get('Authorization')
        access_token = authorization_heaader.split(' ')[1]
        payload = jwt.decode(
            access_token, SECRET_KEY, algorithms=['HS256'])
        return request.user and (request.user.userType == "employee" or request.user.userType == "admin") and request.user.userType == payload['userType']


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        authorization_heaader = request.headers.get('Authorization')
        access_token = authorization_heaader.split(' ')[1]
        payload = jwt.decode(
            access_token, SECRET_KEY, algorithms=['HS256'])
        return request.user and request.user.userType == "admin" and request.user.userType == payload['userType']
