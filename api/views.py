import jwt
from django.core.exceptions import ObjectDoesNotExist
from django.http import JsonResponse, HttpResponse
from drf_yasg.utils import swagger_auto_schema
from rest_framework import exceptions, status
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from api.authentication import JWTAuthentication
from api.permissions import IsEmployee
from api.utils import generate_access_token, generate_refresh_token
from app.settings import REFRESH_TOKEN_TIME_IN_DAYS, SECRET_KEY
from .models import RefreshTokens, User, VotingArea, Result, Candidate, TimeTurnout, Protocol, VotingDate
from .serializers import UserSerializer
from app.settings import DOMAIN


@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def HelloWorldView(request):
    if request.method == 'GET':
        return JsonResponse("Hello world from django's API!", safe=False)


@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def getImage(request, image):
    if request.method == 'GET':
        img = open('media/' + image, mode='r').read()

        return HttpResponse(img, content_type="image/jpg")


@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def getVotingDate(request):
    if request.method == 'GET':
        response = Response()
        voting_date = VotingDate.objects.first()
        response.data = {
            'voting_date': voting_date.date
        }
        return response


class RegisterView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny, ]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class LoginView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny, ]

    def post(self, request):
        login = request.data['login']
        password = request.data['password']

        user = User.objects.filter(login=login).first()

        if user is None:
            raise exceptions.AuthenticationFailed('User not found!')

        if not user.check_password(password):
            raise exceptions.AuthenticationFailed('Incorrect password!')

        access_token = generate_access_token(user)
        expiresIn, refresh_token = generate_refresh_token(user)

        RefreshTokens.objects.create(
            refreshToken=refresh_token, expiresIn=expiresIn, userId=user)

        response = Response()

        response.set_cookie(key='refresh_token', value=refresh_token, samesite="Lax",
                            httponly=True, max_age=REFRESH_TOKEN_TIME_IN_DAYS * 24 * 60 * 60)
        response.data = {
            'access_token': access_token
        }
        return response


class LogoutView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny, ]

    def get(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        saved_token = RefreshTokens.objects.filter(
            refreshToken=refresh_token).first()
        if saved_token is not None:
            saved_token.delete()
        response = Response()
        response.delete_cookie('refresh_token')
        response.data = {
            'message': 'success'
        }
        return response


class RefreshTokensView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny, ]

    def get(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        if refresh_token is None:
            raise exceptions.AuthenticationFailed(
                'Authentication credentials were not provided.')

        saved_token = RefreshTokens.objects.filter(
            refreshToken=refresh_token).first()
        if saved_token is None:
            raise exceptions.AuthenticationFailed('Token not found')

        try:
            payload = jwt.decode(refresh_token, SECRET_KEY,
                                 algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed(
                'expired refresh_token, please login again.')
        except jwt.DecodeError:
            raise exceptions.AuthenticationFailed('refresh_token  is spoiled')

        user = User.objects.filter(id=payload.get('userId')).first()
        access_token = generate_access_token(user)
        expiresIn, refresh_token = generate_refresh_token(user)
        saved_token.delete()
        RefreshTokens.objects.create(
            refreshToken=refresh_token, expiresIn=expiresIn, userId=user)

        response = Response()
        response.delete_cookie('refresh_token')
        response.set_cookie(key='refresh_token', value=refresh_token, samesite="Lax",
                            httponly=True, max_age=REFRESH_TOKEN_TIME_IN_DAYS * 24 * 60 * 60)
        response.data = {
            'access_token': access_token
        }
        return response


class UserView(APIView):
    authentication_classes = [JWTAuthentication, ]
    permission_classes = [IsEmployee, ]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)


class Results(APIView):
    authentication_classes = []
    permission_classes = [AllowAny, ]

    @swagger_auto_schema(operation_description="Метод для вывода результата выборов",
                         responses={200: 'Выводится явка, %обработанных бюллетеней, %голосов по кандидатам'})
    def get(self, request):
        max_voters = 0
        voted_number = 0

        for voting_area in VotingArea.objects.all():
            max_voters += voting_area.max_people
            voted_number += voting_area.count_voters

        turnout = round(voted_number / max_voters * 100, 2)

        checked_bulletins = 0

        for result in Result.objects.all():
            checked_bulletins += result.count_votes

        checked_bulletins_percentage = 0

        if voted_number != 0:
            checked_bulletins_percentage = round(
                checked_bulletins / voted_number * 100, 2)

        candidate_results = []

        for candidate in Result.objects.all():
            candidateInfo = Candidate.objects.get(id=candidate.candidate.id,)
            image_data = None
            resultPercent = 0
            if checked_bulletins != 0:
                resultPercent = round(
                    candidate.count_votes / checked_bulletins * 100, 2)
            if candidateInfo.photo.name != None:
                if DOMAIN == '127.0.0.1':
                    image_data = DOMAIN + ':8000/media/' + candidateInfo.photo.name
                else:
                    image_data = DOMAIN + '/media/' + candidateInfo.photo.name
            candidate_results.append({
                "candidate_id": candidate.candidate.id,
                "candidate": candidate.candidate.full_name,
                "photo": image_data,
                "result": resultPercent
            })

        response = Response()

        response.data = {
            'turnout': turnout,
            'checked_bulletins_percentage': checked_bulletins_percentage,
            'candidate_results': candidate_results
        }

        return response


class CandidateVAInfo(APIView):
    authentication_classes = []
    permission_classes = [AllowAny, ]

    @swagger_auto_schema(operation_description="Возвращает общую информацию об избирательных участках и кандидатах",
                         responses={200: 'Выводится список информации о участках и кандидатах'})
    def get(self, request):
        count_opened = 0
        count_people = 0
        info = []

        for candidate in Candidate.objects.all():
            image_data = None
            if candidate.photo.name != None:
                if candidate.photo.name != None:
                    print(DOMAIN == '127.0.0.1')
                    if DOMAIN == '127.0.0.1':
                        image_data = DOMAIN + ':8000/media/' + candidate.photo.name
                    else:
                        image_data = DOMAIN + '/media/' + candidate.photo.name
            if candidate.is_self_promoted == False:
                consigment = candidate.consigment.name
            else:
                consigment = 'Самовыдвижение'
            info.append({
                "candidate_id": candidate.id,
                "photo": image_data,
                "candidate": candidate.full_name,
                "consigment": consigment
            })

        for votingArea in VotingArea.objects.all():
            count_people += votingArea.max_people
            if votingArea.is_opened:
                count_opened += 1

        response = Response()

        response.data = {
            'info': info,
            'count_opened': count_opened,
            'count_people': count_people
        }

        return response


class DistrictsTurnout(APIView):
    authentication_classes = []
    permission_classes = [AllowAny, ]

    @swagger_auto_schema(operation_description="Возвращает явку по всем административным округам Москвы",
                         responses={200: 'Выводится список административных округов с явкой на них'})
    def get(self, request):
        districts_turnout = []
        district = VotingArea.objects.order_by('district').first().district
        count_votes = 0
        max_votes = 0
        for va in VotingArea.objects.order_by('district'):
            if district != va.district:
                turnout = round(count_votes / max_votes * 100, 2)
                districts_turnout.append({
                    "district": district,
                    "turnout": turnout
                })
                count_votes = va.count_voters
                max_votes = va.max_people
                district = va.district
            else:
                count_votes += va.count_voters
                max_votes += va.max_people

        turnout = round(count_votes / max_votes * 100, 2)
        districts_turnout.append({
            "district": district,
            "turnout": turnout
        })

        response = Response()

        response.data = {
            "districts_turnout": districts_turnout
        }

        return response


class UserResults(APIView):
    authentication_classes = [JWTAuthentication, ]
    permission_classes = [IsEmployee, ]

    @swagger_auto_schema(operation_description="Метод для вывода кандидатов",
                         responses={200: 'Выводится список кандидатов'})
    def get(self, request):
        candidates = []

        for candidate in Candidate.objects.all():
            candidates.append({
                "candidate_id": candidate.id,
                "candidate": candidate.full_name
            })

        response = Response()

        response.data = {
            "candidates": candidates
        }

        return response

    @swagger_auto_schema(operation_description="Метод для ввода протокола и результатов голосования",
                         responses={205: "Данные успешно обновлены",
                                    400: "Неправильный ввод данных"})
    def post(self, request):
        va = VotingArea.objects.get(user=request.user.id)
        try:
            Protocol.objects.get(voting_area=va)
            return Response(status=status.HTTP_400_BAD_REQUEST)
        except Protocol.DoesNotExist:
            try:
                processed_bulletins = request.data['processed_bulletins']
                spoiled_bulletins = request.data['spoiled_bulletins']
            except Exception:
                return Response(status=status.HTTP_400_BAD_REQUEST)

            try:
                if (int(processed_bulletins) <= va.count_voters) and \
                    (int(spoiled_bulletins) <= int(processed_bulletins)) and \
                    int(processed_bulletins) >= 0 and \
                        int(spoiled_bulletins) >= 0:
                    number_of_voters = int(va.count_voters)
                    valid_bulletins = int(
                        processed_bulletins) - int(spoiled_bulletins)
                else:
                    return Response(status=status.HTTP_400_BAD_REQUEST)
            except Exception:
                return Response(status=status.HTTP_400_BAD_REQUEST)

            valid_results = 0
            try:
                for candidate in request.data["candidates"]:
                    candidate_votes = int(candidate['count_votes'])
                    if not (candidate_votes >= 0 and candidate_votes < processed_bulletins):
                        return Response(status=status.HTTP_400_BAD_REQUEST)
                    else:
                        valid_results += candidate_votes
            except Exception:
                return Response(status=status.HTTP_400_BAD_REQUEST)

            if valid_results > (processed_bulletins - spoiled_bulletins):
                return Response(status=status.HTTP_400_BAD_REQUEST)

            for candidate in request.data["candidates"]:
                try:
                    result = Result.objects.get(
                        candidate=candidate['candidate_id'])
                    candidate_votes = int(candidate['count_votes'])

                    result.count_votes = int(
                    result.count_votes) + candidate_votes

                    result.save()
                except Result.DoesNotExist:
                    Result.objects.create(candidate=candidate['candidate_id'],
                                      count_votes=int(candidate['count_votes']))

                result.save()

            Protocol.objects.create(voting_area=va, number_of_voters=number_of_voters,
                                    number_of_bulletins=processed_bulletins,
                                    spoiled_bulletins=spoiled_bulletins, valid_bulletins=valid_bulletins)

            return Response(status=status.HTTP_205_RESET_CONTENT)


class CheckProtocol(APIView):
    authentication_classes = [JWTAuthentication, ]
    permission_classes = [IsEmployee, ]

    @swagger_auto_schema(operation_description="Метод для проверки, отправлен ли уже протокол с этого участка",
                         responses={200: 'true или false'})
    def get(self, request):
        va = VotingArea.objects.get(user=request.user.id)
        response = Response()
        try:
            Protocol.objects.get(voting_area=va)
            response.data = {
                "protocolExists": True,
            }
            return response
        except Protocol.DoesNotExist:
            response.data = {
                "protocolExists": False,
            }
            return response

    @swagger_auto_schema(operation_description="Метод для ввода протокола и результатов голосования",
                         responses={205: "Данные успешно обновлены",
                                    400: "Неправильный ввод данных"})
    def post(self, request):
        va = VotingArea.objects.get(user=request.user.id)
        try:
            Protocol.objects.get(voting_area=va)
            return Response(status=status.HTTP_400_BAD_REQUEST)
        except Protocol.DoesNotExist:
            try:
                processed_bulletins = request.data['processed_bulletins']
                spoiled_bulletins = request.data['spoiled_bulletins']
            except Exception:
                return Response(status=status.HTTP_400_BAD_REQUEST)

            try:
                if (int(processed_bulletins) <= va.count_voters) and \
                    (int(spoiled_bulletins) <= int(processed_bulletins)) and \
                    int(processed_bulletins) >= 0 and \
                        int(spoiled_bulletins) >= 0:
                    number_of_voters = int(va.count_voters)
                    valid_bulletins = int(
                        processed_bulletins) - int(spoiled_bulletins)
                else:
                    return Response(status=status.HTTP_400_BAD_REQUEST)
            except Exception:
                return Response(status=status.HTTP_400_BAD_REQUEST)

            valid_results = 0
            try:
                for candidate in request.data["candidates"]:
                    candidate_votes = int(candidate['count_votes'])
                    if not (candidate_votes >= 0 and candidate_votes < processed_bulletins):
                        return Response(status=status.HTTP_400_BAD_REQUEST)
                    else:
                        valid_results += candidate_votes
            except Exception:
                return Response(status=status.HTTP_400_BAD_REQUEST)

            if valid_results > (processed_bulletins - spoiled_bulletins):
                return Response(status=status.HTTP_400_BAD_REQUEST)

            for candidate in request.data["candidates"]:
                result = Result.objects.get(
                    candidate=candidate['candidate_id'])
                candidate_votes = int(candidate['count_votes'])

                result.count_votes = int(
                    result.count_votes) + candidate_votes

                result.save()

            Protocol.objects.create(voting_area=va, number_of_voters=number_of_voters,
                                    number_of_bulletins=processed_bulletins,
                                    spoiled_bulletins=spoiled_bulletins, valid_bulletins=valid_bulletins)

            return Response(status=status.HTTP_205_RESET_CONTENT)


class UserTurnout(APIView):
    authentication_classes = [JWTAuthentication, ]
    permission_classes = [IsEmployee, ]

    @swagger_auto_schema(operation_description="Возвращает предыдущие значения времени "
                                               "ввода информации и количества избирателей, пришедших на избирательный участок",
                         responses={200: 'Выводятся прошлые вводы данных'})
    def get(self, request):
        user = request.user.id

        va = VotingArea.objects.get(user=user)

        response = Response()

        va_data = []
        if va.count_voters == 0:
            response.data = {
                "voting_area_id": va.num_voting_area,
                "va_data": va_data,
                "max_people": va.max_people,
            }
            return response
        else:
            for element in TimeTurnout.objects.filter(voting_area_id=va):
                va_data.append({
                    "time": element.add_time,
                    "count_voters": element.count_voters,
                    "client_add_time": element.client_add_time
                })

        response.data = {
            "voting_area_id": va.num_voting_area,
            "va_data": va_data,
            "max_people": va.max_people,
        }

        return response

    @swagger_auto_schema(operation_description="Позволяет внести информацию о количестве пришедших избирателей на избирательный участок",
                         responses={205: "Данные успешно обновлены",
                                    400: "Неправильный ввод данных"})
    def post(self, request):
        turnout = None
        client_add_time = None
        try:
            turnout = request.data['turnout']
            client_add_time = request.data['client_add_time']
        except Exception:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        va = VotingArea.objects.get(user=request.user.id)
        try:
            if int(turnout) < 0 or int(turnout) > va.max_people or int(turnout) <= va.count_voters:
                return Response(status=status.HTTP_400_BAD_REQUEST)
        except ValueError:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        VotingArea.objects.filter(
            user=request.user.id).update(count_voters=turnout)
        TimeTurnout.objects.create(
            voting_area=va, count_voters=turnout, client_add_time=client_add_time)

        return Response(status=status.HTTP_205_RESET_CONTENT)
