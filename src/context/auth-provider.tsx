 
import { createContext, useContext } from 'react';
import useAuth from '@/hooks/api/use-auth';
import { useLogout } from '@/hooks/api/use-auth-mutations';
import type { UserType, RelatedData } from '@/types/api.types';

// Define the context shape
type AuthContextType = {
  user?: UserType;
  related?: RelatedData;
  isAuthenticated: boolean;
  error: any;
  isLoading: boolean;
  isFetching: boolean;
  refetchAuth: () => void;
  logout: () => void;
  isLoggingOut: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    user,
    related,
    isAuthenticated,
    error: authError,
    isLoading,
    isFetching,
    refetch: refetchAuth,
  } = useAuth();

  const { mutate: logoutMutation, isPending: isLoggingOut } = useLogout();

  const handleLogout = () => {
    logoutMutation();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        related,
        isAuthenticated,
        error: authError,
        isLoading,
        isFetching,
        refetchAuth,
        logout: handleLogout,
        isLoggingOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useCurrentUserContext must be used within a AuthProvider');
  }
  return context;
};
