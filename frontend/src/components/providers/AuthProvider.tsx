import { useCallback, useEffect, useState, type ReactNode } from 'react';
import type {
  JWTPayload,
  UserCreate,
  UserCredentials,
  UserProfile,
} from '../../schemas/types';
import { testAuth, usernamePasswordLogin } from '../../services/auth';
import { createUser, getUserByUUID } from '../../services/users';
import { jwtDecode } from 'jwt-decode';
import { AuthContext, type AuthContextType } from '../../contexts/Auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('access_token')
  );
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const login = useCallback(async (credentials: UserCredentials) => {
    try {
      const res = await usernamePasswordLogin(credentials);

      localStorage.setItem('access_token', res.access_token);
      setToken(res.access_token);

      const payload: JWTPayload = jwtDecode(res.access_token);
      if (!payload) throw new Error('Invalid token');

      getUserByUUID(payload.sub).then((res: UserProfile) => {
        setUser(res);
      });
    } catch (err) {
      console.error('failed to login', err);
    }
  }, []);

  const signup = (newUser: UserCreate) => {
    createUser(newUser)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .then((_: UserProfile) => {
        login({
          username: newUser.username,
          password: newUser.password,
        });
      });
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('access_token');
  };

  useEffect(() => {
    if (!token) {
      logout();
      return;
    }

    testAuth(token).then((ok) => {
      if (!ok) {
        logout();
        return;
      }

      // 2) decode & fetch user
      try {
        const payload = jwtDecode<JWTPayload>(token);
        getUserByUUID(payload.sub).then((val: UserProfile) => {
          console.log('auth context get user', val);
          setUser(val);
          setIsLoading(false);
        });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        logout();
      }
    });
  }, [token]);

  const context: AuthContextType = {
    token,
    user,
    isLoading,
    login,
    signup,
    logout,
  };

  return <AuthContext value={context}>{children}</AuthContext>;
}
