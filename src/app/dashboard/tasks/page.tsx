"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
  Calendar,
  Loader2,
  ListTodo,
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { taskSchema, TaskFormData } from "@/lib/validations";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TaskType = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UserType = any;

export default function TasksPage() {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskType | null>(null);
  const [viewingTask, setViewingTask] = useState<TaskType | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [comment, setComment] = useState("");
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({ proposedDeadline: "", reason: "" });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  });

  const fetchTasks = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (priorityFilter !== "all") params.set("priority", priorityFilter);
      params.set("limit", "50");

      const res = await api.get(`/tasks?${params.toString()}`);
      setTasks(res.data.tasks);
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, priorityFilter]);

  const fetchUsers = useCallback(async () => {
    if (user?.role === "admin") {
      try {
        const res = await api.get("/admin/users");
        setUsers(res.data.users.filter((u: UserType) => u.isActive));
      } catch {
        // silently fail
      }
    }
  }, [user?.role]);

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, [fetchTasks, fetchUsers]);

  const onCreateEdit = async (data: TaskFormData) => {
    setSubmitting(true);
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, data);
        toast.success("Task updated");
      } else {
        await api.post("/tasks", data);
        toast.success("Task created");
      }
      setDialogOpen(false);
      setEditingTask(null);
      reset();
      fetchTasks();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Failed to save task");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success("Task deleted");
      fetchTasks();
    } catch {
      toast.error("Failed to delete task");
    }
  };

  const handleStatusChange = async (taskId: string, status: string) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      toast.success("Status updated");
      fetchTasks();
      if (viewingTask?._id === taskId) {
        setViewingTask({ ...viewingTask, status });
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleComment = async () => {
    if (!comment.trim() || !viewingTask) return;
    try {
      const res = await api.post(`/tasks/${viewingTask._id}/comments`, { text: comment });
      setViewingTask({ ...viewingTask, comments: res.data.comments });
      setComment("");
      toast.success("Comment added");
    } catch {
      toast.error("Failed to add comment");
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleData.proposedDeadline || !rescheduleData.reason || !viewingTask) return;
    try {
      await api.post("/reschedule", {
        taskId: viewingTask._id,
        ...rescheduleData,
      });
      toast.success("Reschedule request submitted");
      setRescheduleOpen(false);
      setRescheduleData({ proposedDeadline: "", reason: "" });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Failed to submit request");
    }
  };

  const openEdit = (task: TaskType) => {
    setEditingTask(task);
    setValue("title", task.title);
    setValue("description", task.description);
    setValue("priority", task.priority);
    setValue("assignedTo", task.assignedTo?._id || task.assignedTo);
    setValue("deadline", format(new Date(task.deadline), "yyyy-MM-dd"));
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditingTask(null);
    reset();
    setDialogOpen(true);
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "in-progress": return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "pending": return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      default: return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
    }
  };

  const priorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500/10 text-red-600 dark:text-red-400";
      case "medium": return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
      default: return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            {user?.role === "admin" ? "Task Management" : "My Tasks"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""} found
          </p>
        </div>
        {user?.role === "admin" && (
          <Button onClick={openCreate} className="animated-gradient text-white border-0">
            <Plus className="w-4 h-4 mr-2" /> New Task
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={(v) => v && setPriorityFilter(v)}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        <AnimatePresence>
          {tasks.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="py-12 text-center">
                <ListTodo className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No tasks found</p>
              </CardContent>
            </Card>
          ) : (
            tasks.map((task, i) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className="border-border/50 hover:border-border hover:shadow-sm transition-all group">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`w-1.5 h-12 rounded-full flex-shrink-0 ${
                      task.priority === "high" ? "bg-red-500" : task.priority === "medium" ? "bg-amber-500" : "bg-emerald-500"
                    }`} />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm sm:text-base truncate">{task.title}</h3>
                        <Badge variant="outline" className={`text-[10px] ${statusColor(task.status)}`}>
                          {task.status}
                        </Badge>
                        <Badge className={`text-[10px] ${priorityColor(task.priority)}`}>
                          {task.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        {task.assignedTo && (
                          <span className="flex items-center gap-1">
                            <Avatar className="w-4 h-4">
                              <AvatarFallback className="text-[8px] bg-primary/10">
                                {task.assignedTo.name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            {task.assignedTo.name}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(task.deadline), "MMM dd, yyyy")}
                        </span>
                      </div>
                    </div>

                    {/* Status change for members */}
                    {user?.role === "member" && (
                      <Select
                        value={task.status}
                        onValueChange={(val) => val && handleStatusChange(task._id, val)}
                      >
                        <SelectTrigger className="w-32 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                          <MoreVertical className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setViewingTask(task)}>
                          <Eye className="w-4 h-4 mr-2" /> View Details
                        </DropdownMenuItem>
                        {user?.role === "admin" && (
                          <>
                            <DropdownMenuItem onClick={() => openEdit(task)}>
                              <Pencil className="w-4 h-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(task._id)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTask ? "Edit Task" : "Create New Task"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onCreateEdit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input {...register("title")} placeholder="Task title" />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea {...register("description")} placeholder="Describe the task..." rows={3} />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select onValueChange={(val) => val && setValue("priority", val as "low" | "medium" | "high")} defaultValue={editingTask?.priority || "medium"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Deadline</Label>
                <Input type="date" {...register("deadline")} />
                {errors.deadline && <p className="text-sm text-destructive">{errors.deadline.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Assign To</Label>
              <Select onValueChange={(val) => val && setValue("assignedTo", val)} defaultValue={editingTask?.assignedTo?._id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u: UserType) => (
                    <SelectItem key={u._id || u.id} value={u._id || u.id}>
                      {u.name} ({u.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.assignedTo && <p className="text-sm text-destructive">{errors.assignedTo.message}</p>}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="animated-gradient text-white border-0">
                {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {editingTask ? "Update Task" : "Create Task"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Task Detail Dialog */}
      <Dialog open={!!viewingTask} onOpenChange={() => setViewingTask(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {viewingTask && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-3">
                  <div className={`w-1.5 h-8 rounded-full mt-0.5 ${
                    viewingTask.priority === "high" ? "bg-red-500" : viewingTask.priority === "medium" ? "bg-amber-500" : "bg-emerald-500"
                  }`} />
                  <div>
                    <DialogTitle className="text-lg">{viewingTask.title}</DialogTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className={`${statusColor(viewingTask.status)}`}>
                        {viewingTask.status}
                      </Badge>
                      <Badge className={priorityColor(viewingTask.priority)}>
                        {viewingTask.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Description</h4>
                  <p className="text-sm text-muted-foreground">{viewingTask.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Assigned to</span>
                    <p className="font-medium mt-0.5">{viewingTask.assignedTo?.name || "Unassigned"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Deadline</span>
                    <p className="font-medium mt-0.5">{format(new Date(viewingTask.deadline), "MMM dd, yyyy")}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Created by</span>
                    <p className="font-medium mt-0.5">{viewingTask.createdBy?.name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Created</span>
                    <p className="font-medium mt-0.5">{format(new Date(viewingTask.createdAt), "MMM dd, yyyy")}</p>
                  </div>
                </div>

                {/* Status change */}
                {user?.role === "member" && viewingTask.status !== "completed" && (
                  <div className="flex gap-2">
                    <Select
                      value={viewingTask.status}
                      onValueChange={(val) => val && handleStatusChange(viewingTask._id, val)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Done</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRescheduleOpen(true)}
                    >
                      Request Reschedule
                    </Button>
                  </div>
                )}

                {/* Comments */}
                <div className="border-t border-border/50 pt-4">
                  <h4 className="text-sm font-medium mb-3">Comments</h4>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {viewingTask.comments?.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No comments yet</p>
                    ) : (
                      viewingTask.comments?.map((c: { _id: string; user?: { name: string }; text: string; createdAt: string }, i: number) => (
                        <div key={c._id || i} className="flex gap-2">
                          <Avatar className="w-6 h-6 mt-0.5">
                            <AvatarFallback className="text-[10px] bg-primary/10">
                              {c.user?.name?.[0] || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium">{c.user?.name || "Unknown"}</span>
                              <span className="text-[10px] text-muted-foreground">
                                {format(new Date(c.createdAt), "MMM dd, HH:mm")}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{c.text}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Input
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleComment()}
                    />
                    <Button size="sm" onClick={handleComment} disabled={!comment.trim()}>
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Reschedule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Proposed Deadline</Label>
              <Input
                type="date"
                value={rescheduleData.proposedDeadline}
                onChange={(e) => setRescheduleData({ ...rescheduleData, proposedDeadline: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea
                placeholder="Explain why you need a reschedule..."
                value={rescheduleData.reason}
                onChange={(e) => setRescheduleData({ ...rescheduleData, reason: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRescheduleOpen(false)}>Cancel</Button>
              <Button onClick={handleReschedule} className="animated-gradient text-white border-0">
                Submit Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
