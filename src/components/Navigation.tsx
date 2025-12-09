import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { Store, Settings, Menu, History } from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "./ui/sheet";
import { useState } from "react";

export default function Navigation() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Helper to check active state
  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-14 items-center px-4 md:px-6">
        
        {/* MOBILE MENU TRIGGER */}
        <div className="md:hidden mr-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[250px] sm:w-[300px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-primary" />
                  DM POS
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-8">
                <Link
                  to="/"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive("/") ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                  )}
                >
                  <Store className="h-4 w-4" />
                  Register
                </Link>
                <Link
                  to="/orders"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive("/orders") ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                  )}
                >
                  <History className="h-4 w-4" />
                  History
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive("/settings") ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                  )}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Left Side: Logo & Main Links (Desktop) */}
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
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
        <div className="flex flex-1 items-center justify-end space-x-2">
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground px-4 border-r border-border mr-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Online
          </div>
          <nav className="flex items-center gap-1 md:gap-2">
            <ThemeToggle />
            
            <Link to="/settings" className="hidden md:block">
                <button 
                  className={cn(
                    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9",
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