"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "@/components/theme-provider";
import {
  CheckCircle2,
  LayoutDashboard,
  Users,
  BarChart3,
  Shield,
  Zap,
  ArrowRight,
  Moon,
  Sun,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const features = [
  {
    icon: LayoutDashboard,
    title: "Intuitive Dashboard",
    description: "Get a clear overview of all tasks, deadlines, and team performance at a glance.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Assign tasks, leave comments, and track progress in real-time with your team.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description: "Monitor productivity with detailed charts, trends, and performance metrics.",
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    description: "Secure admin and member roles with granular permissions and access control.",
  },
  {
    icon: Zap,
    title: "Smart Notifications",
    description: "Stay updated with instant alerts for task assignments, updates, and deadlines.",
  },
  {
    icon: CheckCircle2,
    title: "Task Lifecycle",
    description: "Complete workflow from creation to completion with reschedule request support.",
  },
];

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg animated-gradient flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">TaskFlow</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                How it Works
              </Link>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <Link href="/login">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="animated-gradient text-white border-0">
                  Get Started <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button onClick={() => setMobileMenu(!mobileMenu)} className="p-2">
                {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="md:hidden pb-4 space-y-3"
            >
              <Link href="#features" className="block py-2 text-sm text-muted-foreground">Features</Link>
              <Link href="#how-it-works" className="block py-2 text-sm text-muted-foreground">How it Works</Link>
              <div className="flex gap-2 pt-2">
                <Link href="/login" className="flex-1">
                  <Button variant="outline" className="w-full" size="sm">Log in</Button>
                </Link>
                <Link href="/register" className="flex-1">
                  <Button className="w-full animated-gradient text-white border-0" size="sm">Get Started</Button>
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-chart-4/10 rounded-full blur-3xl" />
        </div>

        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full border border-primary/20 bg-primary/5 text-sm text-primary"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Zap className="w-4 h-4" />
            <span>Streamline your team&apos;s workflow</span>
          </motion.div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6">
            Manage Tasks with{" "}
            <span className="gradient-text">Clarity & Speed</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            TaskFlow is the modern task management platform that helps teams organize, assign,
            and track work effortlessly. Built for productivity, designed for humans.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="animated-gradient text-white border-0 px-8 text-base glow-pulse">
                Start Free <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="px-8 text-base">
                Sign In
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          className="max-w-5xl mx-auto mt-16 rounded-2xl border border-border/50 overflow-hidden shadow-2xl shadow-primary/5"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="bg-card p-1">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border/50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                <div className="w-3 h-3 rounded-full bg-green-400/80" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-xs text-muted-foreground">taskflow.app/dashboard</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3 p-6">
              {[
                { label: "Total Tasks", value: "248", color: "text-primary" },
                { label: "Completed", value: "186", color: "text-green-500" },
                { label: "In Progress", value: "42", color: "text-yellow-500" },
                { label: "Overdue", value: "3", color: "text-red-500" },
              ].map((stat) => (
                <div key={stat.label} className="bg-accent/50 rounded-xl p-4 text-center">
                  <p className={`text-2xl sm:text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="px-6 pb-6">
              <div className="space-y-2">
                {[
                  { title: "Design System Overhaul", status: "In Progress", priority: "High", color: "bg-yellow-500" },
                  { title: "API Documentation", status: "Completed", priority: "Medium", color: "bg-green-500" },
                  { title: "User Authentication Flow", status: "Pending", priority: "High", color: "bg-blue-500" },
                ].map((task) => (
                  <div key={task.title} className="flex items-center gap-3 p-3 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors">
                    <div className={`w-2 h-2 rounded-full ${task.color}`} />
                    <span className="text-sm font-medium flex-1">{task.title}</span>
                    <span className="text-xs text-muted-foreground">{task.status}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      task.priority === "High" ? "bg-red-500/10 text-red-500" : "bg-yellow-500/10 text-yellow-500"
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything you need to{" "}
              <span className="gradient-text">stay productive</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Powerful features designed for modern teams to manage their workflow efficiently.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                className="group relative p-6 rounded-2xl border border-border/50 bg-card hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-accent/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How <span className="gradient-text">TaskFlow</span> Works
            </h2>
            <p className="text-muted-foreground text-lg">Simple, intuitive, and powerful workflow management</p>
          </motion.div>

          <div className="space-y-8">
            {[
              { step: "01", title: "Create & Assign", desc: "Admins create tasks with priorities, deadlines, and assign them to team members." },
              { step: "02", title: "Track Progress", desc: "Members update task status, add comments, and track progress in real-time." },
              { step: "03", title: "Collaborate", desc: "Request reschedules, leave feedback, and stay notified of all updates." },
              { step: "04", title: "Analyze & Improve", desc: "Review analytics, identify bottlenecks, and continuously improve team productivity." },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                className="flex gap-6 items-start"
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl animated-gradient flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{item.step}</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to boost your team&apos;s productivity?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join thousands of teams already using TaskFlow to manage their work efficiently.
          </p>
          <Link href="/register">
            <Button size="lg" className="animated-gradient text-white border-0 px-10 text-base glow-pulse">
              Get Started for Free <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md animated-gradient flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold gradient-text">TaskFlow</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} TaskFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
