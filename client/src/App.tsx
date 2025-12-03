import { useEffect } from "react";
import "@fontsource/inter";
import { useBadminton } from "./lib/stores/useBadminton";
import { MenuScreen } from "./components/game/MenuScreen";
import { BadmintonGame } from "./components/game/BadmintonGame";
import { MatchEndScreen } from "./components/game/MatchEndScreen";

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
      {screen === "menu" && <MenuScreen />}
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
