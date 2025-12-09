import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./hooks/use-theme";
import { AuthProvider, useAuth } from "./components/AuthProvider"; // Import Auth
import RootLayout from "./layouts/RootLayout";
import Index from "./pages/Index";
import Orders from "./pages/Orders";
import Settings from "./pages/Settings";
import Login from "./pages/Login"; // Import Login
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

// Separate component to handle auth logic cleanly
const AppRoutes = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<Index />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </ThemeProvider>
);

export default App;