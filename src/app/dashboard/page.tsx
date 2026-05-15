"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ListTodo,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { format } from "date-fns";

interface StatCard {
  title: string;
  value: number;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
  color: string;
  bgColor: string;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<Record<string, number>>({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      if (user?.role === "admin") {
        const [analyticsRes, tasksRes] = await Promise.all([
          api.get("/admin/analytics"),
          api.get("/tasks?limit=5"),
        ]);
        setStats(analyticsRes.data.stats);
        setRecentTasks(tasksRes.data.tasks);
      } else {
        const tasksRes = await api.get("/tasks?limit=10");
        const tasks = tasksRes.data.tasks;
        setStats({
          totalTasks: tasks.length,
          completedTasks: tasks.filter((t: { status: string }) => t.status === "completed").length,
          pendingTasks: tasks.filter((t: { status: string }) => t.status === "pending").length,
          inProgressTasks: tasks.filter((t: { status: string }) => t.status === "in-progress").length,
        });
        setRecentTasks(tasks.slice(0, 5));
      }
    } catch {
      // Handle silently
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const adminCards: StatCard[] = [
    {
      title: "Total Tasks",
      value: stats.totalTasks || 0,
      icon: ListTodo,
      trend: "+12%",
      trendUp: true,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Completed",
      value: stats.completedTasks || 0,
      icon: CheckCircle2,
      trend: "+8%",
      trendUp: true,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "In Progress",
      value: stats.inProgressTasks || 0,
      icon: Clock,
      trend: "+3%",
      trendUp: true,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Overdue",
      value: stats.overdueTasks || 0,
      icon: AlertTriangle,
      trend: "-2%",
      trendUp: false,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
  ];

  const memberCards: StatCard[] = [
    {
      title: "My Tasks",
      value: stats.totalTasks || 0,
      icon: ListTodo,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Completed",
      value: stats.completedTasks || 0,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Pending",
      value: stats.pendingTasks || 0,
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "In Progress",
      value: stats.inProgressTasks || 0,
      icon: TrendingUp,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
  ];

  const cards = user?.role === "admin" ? adminCards : memberCards;
  const completionRate = stats.totalTasks
    ? Math.round(((stats.completedTasks || 0) / stats.totalTasks) * 100)
    : 0;

  const statusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "in-progress": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "pending": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "overdue": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const priorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500/10 text-red-500";
      case "medium": return "bg-amber-500/10 text-amber-500";
      case "low": return "bg-emerald-500/10 text-emerald-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">
          Welcome back, <span className="gradient-text">{user?.name?.split(" ")[0]}</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          {user?.role === "admin"
            ? "Here's an overview of your team's progress"
            : "Here's what you need to focus on today"}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-border/50 hover:border-border transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className={`p-2.5 rounded-xl ${card.bgColor}`}>
                    <card.icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  {card.trend && (
                    <span className={`flex items-center gap-0.5 text-xs font-medium ${
                      card.trendUp ? "text-emerald-500" : "text-red-500"
                    }`}>
                      {card.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {card.trend}
                    </span>
                  )}
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-bold">{card.value}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{card.title}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Additional widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Completion Rate */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18" cy="18" r="15.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="text-muted/30"
                  />
                  <circle
                    cx="18" cy="18" r="15.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeDasharray={`${completionRate} ${100 - completionRate}`}
                    strokeLinecap="round"
                    className="text-primary"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                  {completionRate}%
                </span>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="font-medium">{stats.completedTasks || 0}</span>
                </div>
                <Progress value={completionRate} className="h-1.5" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Remaining</span>
                  <span className="font-medium">{(stats.totalTasks || 0) - (stats.completedTasks || 0)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin-only members card */}
        {user?.role === "admin" && (
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Team Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Active Members</span>
                </div>
                <Badge variant="secondary">{stats.activeMembers || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="text-sm">Pending Reschedules</span>
                </div>
                <Badge variant="secondary" className="bg-amber-500/10 text-amber-500">{stats.pendingReschedules || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Total Members</span>
                </div>
                <Badge variant="secondary">{stats.totalMembers || 0}</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Tasks */}
        <Card className={`border-border/50 ${user?.role === "admin" ? "" : "lg:col-span-2"}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Recent Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No tasks yet</p>
            ) : (
              recentTasks.map((task) => (
                <div key={task._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    task.priority === "high" ? "bg-red-500" : task.priority === "medium" ? "bg-amber-500" : "bg-emerald-500"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {task.deadline ? format(new Date(task.deadline), "MMM dd") : "No deadline"}
                    </p>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${statusColor(task.status)}`}>
                    {task.status}
                  </Badge>
                  <Badge className={`text-[10px] ${priorityColor(task.priority)}`}>
                    {task.priority}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
