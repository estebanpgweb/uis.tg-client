import "./App.css";
import { useAuth } from "./providers/AuthContext";

function App() {
  const auth = useAuth();

  const test = async () => {
    console.log("HOLAA");
  };

  return (
    <>
        <h1>{JSON.stringify(auth?.user)}</h1>
      <button onClick={() => test()}>HOLAA</button>
    </>
  );
}

export default App;
