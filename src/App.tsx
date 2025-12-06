import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./hooks/use-theme";
import RootLayout from "./layouts/RootLayout";
import Index from "./pages/Index";
import Orders from "./pages/Orders";
import Settings from "./pages/Settings"; // <--- Import the real page
import NotFound from "./pages/NotFound";

const App = () => (
  <ThemeProvider>
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<Index />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/settings" element={<Settings />} /> {/* <--- Use it here */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </ThemeProvider>
);

export default App;