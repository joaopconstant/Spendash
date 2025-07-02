import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Moon, Sun, LogOut, User, Home, Plus, BarChart3 } from "lucide-react";
import { useTheme } from "next-themes";
import { useNavigate, useLocation } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", icon: Home, label: "Dashboard" },
    { path: "/expenses", icon: Plus, label: "Gastos" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-100 via-neutral-200 to-neutral-100 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
      {user && (
        <header className="bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur-sm border-b border-neutral-200/50 dark:border-neutral-800/50 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 finance-gradient rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <h1 className="text-xl font-bold gradient-text">Spendash</h1>
              </div>

              <nav className="hidden md:flex space-x-4">
                {navItems.map(item => (
                  <Button
                    key={item.path}
                    variant={
                      location.pathname === item.path ? "default" : "ghost"
                    }
                    size="sm"
                    onClick={() => navigate(item.path)}
                    className={
                      location.pathname === item.path
                        ? "bg-green-600 hover:bg-green-700"
                        : ""
                    }
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                ))}
              </nav>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-9 h-9 p-0"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>

              <div className="flex items-center space-x-2 text-sm">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{user.name}</span>
              </div>

              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Sair</span>
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden border-t border-white/20 px-4 py-2">
            <div className="flex space-x-2">
              {navItems.map(item => (
                <Button
                  key={item.path}
                  variant={
                    location.pathname === item.path ? "default" : "ghost"
                  }
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className={`flex-1 ${
                    location.pathname === item.path
                      ? "bg-green-600 hover:bg-green-700"
                      : ""
                  }`}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        </header>
      )}

      <main className="flex-1">{children}</main>
    </div>
  );
};

export default Layout;
