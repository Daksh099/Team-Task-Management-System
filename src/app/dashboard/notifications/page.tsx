"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, Check, CheckCheck } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

export default function NotificationsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications);
    } catch {} finally { setLoading(false); }
  };

  const markAllRead = async () => {
    try {
      await api.put("/notifications", { markAll: true });
      toast.success("All marked as read");
      fetchNotifications();
    } catch { toast.error("Failed"); }
  };

  const markRead = async (id: string) => {
    try {
      await api.put("/notifications", { notificationIds: [id] });
      fetchNotifications();
    } catch {}
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case "task_assigned": return "📋";
      case "task_updated": return "🔄";
      case "reschedule_response": return "📅";
      case "deadline_reminder": return "⏰";
      default: return "🔔";
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const unread = notifications.filter((n) => !n.read);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl sm:text-3xl font-bold">Notifications</h1><p className="text-muted-foreground mt-1">{unread.length} unread notification{unread.length !== 1 ? "s" : ""}</p></div>
        {unread.length > 0 && <Button variant="outline" size="sm" onClick={markAllRead}><CheckCheck className="w-4 h-4 mr-2" /> Mark all read</Button>}
      </div>

      <div className="space-y-2">
        {notifications.length === 0 ? (
          <Card className="border-border/50"><CardContent className="py-12 text-center">
            <Bell className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">No notifications</p>
          </CardContent></Card>
        ) : notifications.map((n, i) => (
          <motion.div key={n._id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Card className={`border-border/50 transition-colors ${!n.read ? "bg-primary/5 border-primary/20" : ""}`}>
              <CardContent className="p-4 flex items-start gap-3">
                <span className="text-xl">{typeIcon(n.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm ${!n.read ? "font-semibold" : "font-medium"}`}>{n.title}</p>
                    {!n.read && <Badge className="bg-primary/10 text-primary text-[10px]">New</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{format(new Date(n.createdAt), "MMM dd, yyyy HH:mm")}</p>
                </div>
                {!n.read && <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => markRead(n._id)}><Check className="w-3.5 h-3.5" /></Button>}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
