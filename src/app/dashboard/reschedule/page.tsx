"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarClock, Check, X, Clock } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";

export default function ReschedulePage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [responseNotes, setResponseNotes] = useState<Record<string, string>>({});

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/reschedule");
      setRequests(res.data.requests);
    } catch { toast.error("Failed to load requests"); }
    finally { setLoading(false); }
  };

  const handleRespond = async (requestId: string, status: "approved" | "rejected") => {
    try {
      await api.put("/reschedule", { requestId, status, responseNote: responseNotes[requestId] || "" });
      toast.success(`Request ${status}`);
      fetchRequests();
    } catch { toast.error("Failed to respond"); }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "approved": return "bg-emerald-500/10 text-emerald-500";
      case "rejected": return "bg-red-500/10 text-red-500";
      default: return "bg-amber-500/10 text-amber-500";
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl sm:text-3xl font-bold">Reschedule Requests</h1><p className="text-muted-foreground mt-1">Review and manage deadline change requests</p></div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending", value: requests.filter((r) => r.status === "pending").length, icon: Clock, color: "text-amber-500 bg-amber-500/10" },
          { label: "Approved", value: requests.filter((r) => r.status === "approved").length, icon: Check, color: "text-emerald-500 bg-emerald-500/10" },
          { label: "Rejected", value: requests.filter((r) => r.status === "rejected").length, icon: X, color: "text-red-500 bg-red-500/10" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="border-border/50"><CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${s.color}`}><s.icon className="w-4 h-4" /></div>
              <div><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
            </CardContent></Card>
          </motion.div>
        ))}
      </div>

      <div className="space-y-4">
        {requests.length === 0 ? (
          <Card className="border-border/50"><CardContent className="py-12 text-center">
            <CalendarClock className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">No reschedule requests</p>
          </CardContent></Card>
        ) : requests.map((req, i) => (
          <motion.div key={req._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-border/50">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <Avatar className="w-10 h-10 mt-0.5"><AvatarFallback className="bg-primary/10 text-primary text-sm">{req.requestedBy?.name?.[0]}</AvatarFallback></Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{req.requestedBy?.name}</p>
                        <p className="text-sm text-muted-foreground">Task: <span className="font-medium text-foreground">{req.task?.title}</span></p>
                      </div>
                      <Badge className={statusBadge(req.status)}>{req.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-muted-foreground">Current:</span> <span className="font-medium">{format(new Date(req.currentDeadline), "MMM dd, yyyy")}</span></div>
                      <div><span className="text-muted-foreground">Proposed:</span> <span className="font-medium text-primary">{format(new Date(req.proposedDeadline), "MMM dd, yyyy")}</span></div>
                    </div>
                    <p className="text-sm bg-accent/50 p-3 rounded-lg">{req.reason}</p>
                    {req.status === "pending" && (
                      <div className="flex items-center gap-2 pt-2">
                        <Input placeholder="Response note (optional)" value={responseNotes[req._id] || ""} onChange={(e) => setResponseNotes({ ...responseNotes, [req._id]: e.target.value })} className="flex-1" />
                        <Button size="sm" onClick={() => handleRespond(req._id, "approved")} className="bg-emerald-500 hover:bg-emerald-600 text-white"><Check className="w-4 h-4 mr-1" /> Approve</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleRespond(req._id, "rejected")}><X className="w-4 h-4 mr-1" /> Reject</Button>
                      </div>
                    )}
                    {req.responseNote && <p className="text-sm text-muted-foreground">Response: {req.responseNote}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
