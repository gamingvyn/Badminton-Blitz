import { useEffect } from "react";
import "@fontsource/inter";
import { useBadminton } from "./lib/stores/useBadminton";
import { LoginScreen } from "./components/game/LoginScreen";
import { RegisterScreen } from "./components/game/RegisterScreen";
import { MenuScreen } from "./components/game/MenuScreen";
import { BadmintonGame } from "./components/game/BadmintonGame";
import { MatchEndScreen } from "./components/game/MatchEndScreen";
import { StatsScreen } from "./components/game/StatsScreen";

function App() {
  const { screen } = useBadminton();
  
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    
    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden" }}>
      {screen === "login" && <LoginScreen />}
      {screen === "register" && <RegisterScreen />}
      {screen === "menu" && <MenuScreen />}
      {screen === "stats" && <StatsScreen />}
      {screen === "playing" && <BadmintonGame />}
      {screen === "matchEnd" && (
        <>
          <BadmintonGame />
          <MatchEndScreen />
        </>
      )}
    </div>
  );
}

export default App;
