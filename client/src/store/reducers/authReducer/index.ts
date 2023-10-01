import { AuthAction, AuthActionsEnum, AuthState } from './types';

const initialState: AuthState = {
  access_token: null,
  isRefreshing: true,
  isTryingToLogin: false,
  errorRefreshing: null,
  errorLogin: null,
  isFirstRefreshDone: false,
};

export default function exampleReducer(
  state = initialState,
  action: AuthAction,
): AuthState {
  switch (action.type) {
    case AuthActionsEnum.CLEAR_AUTH_ACTION:
      return { ...initialState, isFirstRefreshDone: true };
    case AuthActionsEnum.SAVE_NEW_TOKEN_ACTION:
      return { ...state, access_token: action.payload, isFirstRefreshDone: true };
    case AuthActionsEnum.IS_REFRESHING_ACTION:
      return { ...state, isRefreshing: action.payload };
    case AuthActionsEnum.IS_TRYING_LOGIN_ACTION:
      return { ...state, isTryingToLogin: action.payload };
    case AuthActionsEnum.ERROR_REFRESH_ACTION:
      return { ...state, errorRefreshing: action.payload };
    case AuthActionsEnum.ERROR_LOGIN_ACTION:
      return { ...state, errorLogin: action.payload };
    default:
      return state;
  }
}
