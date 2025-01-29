import axios, {AxiosError, AxiosInstance} from 'axios';

const instance: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 1000000,
});

instance.interceptors.request.use(
    (config) => {
        const access_token: string | null = localStorage.getItem('access_token');
        if (access_token) {
            config.headers.Authorization = `Bearer ${access_token}`;
            config.headers['Content-Type'] = 'application/json';
            config.headers.Accept = 'application/json';
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error: AxiosError) => {
        if (error.response && error.response.status === 401) {
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default instance;
