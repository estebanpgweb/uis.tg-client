import "./App.css";
import { useAuth } from "./providers/AuthContext";

function App() {
  const auth = useAuth();

  const logout = async () => {
    await auth?.logout();
  };

  return (
    <>
      <h1>{JSON.stringify(auth?.user)}</h1>
      <button onClick={() => logout()}>logout</button>
    </>
  );
}

export default App;
