import { Reducer } from 'react';
import { User } from '~/utils/interfaces/global';

import { AuthAction, AuthActionTypes } from './authActions';

type AuthState = {
  user: Partial<User>;
  loading: boolean;
};

export const authInitialState: AuthState = {
  user: {} as Partial<User>,
  loading: false,
};

export const authReducer: Reducer<AuthState, AuthAction> = (state, action) => {
  const { type, payload } = action;

  switch (type) {
    case AuthActionTypes.SIGN_IN_FETCH:
      return {
        ...state,
        loading: true,
      };
    case AuthActionTypes.SIGN_IN_SUCCESS:
      return {
        ...state,
        user: payload as Partial<User>,
        loading: false,
      };
    case AuthActionTypes.SIGN_IN_FAILURE:
      return {
        ...state,
        user: {},
        loading: false,
      };

    case AuthActionTypes.SIGN_OUT:
      return {
        user: {},
        loading: false,
      };

    default:
      return authInitialState;
  }
};
