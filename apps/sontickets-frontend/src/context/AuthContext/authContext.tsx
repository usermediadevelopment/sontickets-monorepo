/* eslint-disable @typescript-eslint/no-empty-function */
import React, { useMemo, useReducer } from 'react';
import { signInSuccess, signOutSuccess, updateUserAction } from './authActions';
import { authInitialState, authReducer } from './authReducer';
import { User } from '~/utils/interfaces/global';

export const AuthContext = React.createContext({
  user: {} as Partial<User>,
  loading: true,
  signIn: (_user: Partial<User>): void => {},
  signOut: (): void => {},
  updateUser: (_userData: Partial<User>): void => {},
});

export const AuthProvider = ({ children }: any) => {
  const [state, dispatch]: any = useReducer<any>(authReducer, authInitialState);

  const signIn = (user: Partial<User>) => {
    dispatch(signInSuccess(user));
  };

  const signOut = async () => {
    dispatch(signOutSuccess());
  };

  const updateUser = (userData: Partial<User>) => {
    // Update context using the dedicated UPDATE_USER action
    dispatch(updateUserAction(userData));

    // Update localStorage with the merged user data
    try {
      const updatedUser = {
        ...state.user,
        ...userData,
        // Handle nested company object merge
        ...(userData.company && {
          company: {
            ...state.user.company,
            ...userData.company,
          },
        }),
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error updating localStorage:', error);
    }
  };

  const context = useMemo(
    () => ({
      user: state.user,
      loading: state.loading,
      signIn,
      signOut,
      updateUser,
    }),
    [state]
  );

  return <AuthContext.Provider value={context}>{children}</AuthContext.Provider>;
};
