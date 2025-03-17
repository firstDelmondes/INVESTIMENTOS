import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart,
  History,
  Home,
  PieChart,
  Settings,
  FileText,
  Menu,
  X,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AppLayoutProps {
  children?: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Nova Recomendação", href: "/recommendation/new", icon: PieChart },
    { name: "Histórico", href: "/history", icon: History },
    { name: "Relatórios", href: "/report/new", icon: FileText },
    { name: "Configurações", href: "/settings", icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${sidebarCollapsed ? "w-[80px]" : "w-[280px]"} transition-all duration-300 ease-in-out bg-white border-r border-gray-200`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {!sidebarCollapsed && (
              <div className="flex items-center">
                <img
                  className="h-8 w-auto"
                  src="/logo.png"
                  alt="AEGIS Capital"
                />
                <h1 className="ml-2 text-xl font-semibold">AEGIS Capital</h1>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          <ScrollArea className="flex-grow">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(item.href) ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"}`}
                  >
                    <Icon
                      className={`mr-3 flex-shrink-0 h-5 w-5 ${isActive(item.href) ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"}`}
                    />
                    {!sidebarCollapsed && item.name}
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoBack}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {!sidebarCollapsed && "Voltar"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">{children || <Outlet />}</div>
    </div>
  );
};

export default AppLayout;
