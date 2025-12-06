import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { Store, Settings } from "lucide-react";
import { cn } from "../lib/utils";

export default function Navigation() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-14 items-center px-6">
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <Store className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">
              DM POS Terminal
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              to="/"
              className={cn(
                "transition-colors hover:text-foreground/80",
                isActive("/") ? "text-foreground font-bold" : "text-foreground/60"
              )}
            >
              Register
            </Link>
            <Link
              to="/orders"
              className={cn(
                "transition-colors hover:text-foreground/80",
                isActive("/orders") ? "text-foreground font-bold" : "text-foreground/60"
              )}
            >
              History
            </Link>
          </nav>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <div className="flex items-center gap-2 text-sm text-muted-foreground px-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              System Online
            </div>
          </div>
          <nav className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/settings">
                <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9">
                    <Settings className="h-4 w-4" />
                    <span className="sr-only">Settings</span>
                </button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}