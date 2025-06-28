import { User } from '~/utils/interfaces/global';

export enum AuthActionTypes {
  SIGN_IN_FETCH = 'SIGN_IN_FETCH',
  SIGN_IN_SUCCESS = 'SIGN_IN_SUCCESS',
  SIGN_IN_FAILURE = 'SIGN_IN_FAILURE',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_USER = 'UPDATE_USER',
}

// An interface for our actions
export type AuthAction = {
  type: AuthActionTypes;
  payload?: string | Partial<User> | User;
};

export const signInFetch = (): AuthAction => ({
  type: AuthActionTypes.SIGN_IN_FETCH,
});

export const signInSuccess = (user: Partial<User>): AuthAction => ({
  type: AuthActionTypes.SIGN_IN_SUCCESS,
  payload: user,
});

export const signInFailure = (): AuthAction => ({
  type: AuthActionTypes.SIGN_IN_FAILURE,
});

export const signOutSuccess = (): AuthAction => ({
  type: AuthActionTypes.SIGN_OUT,
});

export const updateUserAction = (userData: Partial<User>): AuthAction => ({
  type: AuthActionTypes.UPDATE_USER,
  payload: userData,
});
