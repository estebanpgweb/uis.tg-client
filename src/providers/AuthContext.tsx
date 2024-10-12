import React, {createContext, useContext, useState} from "react";
import {useAxios} from "./AxiosContext.tsx";
import {AxiosInstance} from "axios";

const AuthContext = createContext<{
    loggedIn: boolean;
    user: unknown;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    me: () => Promise<void>;
} | null>(null);

export const AuthProvider = ({children}: { children: React.ReactNode }) => {
    const [loggedIn, setLoggedIn] = useState(false);
    const [user, setUser] = useState<unknown | null>(null);
    const axios: AxiosInstance = useAxios();

    const login = async (username: string, password: string): Promise<void> => {
        try {
            const {data} = await axios.post('/api/auth/login', {
                username,
                password
            });
            localStorage.setItem('access_token', data);
        } catch (e) {
            setLoggedIn(false);
            throw e;
        }
    };

    const logout: () => void = (): void => {
        setLoggedIn(false);
        localStorage.removeItem('access_token');
    };

    const me: () => Promise<void> = async (): Promise<void> => {
        try {
            const {data} = await axios.get('/api/auth/user');
            setLoggedIn(true);
            setUser(data);
        } catch {
            setLoggedIn(false);
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{loggedIn, user, login, logout, me}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
