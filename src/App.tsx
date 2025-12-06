import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Policy/Privacy";
import Terms from "./pages/Policy/Terms";
import Cookies from "./pages/Policy/Cookies";
import NotFound from "./pages/NotFound";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import { ThemeProvider } from "./hooks/use-theme";
import { ThemeToggle } from "./components/ThemeToggle";
import { Toaster } from "./components/ui/toaster";
import Analytics from "./components/Analytics";
import CookieConsent from "./components/CookieConsent";

const App = () => (
  <ThemeProvider>
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors">
        <Navigation />
        <div className="flex-1 container mx-auto px-4 py-8 w-full">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/policy/privacy" element={<Privacy />} />
            <Route path="/policy/terms" element={<Terms />} />
            <Route path="/policy/cookies" element={<Cookies />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <div className="fixed bottom-6 right-6 z-50">
          <ThemeToggle />
        </div>
        <Footer />
        <Toaster />
        <Analytics />
        <CookieConsent />
      </div>
    </BrowserRouter>
  </ThemeProvider>
);

export default App;
