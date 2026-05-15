"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Shield,
  ShieldAlert,
  MoreVertical,
  UserCheck,
  UserX,
  Mail,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from "@/lib/api";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UserType = any;

export default function UsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data.users);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await api.put("/admin/users", { userId, role });
      toast.success("Role updated");
      fetchUsers();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Failed to update role");
    }
  };

  const handleStatusChange = async (userId: string, isActive: boolean) => {
    try {
      await api.put("/admin/users", { userId, isActive });
      toast.success(isActive ? "User activated" : "User deactivated");
      fetchUsers();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const admins = users.filter((u) => u.role === "admin");
  const members = users.filter((u) => u.role === "member");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-1">Manage team members and their roles</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: users.length, icon: Users, color: "text-primary bg-primary/10" },
          { label: "Admins", value: admins.length, icon: Shield, color: "text-chart-4 bg-chart-4/10" },
          { label: "Members", value: members.length, icon: UserCheck, color: "text-chart-2 bg-chart-2/10" },
          { label: "Inactive", value: users.filter((u) => !u.isActive).length, icon: UserX, color: "text-destructive bg-destructive/10" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Users Table */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tasks</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u._id || u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {u.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{u.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {u.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={u.role === "admin" ? "bg-chart-4/10 text-chart-4 border-chart-4/20" : ""}
                      >
                        {u.role === "admin" ? <ShieldAlert className="w-3 h-3 mr-1" /> : null}
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.isActive ? "default" : "destructive"} className={u.isActive ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" : ""}>
                        {u.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="font-medium">{u.completedTasks || 0}</span>
                        <span className="text-muted-foreground">/{u.totalTasks || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {u.createdAt ? format(new Date(u.createdAt), "MMM dd, yyyy") : "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-accent">
                            <MoreVertical className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(u._id || u.id, u.role === "admin" ? "member" : "admin")}
                          >
                            <Shield className="w-4 h-4 mr-2" />
                            Make {u.role === "admin" ? "Member" : "Admin"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(u._id || u.id, !u.isActive)}
                            className={u.isActive ? "text-destructive" : "text-emerald-500"}
                          >
                            {u.isActive ? <UserX className="w-4 h-4 mr-2" /> : <UserCheck className="w-4 h-4 mr-2" />}
                            {u.isActive ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
