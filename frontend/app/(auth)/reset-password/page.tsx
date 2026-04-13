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
import { ArrowLeft, Check, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get and decode parameters from URL
  const rawEmail = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  // Decode email (handles %40 and other encoded characters)
  const email = decodeURIComponent(rawEmail);

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [strength, setStrength] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [urlError, setUrlError] = useState("");

  // Check if URL parameters are valid
  useEffect(() => {
    if (!email || !token) {
      setUrlError("Invalid reset link. Missing email or token.");
    }
  }, [email, token]);

  const checkPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    setStrength(score);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (strength < 3) {
      newErrors.password = "Password is too weak";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    if (field === "password") {
      checkPasswordStrength(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !token) {
      toast.error("Invalid reset link. Please request a new one.");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await AuthAction.ResetForgetPassword({
        email,
        token,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (response.status) {
        toast.success(response.message || "Password reset successfully!");
        setIsSuccess(true);

        // Redirect to sign in after 3 seconds
        setTimeout(() => {
          router.push("/signin");
        }, 3000);
      } else {
        toast.error(response.message || "Failed to reset password");
        setErrors({ password: response.message || "Failed to reset password" });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong";
      toast.error(errorMessage);
      setErrors({ password: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const getStrengthColor = () => {
    if (strength === 0) return "bg-gray-200";
    if (strength === 1) return "bg-red-500";
    if (strength === 2) return "bg-yellow-500";
    if (strength === 3) return "bg-blue-500";
    return "bg-green-500";
  };

  // Show error if URL parameters are invalid
  if (urlError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 p-4 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-md shadow-xl">
          <div className="relative h-1.5 w-full overflow-hidden rounded-t-lg">
            <div className="animate-gradient absolute inset-0 bg-linear-to-r from-red-500 via-red-400 to-red-500" />
          </div>
          <CardHeader className="space-y-1">
            <CardTitle className="text-destructive text-center text-2xl font-bold">
              Invalid Reset Link
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
              <AlertDescription className="text-center text-red-800 dark:text-red-200">
                {urlError}
              </AlertDescription>
            </Alert>
            <div className="text-center">
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/forgot-password">Request New Reset Link</Link>
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-2">
            <div className="text-center text-sm">
              <Link
                href="/signin"
                className="text-foreground hover:text-primary inline-flex items-center transition-colors"
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

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 p-4 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-md shadow-xl">
          <div className="relative h-1.5 w-full overflow-hidden rounded-t-lg">
            <div className="animate-gradient absolute inset-0 bg-linear-to-r from-green-500 via-green-400 to-green-500" />
          </div>
          <CardHeader className="space-y-1">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-center text-2xl font-bold">
              Password Reset
            </CardTitle>
            <CardDescription className="text-foreground text-center">
              Your password has been successfully reset
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <AlertDescription className="text-center text-green-800 dark:text-green-200">
                You will be redirected to the sign in page in a few seconds...
              </AlertDescription>
            </Alert>

            <div className="text-center">
              <Button
                asChild
                className="bg-primary hover:bg-primary/90 w-full transition-all duration-300 hover:scale-105"
              >
                <Link href="/signin">Sign In Now</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-2xl font-bold">
            Create New Password
          </CardTitle>
          <CardDescription className="text-foreground text-center">
            Enter your new password below
          </CardDescription>
          {email && (
            <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
              For <span className="font-medium">{email}</span>
            </p>
          )}
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className={`h-11 pr-10 ${
                      errors.password
                        ? "border-destructive focus-visible:ring-destructive"
                        : "border-input-foreground"
                    }`}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full ${
                            i <= strength ? getStrengthColor() : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-foreground grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <Check
                          className={`h-3 w-3 ${
                            formData.password.length >= 8
                              ? "text-green-500"
                              : "text-gray-300"
                          }`}
                        />
                        <span>8+ characters</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Check
                          className={`h-3 w-3 ${
                            /[A-Z]/.test(formData.password)
                              ? "text-green-500"
                              : "text-gray-300"
                          }`}
                        />
                        <span>Uppercase</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Check
                          className={`h-3 w-3 ${
                            /[0-9]/.test(formData.password)
                              ? "text-green-500"
                              : "text-gray-300"
                          }`}
                        />
                        <span>Number</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Check
                          className={`h-3 w-3 ${
                            /[^A-Za-z0-9]/.test(formData.password)
                              ? "text-green-500"
                              : "text-gray-300"
                          }`}
                        />
                        <span>Special</span>
                      </div>
                    </div>
                  </div>
                )}

                {errors.password && (
                  <p className="text-destructive text-sm">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="flex items-center gap-2"
                >
                  <Lock className="h-4 w-4" />
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleChange("confirmPassword", e.target.value)
                    }
                    className={`h-11 pr-10 ${
                      errors.confirmPassword
                        ? "border-destructive focus-visible:ring-destructive"
                        : "border-input-foreground"
                    }`}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-destructive text-sm">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 h-11 w-full cursor-pointer text-base transition-all duration-300 hover:scale-105"
              disabled={isLoading || !email || !token}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-2">
          <div className="text-center text-sm">
            <Link
              href="/signin"
              className="text-foreground hover:text-primary inline-flex items-center transition-colors"
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

import React from "react";

const ResetPasswordPage = () => {
  return (
    <Suspense fallback={<span>Loading....</span>}>
      <ResetPassword />
    </Suspense>
  );
};

export default ResetPasswordPage;
