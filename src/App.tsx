import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./hooks/use-theme";
import RootLayout from "./layouts/RootLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Placeholder for History (We will build this later)
const Orders = () => (
  <div className="p-8 text-center">
    <h1 className="text-2xl font-bold">Transaction History</h1>
    <p className="text-muted-foreground">Recent sales will appear here.</p>
  </div>
);

// Placeholder for Settings
const Settings = () => (
  <div className="p-8 text-center">
    <h1 className="text-2xl font-bold">Terminal Settings</h1>
    <p className="text-muted-foreground">Printer and hardware configuration.</p>
  </div>
);

const App = () => (
  <ThemeProvider>
    <BrowserRouter>
      <Routes>
        {/* Wrap everything in RootLayout (Navbar + Footer) */}
        <Route element={<RootLayout />}>
          
          {/* Main POS Terminal */}
          <Route path="/" element={<Index />} />
          
          {/* Operational Routes */}
          <Route path="/orders" element={<Orders />} />
          <Route path="/settings" element={<Settings />} />
          
          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  </ThemeProvider>
);

export default App;