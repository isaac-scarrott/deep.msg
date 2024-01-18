import { useState } from "react";
import { Chat } from "./components/Chat1";

function App() {
  const [screenName, setScreenName] = useState(
    localStorage.getItem("screenName"),
  );

  return <Chat screenName={screenName} />;
}

export default App;
