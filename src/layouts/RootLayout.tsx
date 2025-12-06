import { Outlet } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { Toaster } from "../components/ui/toaster";

export default function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans antialiased">
      <Navigation />
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* The 'Outlet' renders the child route (e.g. Index.tsx) */}
        <Outlet />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}