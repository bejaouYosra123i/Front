import { ReactNode, createContext, useReducer, useCallback, useEffect, useState } from 'react';
import {
  IAuthContext,
  IAuthContextAction,
  IAuthContextActionTypes,
  IAuthContextState,
  ILoginResponseDto,
  IUpdateCredentialsDto,
} from '../types/auth.types';
import { getSession, setSession } from './auth.utils';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
  LOGIN_URL,
  ME_URL,
  PATH_AFTER_LOGIN,
  PATH_AFTER_LOGOUT,
  PATH_AFTER_UPDATE_CREDENTIALS,
  PATH_AFTER_REGISTER,
  REGISTER_URL,
  UPDATE_CREDENTIALS_URL,
} from '../utils/globalConfig';
import { PATH_PUBLIC } from '../routes/paths';

// We need a reducer function for useReducer hook
const authReducer = (state: IAuthContextState, action: IAuthContextAction) => {
  if (action.type === IAuthContextActionTypes.LOGIN) {
    return {
      ...state,
      isAuthenticated: true,
      isAuthLoading: false,
      user: action.payload,
    };
  }
  if (action.type === IAuthContextActionTypes.LOGOUT) {
    return {
      ...state,
      isAuthenticated: false,
      isAuthLoading: false,
      user: undefined,
    };
  }
  return state;
};

// We need an initial state object for useReducer hook
const initialAuthState: IAuthContextState = {
  isAuthenticated: false,
  isAuthLoading: true,
  user: undefined,
  privileges: [],
};

// We create our context here and export it
export const AuthContext = createContext<IAuthContext>({
  ...initialAuthState,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateCredentials: async () => {},
});

// We need an interface for our context props
interface IProps {
  children: ReactNode;
}

// We create a component to manage all auth functionalities and export it and use it
const AuthContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<IAuthContextState>(initialAuthState);
  const navigate = useNavigate();

  // Initialize Method
  const initializeAuthContext = useCallback(async () => {
    try {
      const token = getSession();
      if (token) {
        // validate accessToken by calling backend
        const response = await axiosInstance.post<ILoginResponseDto>(ME_URL, {
          token,
        });
        // In response, we receive jwt token and user data
        const { newToken, userInfo } = response.data;
        setSession(newToken);
        // Charger les privilèges comme dans login
        const userId = userInfo.id;
        let privileges: string[] = [];
        try {
          const res = await axiosInstance.get(`/Privilege/user/${userId}`);
          privileges = res.data.map((p: any) => p.privilegeName);
        } catch {
          privileges = [];
        }
        setState({
          isAuthenticated: true,
          isAuthLoading: false,
          user: userInfo,
          privileges,
        });
      } else {
        setSession(null);
        setState({
          isAuthenticated: false,
          isAuthLoading: false,
          user: undefined,
          privileges: [],
        });
      }
    } catch (error) {
      setSession(null);
      setState({
        isAuthenticated: false,
        isAuthLoading: false,
        user: undefined,
        privileges: [],
      });
    }
  }, []);

  // In start of Application, We call initializeAuthContext to be sure about authentication status
  useEffect(() => {
    console.log('AuthContext Initialization start');
    initializeAuthContext() 
      .then(() => console.log('initializeAuthContext was successfull'))
      .catch((error) => console.log(error));
  }, []);
  
  // Register Method
  const register = useCallback(
    async (firstName: string, lastName: string, userName: string, email: string, password: string, address: string) => {
      const response = await axiosInstance.post(REGISTER_URL, {
        firstName,
        lastName,
        userName,
        email,
        password,
        address,
      });
      console.log('Register Result:', response);
      toast.success('User created successfully');
      navigate('/dashboard/users-management'); // Redirection vers la page de gestion des utilisateurs
    },
    []
  );
  
  const updateCredentials = useCallback(
    async (updateData: IUpdateCredentialsDto) => {
      try {
        console.log('AuthContext: Starting credentials update');
        console.log('AuthContext: Update data:', updateData);
        const response = await axiosInstance.put(UPDATE_CREDENTIALS_URL, updateData);
        console.log('AuthContext: Update response:', response);
        
        // Only show success and navigate if the update was successful
        if (response.status === 200) {
          toast.success('Credentials updated successfully');
          console.log('AuthContext: Navigating to:', PATH_AFTER_UPDATE_CREDENTIALS);
          navigate(PATH_AFTER_UPDATE_CREDENTIALS);
        }
      } catch (error) {
        console.error('AuthContext: Error in updateCredentials:', error);
        // Propagate the error to be handled by the component
        throw error;
      }
    },
    []
  );

  // Login Method
  const login = useCallback(async (userName: string, password: string) => {
    const response = await axiosInstance.post<ILoginResponseDto>(LOGIN_URL, {
      userName,
      password,
    });
    toast.success('Login Was Successful');
    // In response, we receive jwt token and user data
    const { newToken, userInfo } = response.data;
    setSession(newToken);
    const userId = userInfo.id;
    let privileges: string[] = [];
    try {
      const res = await axiosInstance.get(`/Privilege/user/${userId}`);
      privileges = res.data.map((p: any) => p.privilegeName);
    } catch {
      privileges = [];
    }
    setState({
      isAuthenticated: true,
      isAuthLoading: false,
      user: userInfo,
      privileges,
    });
    navigate(PATH_AFTER_LOGIN);
  }, []);
  
  // Logout Method
  const logout = useCallback(() => {
    setSession(null);
    setState({
      isAuthenticated: false,
      isAuthLoading: false,
      user: undefined,
      privileges: [],
    });
    navigate(PATH_PUBLIC.login);
  }, [navigate]);
  
  // We create an object for values of context provider
  // This will keep our codes more readable
  const valuesObject = {
    ...state,
    login,
    register,
    logout,
    updateCredentials
  };
  return <AuthContext.Provider value={valuesObject}>{children}</AuthContext.Provider>;
};

export default AuthContextProvider;