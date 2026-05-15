"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Lock, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);

  const initials = user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  const handleSave = async () => {
    if (!name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      updateUser({ name: name.trim() });
      toast.success("Profile updated");
    } catch { toast.error("Failed to update"); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h1 className="text-2xl sm:text-3xl font-bold">Profile Settings</h1><p className="text-muted-foreground mt-1">Manage your account settings</p></div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="w-4 h-4" /> Profile Information</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16"><AvatarFallback className="bg-primary/10 text-primary text-xl">{initials}</AvatarFallback></Avatar>
              <div>
                <p className="font-semibold text-lg">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <Badge className="mt-1 capitalize">{user?.role}</Badge>
              </div>
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user?.email || ""} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
              <Button onClick={handleSave} disabled={saving} className="animated-gradient text-white border-0">
                {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Lock className="w-4 h-4" /> Security</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Password changes can be done via the forgot password flow.</p>
            <Button variant="outline" onClick={() => window.location.href = "/forgot-password"}>Change Password</Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
