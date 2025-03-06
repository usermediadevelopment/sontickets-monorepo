/* eslint-disable @typescript-eslint/no-empty-function */
import React, { useMemo, useReducer } from 'react';
import { signInSuccess, signOutSuccess } from './authActions';
import { authInitialState, authReducer } from './authReducer';
import { User } from '~/utils/interfaces/global';

export const AuthContext = React.createContext({
  user: {} as Partial<User>,
  loading: true,
  signIn: (_user: Partial<User>): void => {},
  signOut: (): void => {},
});

export const AuthProvider = ({ children }: any) => {
  const [state, dispatch]: any = useReducer<any>(authReducer, authInitialState);

  const signIn = (user: Partial<User>) => {
    dispatch(signInSuccess(user));
  };

  const signOut = async () => {
    dispatch(signOutSuccess());
  };

  const context = useMemo(
    () => ({
      user: state.user,
      loading: state.loading,
      signIn,
      signOut,
    }),
    [state]
  );

  return <AuthContext.Provider value={context}>{children}</AuthContext.Provider>;
};
