import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { Store, Settings, Menu, History, LogOut } from "lucide-react"; // Added LogOut
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { useState } from "react";
import { useAuth } from "./AuthProvider"; // Import Auth Hook
import Logo from "../assets/logo.svg";

export default function Navigation() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { profile, signOut } = useAuth(); // Get profile and logout function

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
                <Menu className="text-primary h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[250px] sm:w-[300px] flex flex-col"
            >
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <img src={Logo} className="h-5 w-5 text-primary" />
                  Splaza POS
                </SheetTitle>
              </SheetHeader>

              {/* Navigation Links */}
              <nav className="text-primary flex flex-col gap-4 mt-8 flex-1">
                <Link
                  to="/"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive("/")
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50"
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
                    isActive("/orders")
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50"
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
                    isActive("/settings")
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50"
                  )}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </nav>

              {/* Mobile Footer: User Info & Logout */}
              <div className="text-primary border-t border-border pt-4 mt-auto space-y-4">
                <div className="flex items-center justify-between px-2">
                  <div className="text-primary flex flex-col">
                    <span className="text-sm font-medium">
                      {profile?.full_name || "Staff"}
                    </span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {profile?.role || "Cashier"}
                    </span>
                  </div>
                  <ThemeToggle />
                </div>
                <Button
                  variant="destructive"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    signOut();
                    setOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* DESKTOP LEFT: Logo & Main Links */}
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <img src={Logo} className="h-5 w-5 text-primary" />
            <span className="hidden font-bold sm:inline-block text-foreground">
              Splaza POS
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

        {/* DESKTOP RIGHT: Status, User & Settings */}
        <div className="text-primary flex flex-1 items-center justify-end space-x-2">
          {/* Online Status */}
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground px-4 border-r border-border mr-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Online
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            {/* Desktop User Info */}
            <div className="hidden md:flex flex-col items-end text-primary text-sm mr-2 leading-none">
              <span className="font-medium">{profile?.full_name}</span>
              <span className="text-xs text-muted-foreground capitalize">
                {profile?.role}
              </span>
            </div>

            <ThemeToggle />

            <Link to="/settings" className="hidden md:block">
              <button
                className={cn(
                  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9",
                  isActive("/settings") && "bg-accent text-accent-foreground"
                )}
                title="Settings"
              >
                <Settings className="text-primary h-4 w-4" />
                <span className="sr-only">Settings</span>
              </button>
            </Link>

            {/* Logout Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              title="Sign Out"
            >
              <LogOut className="h-4 w-4 text-destructive" />
              <span className="sr-only">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
