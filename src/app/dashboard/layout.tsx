"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/components/theme-provider";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ListTodo,
  Users,
  BarChart3,
  CalendarClock,
  Activity,
  Bell,
  Settings,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  Zap,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";

const adminLinks = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/tasks", icon: ListTodo, label: "Tasks" },
  { href: "/dashboard/users", icon: Users, label: "Users" },
  { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/dashboard/reschedule", icon: CalendarClock, label: "Reschedule" },
  { href: "/dashboard/activity", icon: Activity, label: "Activity" },
];

const memberLinks = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/tasks", icon: ListTodo, label: "My Tasks" },
  { href: "/dashboard/notifications", icon: Bell, label: "Notifications" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router, mounted]);

  useEffect(() => {
    if (isAuthenticated) {
      api.get("/notifications?unread=true").then((res) => {
        setUnreadCount(res.data.unreadCount || 0);
      }).catch(() => {});
    }
  }, [isAuthenticated, pathname]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!mounted || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const links = user.role === "admin" ? adminLinks : memberLinks;
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border/50 bg-sidebar">
        <div className="flex items-center gap-2 px-6 h-16 border-b border-border/50">
          <div className="w-8 h-8 rounded-lg animated-gradient flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold gradient-text">TaskFlow</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <link.icon className="w-4.5 h-4.5" />
                {link.label}
                {link.label === "Notifications" && unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-auto h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border/50">
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              className="fixed left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-border/50 z-50 lg:hidden flex flex-col"
              initial={{ x: -264 }}
              animate={{ x: 0 }}
              exit={{ x: -264 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="flex items-center justify-between px-6 h-16 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg animated-gradient flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg font-bold gradient-text">TaskFlow</span>
                </div>
                <button onClick={() => setSidebarOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 px-3 py-4 space-y-1">
                {links.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                    >
                      <link.icon className="w-4.5 h-4.5" />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 border-b border-border/50 glass flex items-center px-4 sm:px-6 gap-4">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1" />

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            {theme === "dark" ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>

          <Link href="/dashboard/notifications" className="relative p-2 rounded-lg hover:bg-accent transition-colors">
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            )}
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-accent transition-colors">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">{initials}</AvatarFallback>
                </Avatar>
                <span className="hidden sm:block text-sm font-medium">{user.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/dashboard/settings')} className="cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
