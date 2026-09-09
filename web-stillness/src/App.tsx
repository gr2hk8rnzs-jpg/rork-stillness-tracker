import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { TooltipProvider } from "@/components/ui/tooltip";
import { StillnessProvider } from "@/lib/stillness/store";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import QuestLog from "./pages/QuestLog";
import Streak from "./pages/Streak";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <StillnessProvider>
      <TooltipProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/quest-log" element={<QuestLog />} />
            <Route path="/streak" element={<Streak />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </StillnessProvider>
  </QueryClientProvider>
);

export default App;
