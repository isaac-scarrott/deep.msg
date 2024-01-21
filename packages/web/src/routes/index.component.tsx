import { useState } from "react";

import { ScreenNameDialog } from "@/components/ScreenNameDialog";
import { Chat } from "@/components/Chat";

function App() {
  const [screenName, setScreenNameState] = useState(
    localStorage.getItem("screenName"),
  );

  function setScreenName(screenName: string) {
    localStorage.setItem("screenName", screenName);
    setScreenNameState(screenName);
  }

  return (
    <>
      <ScreenNameDialog screenName={screenName} setScreenName={setScreenName} />

      <Chat screenName={screenName} />
    </>
  );
}

export { App as component };
