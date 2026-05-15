"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    // In production, this would send a reset email
    setSent(true);
    toast.success("If an account exists with that email, a reset link has been sent.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-chart-4/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl animated-gradient flex items-center justify-center mx-auto mb-4">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Forgot Password</h1>
          <p className="text-muted-foreground">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
              />
            </div>

            <Button type="submit" className="w-full h-11 animated-gradient text-white border-0">
              Send Reset Link
            </Button>
          </form>
        ) : (
          <div className="text-center p-6 rounded-2xl border border-border bg-card">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Check Your Email</h3>
            <p className="text-sm text-muted-foreground mb-4">
              We&apos;ve sent a password reset link to <span className="font-medium text-foreground">{email}</span>
            </p>
            <Button variant="outline" onClick={() => setSent(false)}>
              Try another email
            </Button>
          </div>
        )}

        <div className="text-center mt-6">
          <Link href="/login" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
