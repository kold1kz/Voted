export interface AuthState {
  access_token: string | null;
  isRefreshing: boolean;
  isTryingToLogin: boolean;
  errorRefreshing: string | null;
  errorLogin: string | null;
  isFirstRefreshDone: boolean;
}

export enum AuthActionsEnum {
  CLEAR_AUTH_ACTION = 'CLEAR_AUTH_ACTION',
  SAVE_NEW_TOKEN_ACTION = 'SAVE_NEW_TOKEN_ACTION',
  IS_REFRESHING_ACTION = 'IS_REFRESHING_ACTION',
  IS_TRYING_LOGIN_ACTION = 'IS_TRYING_LOGIN_ACTION',
  ERROR_LOGIN_ACTION = 'ERROR_LOGIN_ACTION',
  ERROR_REFRESH_ACTION = 'ERROR_REFRESH_ACTION',
}

export interface ClearAuthAction {
  type: AuthActionsEnum.CLEAR_AUTH_ACTION;
}

export interface SaveNewTokenAction {
  type: AuthActionsEnum.SAVE_NEW_TOKEN_ACTION;
  payload: string;
}

export interface SetIsTokenRefreshingAction {
  type: AuthActionsEnum.IS_REFRESHING_ACTION;
  payload: boolean;
}

export interface SetIsTryingToLoginAction {
  type: AuthActionsEnum.IS_TRYING_LOGIN_ACTION;
  payload: boolean;
}

export interface SetRefreshingErrorAction {
  type: AuthActionsEnum.ERROR_REFRESH_ACTION;
  payload: string | null;
}

export interface SetLoginErrorAction {
  type: AuthActionsEnum.ERROR_LOGIN_ACTION;
  payload: string | null;
}

export type AuthAction =
  | ClearAuthAction
  | SaveNewTokenAction
  | SetIsTokenRefreshingAction
  | SetIsTryingToLoginAction
  | SetRefreshingErrorAction
  | SetLoginErrorAction;
