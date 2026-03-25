"use client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthAction } from "@/service/auth";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast, Toaster } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const validateEmail = () => {
    if (!email) {
      setError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    setError("");
    return true;
  };

  // Send reset password email
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await AuthAction.ForgotPassword({ email });

      if (response.status) {
        toast.success(response.message || "Reset link sent to your email!");
        setIsSubmitted(true);

        // Set cooldown for resend
        setResendCooldown(60);
        const timer = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        toast.error(response.message || "Failed to send reset email");
        setError(response.message || "Failed to send reset email");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend reset password email
  const handleResend = async () => {
    if (!email) {
      toast.error("Email address is required");
      return;
    }

    if (resendCooldown > 0) {
      toast.error(`Please wait ${resendCooldown} seconds before resending`);
      return;
    }

    setIsResending(true);

    try {
      const response = await AuthAction.ForgotPassword({ email });

      if (response.status) {
        toast.success(response.message || "Reset link resent successfully!");

        // Reset cooldown
        setResendCooldown(60);
        const timer = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        toast.error(response.message || "Failed to resend reset email");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <Toaster richColors position="top-center" />

      <Card className="w-full max-w-md shadow-xl">


        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
            <div className="rounded-full bg-blue-50 p-3 dark:bg-blue-900/20">
              <Mail className="h-6 w-6 text-blue-500 dark:text-blue-400" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl font-bold">
            Reset Your Password
          </CardTitle>
          <CardDescription className="text-foreground text-center">
            {isSubmitted
              ? "Check your email for instructions"
              : "Enter your email to receive a reset link"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isSubmitted ? (
            <div className="space-y-6">
              <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
                <AlertDescription className="text-green-800 dark:text-green-200 text-center">
                  If an account exists for <strong>{email}</strong>, you will
                  receive a password reset link shortly.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="text-center text-sm text-foreground">
                  <p className="mb-4 text-gray-500 dark:text-gray-400">
                    Didn&apos;t receive the email?
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleResend}
                    disabled={isResending || resendCooldown > 0}
                    className="w-full border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resending...
                      </>
                    ) : resendCooldown > 0 ? (
                      `Resend in ${resendCooldown}s`
                    ) : (
                      "Resend Reset Link"
                    )}
                  </Button>

                  <p className="mt-4 text-xs text-gray-400">
                    Make sure to check your spam folder
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    className={`h-11 ${
                      error
                        ? "border-destructive focus-visible:ring-destructive"
                        : "border-input-foreground"
                    }`}
                    disabled={isLoading}
                    autoComplete="email"
                  />
                  {error && <p className="text-sm text-destructive">{error}</p>}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base bg-primary hover:bg-primary/90 cursor-pointer transition-all duration-300 hover:scale-105"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Reset Link...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>

              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                <p>We&apos;ll send you a link to reset your password.</p>
                <p className="mt-2 text-xs">
                  Make sure to check your spam folder if you don&apos;t see it.
                </p>
              </div>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-2">
          <div className="text-center text-sm">
            <Link
              href="/signin"
              className="inline-flex items-center text-foreground hover:text-primary transition-colors"
              tabIndex={isLoading ? -1 : 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Link>
          </div>
        </CardFooter>
      </Card>


    </div>
  );
}
