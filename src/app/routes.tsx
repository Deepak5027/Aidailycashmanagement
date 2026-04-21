import { createBrowserRouter } from "react-router";
import Root from "./pages/Root";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Budget from "./pages/Budget";
import Alerts from "./pages/Alerts";
import Scanner from "./pages/Scanner";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import VoiceEntry from "./pages/VoiceEntry";
import SmartInsights from "./pages/SmartInsights";
import Goals from "./pages/Goals";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/app",
    element: <Root />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "transactions", element: <Transactions /> },
      { path: "budget", element: <Budget /> },
      { path: "alerts", element: <Alerts /> },
      { path: "scanner", element: <Scanner /> },
      { path: "analytics", element: <Analytics /> },
      { path: "voice", element: <VoiceEntry /> },
      { path: "insights", element: <SmartInsights /> },
      { path: "goals", element: <Goals /> },
      { path: "profile", element: <Profile /> },
    ],
  },
]);