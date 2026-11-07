import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import { primeVictorySound } from "./lib/stillness/victorySound";
import "./index.css";

primeVictorySound();

createRoot(document.getElementById("root")!).render(<App />);
