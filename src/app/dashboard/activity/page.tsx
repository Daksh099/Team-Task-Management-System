"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Filter } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

export default function ActivityPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => { fetchLogs(); }, [filter, page]);

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "20");
      if (filter !== "all") params.set("entityType", filter);
      const res = await api.get(`/admin/activity?${params}`);
      setLogs(res.data.logs);
      setPagination(res.data.pagination);
    } catch {} finally { setLoading(false); }
  };

  const actionColor = (action: string) => {
    if (action.includes("CREATE") || action.includes("REGISTER")) return "bg-emerald-500/10 text-emerald-500";
    if (action.includes("DELETE")) return "bg-red-500/10 text-red-500";
    if (action.includes("UPDATE") || action.includes("APPROVED")) return "bg-blue-500/10 text-blue-500";
    return "bg-amber-500/10 text-amber-500";
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl sm:text-3xl font-bold">Activity Logs</h1><p className="text-muted-foreground mt-1">Track all actions and changes</p></div>
        <Select value={filter} onValueChange={(v) => { if (v) { setFilter(v); setPage(1); } }}>
          <SelectTrigger className="w-40"><Filter className="w-4 h-4 mr-2" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Activity</SelectItem>
            <SelectItem value="task">Tasks</SelectItem>
            <SelectItem value="user">Users</SelectItem>
            <SelectItem value="auth">Auth</SelectItem>
            <SelectItem value="reschedule">Reschedule</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <div className="py-12 text-center"><Activity className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" /><p className="text-muted-foreground">No activity logs found</p></div>
          ) : (
            <div className="divide-y divide-border/50">
              {logs.map((log, i) => (
                <motion.div key={log._id} className="flex items-start gap-4 p-4 hover:bg-accent/30 transition-colors" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                  <Avatar className="w-8 h-8 mt-0.5"><AvatarFallback className="bg-primary/10 text-primary text-xs">{log.user?.name?.[0]}</AvatarFallback></Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm"><span className="font-medium">{log.user?.name}</span> <span className="text-muted-foreground">{log.details}</span></p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`text-[10px] ${actionColor(log.action)}`}>{log.action}</Badge>
                      <span className="text-[10px] text-muted-foreground">{format(new Date(log.createdAt), "MMM dd, yyyy HH:mm")}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {page} of {pagination.pages}</span>
          <Button variant="outline" size="sm" disabled={page >= pagination.pages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
