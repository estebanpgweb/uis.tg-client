import {useAuth} from "../providers/AuthContext.tsx";
import {PropsWithChildren} from "react";
import {Navigate} from "react-router-dom";

const GuestGuard = ({children}: PropsWithChildren) => {
    const auth = useAuth();
    const access_token: string | null = localStorage.getItem('access_token');

    if (!auth) return null;

    if (access_token) {
        return <Navigate to={'/'}/>
    }

    return children;
};

export default GuestGuard;
