import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const DashboardHeader = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    localStorage.removeItem("profileId");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-card px-6">
      <SidebarTrigger />

      <div className="flex-1" />

      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5" />
        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
      </Button>

      <Button variant="ghost" size="icon">
        <User className="h-5 w-5" />
      </Button>

      <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
        <LogOut className="h-5 w-5 text-destructive" />
      </Button>
    </header>
  );
};
