import { Outlet } from "react-router-dom";
import Navigation from "../components/Navigation";
import { Toaster } from "../components/ui/toaster";

export default function RootLayout() {
  return (
    // h-screen ensures the app never exceeds the browser window height
    <div className="flex h-screen flex-col bg-background font-sans antialiased overflow-hidden">
      <Navigation />
      
      {/* flex-1 takes all remaining space. overflow-hidden prevents window scroll */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <Outlet />
      </main>
      
      <Toaster />
    </div>
  );
}