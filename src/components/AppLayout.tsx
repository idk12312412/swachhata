import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, getRankInfo } from "@/hooks/useProfile";
import { useIsAdmin } from "@/hooks/useAdmin";
import { Home, Camera, History, BarChart3, User, Shield, LogOut, Trophy, PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";

const navItems = [
  { to: "/dashboard", icon: Home, label: "Home" },
  { to: "/classify", icon: Camera, label: "Classify" },
  { to: "/history", icon: History, label: "History" },
  { to: "/stats", icon: BarChart3, label: "Stats" },
  { to: "/leaderboard", icon: Trophy, label: "Board" },
  { to: "/gallery", icon: PenSquare, label: "Blog" },
  { to: "/profile", icon: User, label: "Profile" },
];

const AppLayout = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const { signOut } = useAuth();
  const { profile } = useProfile();
  const { data: isAdmin } = useIsAdmin();
  const rankInfo = getRankInfo(profile?.points ?? 0);

  return (
    <div className="min-h-screen bg-background flex flex-col transition-colors duration-200">
      {/* Desktop header */}
      <header className="hidden md:flex items-center justify-between px-6 py-3 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <Link to="/dashboard">
          <Logo variant="full" className="h-14" />
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to}>
              <Button
                variant={pathname === item.to ? "secondary" : "ghost"}
                size="sm"
                className="gap-2"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Button>
            </Link>
          ))}
          {profile?.is_human_classifier && (
            <Link to="/classifier">
              <Button variant={pathname === "/classifier" ? "secondary" : "ghost"} size="sm" className="gap-2">
                <Shield className="w-4 h-4" />
                Classifier
              </Button>
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin">
              <Button variant={pathname === "/admin" ? "secondary" : "ghost"} size="sm" className="gap-2">
                <Shield className="w-4 h-4" />
                Admin
              </Button>
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">
            {rankInfo.emoji} {profile?.points ?? 0} pts
          </span>
          <Button variant="ghost" size="icon" onClick={signOut}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Mobile header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <Link to="/dashboard">
          <Logo variant="full" className="h-11" />
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">{rankInfo.emoji} {profile?.points ?? 0}</span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={signOut}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 pb-20 md:pb-6">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 border-t bg-card/95 backdrop-blur-sm z-50 flex justify-around py-2">
        {navItems.map((item) => {
          const active = pathname === item.to;
          return (
            <Link key={item.to} to={item.to} className="flex flex-col items-center gap-0.5">
              <item.icon className={`w-5 h-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-[10px] ${active ? "text-primary font-medium" : "text-muted-foreground"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default AppLayout;
