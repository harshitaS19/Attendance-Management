import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface Tab {
  id: string;
  label: string;
}

interface DashboardNavProps {
  title: string;
  onLogout: () => void;
  tabs?: Tab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

const DashboardNav = ({ title, onLogout, tabs, activeTab, onTabChange }: DashboardNavProps) => {
  return (
    <nav className="bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold text-primary">{title}</h1>
          <Button variant="outline" onClick={onLogout} size="sm">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
        
        {tabs && tabs.length > 0 && (
          <div className="flex gap-1 pb-2 overflow-x-auto">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                onClick={() => onTabChange?.(tab.id)}
                size="sm"
              >
                {tab.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default DashboardNav;
