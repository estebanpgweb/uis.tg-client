import {Context, createContext, PropsWithChildren, useContext} from 'react';
import instance from '../utils/axios';
import {AxiosInstance} from "axios";

const AxiosContext: Context<AxiosInstance> = createContext(instance);

export const AxiosProvider = ({children}: PropsWithChildren) => {
    return (
        <AxiosContext.Provider value={instance}>
            {children}
        </AxiosContext.Provider>
    );
};

export const useAxios: () => AxiosInstance = (): AxiosInstance => {
    return useContext(AxiosContext);
};
