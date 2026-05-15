"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, Trophy, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import api from "@/lib/api";

export default function AnalyticsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/analytics").then((res) => setData(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!data) return null;

  const { stats, topPerformers } = data;
  const completionRate = stats.totalTasks ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;
  const priorityTotal = (stats.priorityBreakdown?.high || 0) + (stats.priorityBreakdown?.medium || 0) + (stats.priorityBreakdown?.low || 0) || 1;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl sm:text-3xl font-bold">Analytics Dashboard</h1><p className="text-muted-foreground mt-1">Detailed insights into team productivity</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Completion Rate", value: `${completionRate}%`, icon: TrendingUp, color: "text-emerald-500 bg-emerald-500/10" },
          { title: "Active Members", value: stats.activeMembers, icon: Users, color: "text-primary bg-primary/10" },
          { title: "Total Tasks", value: stats.totalTasks, icon: BarChart3, color: "text-amber-500 bg-amber-500/10" },
          { title: "Overdue", value: stats.overdueTasks, icon: ArrowUpRight, color: "text-red-500 bg-red-500/10" },
        ].map((stat, i) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="border-border/50"><CardContent className="p-5">
              <div className={`p-2.5 rounded-xl ${stat.color} w-fit mb-3`}><stat.icon className="w-5 h-5" /></div>
              <p className="text-3xl font-bold">{stat.value}</p><p className="text-sm text-muted-foreground mt-0.5">{stat.title}</p>
            </CardContent></Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50"><CardHeader><CardTitle className="text-base">Task Status Distribution</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Completed", value: stats.completedTasks, color: "bg-emerald-500" },
              { label: "In Progress", value: stats.inProgressTasks, color: "bg-amber-500" },
              { label: "Pending", value: stats.pendingTasks, color: "bg-blue-500" },
              { label: "Overdue", value: stats.overdueTasks, color: "bg-red-500" },
            ].map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm"><span>{item.label}</span><span className="font-medium">{item.value} / {stats.totalTasks}</span></div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div className={`h-full rounded-full ${item.color}`} initial={{ width: 0 }} animate={{ width: `${stats.totalTasks ? (item.value / stats.totalTasks) * 100 : 0}%` }} transition={{ duration: 1, delay: 0.3 }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/50"><CardHeader><CardTitle className="text-base">Priority Breakdown</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              {[
                { label: "High", value: stats.priorityBreakdown?.high || 0, color: "bg-red-500" },
                { label: "Medium", value: stats.priorityBreakdown?.medium || 0, color: "bg-amber-500" },
                { label: "Low", value: stats.priorityBreakdown?.low || 0, color: "bg-emerald-500" },
              ].map((item) => (
                <div key={item.label} className="flex-1 text-center">
                  <p className="text-2xl font-bold">{item.value}</p>
                  <div className="flex items-center gap-1.5 justify-center mt-1"><div className={`w-2 h-2 rounded-full ${item.color}`} /><span className="text-xs text-muted-foreground">{item.label}</span></div>
                </div>
              ))}
            </div>
            <div className="h-4 rounded-full overflow-hidden flex bg-muted">
              <motion.div className="bg-red-500 h-full" initial={{ width: 0 }} animate={{ width: `${((stats.priorityBreakdown?.high || 0) / priorityTotal) * 100}%` }} transition={{ duration: 1 }} />
              <motion.div className="bg-amber-500 h-full" initial={{ width: 0 }} animate={{ width: `${((stats.priorityBreakdown?.medium || 0) / priorityTotal) * 100}%` }} transition={{ duration: 1, delay: 0.1 }} />
              <motion.div className="bg-emerald-500 h-full" initial={{ width: 0 }} animate={{ width: `${((stats.priorityBreakdown?.low || 0) / priorityTotal) * 100}%` }} transition={{ duration: 1, delay: 0.2 }} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 lg:col-span-2"><CardHeader><CardTitle className="text-base flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-500" /> Top Performers</CardTitle></CardHeader>
          <CardContent>
            {!topPerformers?.length ? <p className="text-sm text-muted-foreground text-center py-4">No data yet</p> : (
              <div className="space-y-3">
                {topPerformers.map((p: { name: string; email: string; completedTasks: number }, i: number) => (
                  <motion.div key={p.email} className="flex items-center gap-4 p-3 rounded-lg bg-accent/30" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                    <span className={`text-lg font-bold ${i === 0 ? "text-amber-500" : i === 1 ? "text-zinc-400" : "text-muted-foreground"}`}>#{i + 1}</span>
                    <Avatar className="w-8 h-8"><AvatarFallback className="bg-primary/10 text-primary text-xs">{p.name?.[0]?.toUpperCase()}</AvatarFallback></Avatar>
                    <div className="flex-1"><p className="font-medium text-sm">{p.name}</p><p className="text-xs text-muted-foreground">{p.email}</p></div>
                    <Badge className="bg-emerald-500/10 text-emerald-500">{p.completedTasks} completed</Badge>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
