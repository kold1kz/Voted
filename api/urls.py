from django.urls import path
from .views import HelloWorldView, RefreshTokensView, RegisterView, LoginView, UserView, LogoutView, Results, \
    CandidateVAInfo, DistrictsTurnout, UserResults, UserTurnout, CheckProtocol, getImage, getVotingDate

urlpatterns = [
    path('hello-world', HelloWorldView, name='hello-world'),
    path('register', RegisterView.as_view()),
    path('auth/login', LoginView.as_view()),
    path('user-info', UserView.as_view()),
    path('auth/refresh-tokens', RefreshTokensView.as_view()),
    path('auth/logout', LogoutView.as_view()),
    path('results', Results.as_view()),
    path('candidate-va-info', CandidateVAInfo.as_view()),
    path('districts-turnout', DistrictsTurnout.as_view()),
    path('user-results', UserResults.as_view()),
    path('check-protocol', CheckProtocol.as_view()),
    path('user-turnout', UserTurnout.as_view(), name='user-turnout'),
    path('media/<str:image>', getImage, name='get-image'),
    path('voting-date', getVotingDate, name='get-voting-date')
]
