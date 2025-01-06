import {createBrowserRouter, RouterProvider} from "react-router-dom";
import App from "../App.tsx";
import { Toaster } from "@/components/ui/toaster";
import {PropsWithChildren} from "react";
import {AxiosProvider} from "./AxiosContext.tsx";
import LoginRoute from "../routes/login.tsx";
import RegisterRoute from "../routes/register.tsx";
import {AuthProvider} from "./AuthContext.tsx";
import AuthGuard from "../guard/AuthGuard.tsx";
import GuestGuard from "../guard/GuestGuard.tsx";
import {ThemeProvider} from "@/providers/ThemeProvider.tsx";

const router = createBrowserRouter([
    {
        path: '/',
        element:
            <AuthGuard>
                <App/>
            </AuthGuard>,
    },
    {
        path: '/login',
        element:
            <GuestGuard>
                <LoginRoute/>,
            </GuestGuard>
    },
    {
        path: '/register',
        element:
            <GuestGuard>
                <RegisterRoute/>
            </GuestGuard>
    }
]);


const Providers = ({children}: PropsWithChildren) => {
    return (
        <>
            <AxiosProvider>
                <AuthProvider>
                    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
                        <RouterProvider router={router}/>
                        {children}
                        <Toaster/>
                    </ThemeProvider>
                </AuthProvider>
            </AxiosProvider>
        </>
    );
}

export default Providers;
