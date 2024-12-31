import "./App.css";
import { useAuth } from "./providers/AuthContext";

function App() {
  const auth = useAuth();

  const test = async () => {
    console.log("HOLAA");
  };

  return (
    <>
      <button onClick={() => test()}>HOLAA</button>
    </>
  );
}

export default App;
