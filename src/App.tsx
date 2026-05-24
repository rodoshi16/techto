import { AppProvider, useApp } from "./context/AppContext";
import { PhoneFrame } from "./components/layout/PhoneFrame";
import { BottomNav } from "./components/layout/BottomNav";
import { HomeScreen } from "./components/home/HomeScreen";
import { AccountScreen } from "./components/accounts/AccountScreen";
import { GoalsScreen } from "./components/goals/GoalsScreen";
import { PlaceholderScreen } from "./components/screens/PlaceholderScreen";
import { SageChat } from "./components/sage/SageChat";
import { SageFAB } from "./components/sage/SageFAB";
import { SoraVoice } from "./components/sage/SoraVoice";

function AppShell() {
  const { screen, soraOpen, sageOpen } = useApp();

  const renderScreen = () => {
    switch (screen) {
      case "chequing":
        return <AccountScreen type="chequing" />;
      case "savings":
        return <AccountScreen type="savings" />;
      case "credit":
        return <AccountScreen type="credit" />;
      case "goals":
        return <GoalsScreen />;
      case "move-money":
        return <PlaceholderScreen title="Move Money" />;
      case "more":
        return <PlaceholderScreen title="More" />;
      case "home":
      default:
        return <HomeScreen />;
    }
  };

  return (
    <PhoneFrame>
      <div className="relative flex flex-col flex-1 min-h-0 overflow-hidden">
        {renderScreen()}
        <SageFAB />
        <BottomNav />
        {sageOpen && <SageChat />}
        {soraOpen && <SoraVoice />}
      </div>
    </PhoneFrame>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
