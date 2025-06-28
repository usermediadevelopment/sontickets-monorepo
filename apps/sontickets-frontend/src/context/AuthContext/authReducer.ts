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

    case AuthActionTypes.UPDATE_USER:
      const userData = payload as Partial<User>;
      return {
        ...state,
        user: {
          ...state.user,
          ...userData,
          // Handle nested company object merge
          ...(userData.company && {
            company: {
              ...state.user.company,
              ...userData.company,
            },
          }),
        },
      };

    default:
      return authInitialState;
  }
};
