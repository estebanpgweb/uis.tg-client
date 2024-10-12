import {FormEvent, useState} from "react";
import {useAuth} from "../providers/AuthContext.tsx";
import {useNavigate} from "react-router-dom";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Card} from "@/components/ui/card.tsx";

const LoginRoute = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const navigate = useNavigate();

    const auth = useAuth();

    const onSubmit = async (e: FormEvent): Promise<void> => {
        e.preventDefault();
        try {
            await auth?.login(username, password);
            navigate('/');
        } catch (e) {
            console.error((e as {
                response: {
                    data: {
                        message: string;
                    };
                };
            }).response.data.message);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center">
            <Card className="p-4 min-w-96 space-y-4">
                <h1 className="text-2xl text-center">Iniciar sesión</h1>
                <form
                    className="flex flex-col gap-4"
                    onSubmit={onSubmit}>
                    <Input
                        required
                        type="email"
                        placeholder="Correo electrónico"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <Input
                        required
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button type="submit">
                        Iniciar sesión
                    </Button>
                </form>
            </Card>
        </div>
    );
}

export default LoginRoute;
