import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { Store, Settings } from "lucide-react";
import { cn } from "../lib/utils";

export default function Navigation() {
  const location = useLocation();

  // Helper to check active state
  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-14 items-center px-6">
        {/* Left Side: Logo & Main Links */}
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            {/* FIX: Added text-primary so it is visible in dark mode */}
            <Store className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block text-foreground">
              DM POS
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              to="/"
              className={cn(
                "transition-colors hover:text-primary",
                isActive("/") 
                  ? "text-foreground font-bold border-b-2 border-primary h-14 flex items-center" 
                  : "text-muted-foreground"
              )}
            >
              Register
            </Link>
            <Link
              to="/orders"
              className={cn(
                "transition-colors hover:text-primary",
                isActive("/orders") 
                  ? "text-foreground font-bold border-b-2 border-primary h-14 flex items-center" 
                  : "text-muted-foreground"
              )}
            >
              History
            </Link>
          </nav>
        </div>
        
        {/* Right Side: Status & Settings */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <div className="flex items-center gap-2 text-sm text-muted-foreground px-4 border-r border-border mr-2">
               {/* Status Dot */}
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Online
            </div>
          </div>
          <nav className="flex items-center gap-2">
            <ThemeToggle />
            
            <Link to="/settings">
                <button 
                  className={cn(
                    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9",
                    // FIX: Highlight settings button when active
                    isActive("/settings") && "bg-accent text-accent-foreground"
                  )}
                >
                    <Settings className="text-primary h-4 w-4" />
                    <span className="sr-only">Settings</span>
                </button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}