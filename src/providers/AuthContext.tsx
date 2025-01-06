import React, { createContext, useContext, useState } from "react";
import { useAxios } from "./AxiosContext.tsx";
import { AxiosInstance } from "axios";

const AuthContext = createContext<{
  loggedIn: boolean;
  user: unknown;
  register: (
    email: string,
    password: string,
    confirmPassword: string,
    name: string,
    lastname: string
  ) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  me: () => Promise<void>;
} | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<unknown | null>(null);
  const axios: AxiosInstance = useAxios();

  const register = async (
    email: string,
    password: string,
    confirmPassword: string,
    name: string,
    lastname: string
  ): Promise<void> => {
    try {
      await axios.post("/api/auth/register", {
        email,
        password,
        confirm_password: confirmPassword,
        name,
        lastname,
      });
      console.log("Waiting for email confirmation");
    } catch (e) {
      setLoggedIn(false);
      throw e;
    }
  };

  const login = async (username: string, password: string): Promise<void> => {
    try {
      const { data } = await axios.post("/api/auth/login", {
        username,
        password,
      });
      localStorage.setItem("access_token", data.access_token);
      setLoggedIn(true);
    } catch (e) {
      setLoggedIn(false);
      throw e;
    }
  };

  const logout: () => void = (): void => {
    setLoggedIn(false);
    setUser(null);
    localStorage.removeItem("access_token");
  };

  const me: () => Promise<void> = async (): Promise<void> => {
    try {
      const { data } = await axios.get("/api/auth/user");
      setUser(data);
      setLoggedIn(true);
    } catch {
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{ loggedIn, user, register, login, logout, me }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
