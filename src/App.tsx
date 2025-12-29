import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./app/routes/routes";
import { ToastProvider } from "./app/services/ui";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppRoutes />
        <Toaster />
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
