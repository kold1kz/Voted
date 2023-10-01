import { AxiosError } from 'axios';

import VotingService from '../../../api/votingService';
import { AppDispatch } from '../..';
import {
  AuthActionsEnum,
  ClearAuthAction,
  SaveNewTokenAction,
  SetIsTokenRefreshingAction,
  SetIsTryingToLoginAction,
  SetLoginErrorAction,
  SetRefreshingErrorAction,
} from './types';

export const AuthActionCreators = {
  clearAuthState: (): ClearAuthAction => ({
    type: AuthActionsEnum.CLEAR_AUTH_ACTION,
  }),
  saveNewToken: (access_token: string): SaveNewTokenAction => ({
    type: AuthActionsEnum.SAVE_NEW_TOKEN_ACTION,
    payload: access_token,
  }),
  setIsRefreshing: (isRefreshing: boolean): SetIsTokenRefreshingAction => ({
    type: AuthActionsEnum.IS_REFRESHING_ACTION,
    payload: isRefreshing,
  }),
  setIsTryingLogin: (isTryingLogin: boolean): SetIsTryingToLoginAction => ({
    type: AuthActionsEnum.IS_TRYING_LOGIN_ACTION,
    payload: isTryingLogin,
  }),
  setLoginError: (error: string | null): SetLoginErrorAction => ({
    type: AuthActionsEnum.ERROR_LOGIN_ACTION,
    payload: error,
  }),
  setRefreshingError: (error: string | null): SetRefreshingErrorAction => ({
    type: AuthActionsEnum.ERROR_REFRESH_ACTION,
    payload: error,
  }),
  fetchRefreshTokens: () => async (dispatch: AppDispatch) => {
    try {
      dispatch(AuthActionCreators.setIsRefreshing(true));
      dispatch(AuthActionCreators.setRefreshingError(null));
      const result = await VotingService.refreshTokens();
      dispatch(AuthActionCreators.saveNewToken(result.data.access_token));
      dispatch(AuthActionCreators.setIsRefreshing(false));
    } catch (error) {
      dispatch(AuthActionCreators.clearAuthState());
      dispatch(
        AuthActionCreators.setRefreshingError((error as AxiosError<string>).message),
      );
    }
  },
  fetchLogin: (login: string, password: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch(AuthActionCreators.setIsTryingLogin(true));
      dispatch(AuthActionCreators.setLoginError(null));
      const result = await VotingService.login(login, password);
      dispatch(AuthActionCreators.saveNewToken(result.data.access_token));
      dispatch(AuthActionCreators.setIsTryingLogin(false));
    } catch (error) {
      dispatch(AuthActionCreators.setIsTryingLogin(false));
      dispatch(AuthActionCreators.setLoginError((error as AxiosError<string>).message));
      setTimeout(() => {
        dispatch(AuthActionCreators.setLoginError(null));
      }, 2000);
    }
  },
  fetchLogout: () => async (dispatch: AppDispatch) => {
    try {
      dispatch(AuthActionCreators.setIsTryingLogin(true));
      await VotingService.logout();
      dispatch(AuthActionCreators.clearAuthState());
    } catch (error) {
      dispatch(AuthActionCreators.clearAuthState());
    }
  },
};
