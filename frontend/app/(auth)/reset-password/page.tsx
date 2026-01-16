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
import { Check, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordPage() {
  const router = useRouter();
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

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In real app, reset password with token from URL
      console.log("Resetting password for token");

      setIsSuccess(true);

      // Redirect to sign in after 3 seconds
      setTimeout(() => {
        router.push("/signin");
      }, 3000);
    } catch (error) {
      console.error("Password reset failed:", error);
      setErrors({ password: "Failed to reset password. Please try again." });
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

  if (isSuccess) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4'>
        <Card className='w-full max-w-md shadow-xl'>
          <CardHeader className='space-y-1'>
            <div className='mx-auto w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4'>
              <Check className='h-6 w-6 text-green-600 dark:text-green-400' />
            </div>
            <CardTitle className='text-2xl font-bold text-center'>
              Password Reset
            </CardTitle>
            <CardDescription className='text-center'>
              Your password has been successfully reset
            </CardDescription>
          </CardHeader>

          <CardContent className='space-y-6'>
            <Alert className='bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'>
              <AlertDescription className='text-green-800 dark:text-green-200 text-center'>
                You will be redirected to the sign in page in a few seconds...
              </AlertDescription>
            </Alert>

            <div className='text-center'>
              <Button asChild className='w-full'>
                <Link href='/signin'>Sign In Now</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4'>
      <Card className='w-full max-w-md shadow-xl'>
        <CardHeader className='space-y-1'>
          <CardTitle className='text-2xl font-bold text-center'>
            Create New Password
          </CardTitle>
          <CardDescription className='text-center'>
            Enter your new password below
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='space-y-4'>
              {/* Password Field */}
              <div className='space-y-2'>
                <Label htmlFor='password' className='flex items-center gap-2'>
                  <Lock className='h-4 w-4' />
                  New Password
                </Label>
                <div className='relative'>
                  <Input
                    id='password'
                    type={showPassword ? "text" : "password"}
                    placeholder='••••••••'
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className={`h-11 pr-10 ${
                      errors.password
                        ? "border-destructive focus-visible:ring-destructive"
                        : "border-input-foreground"
                    }`}
                    disabled={isLoading}
                    autoComplete='new-password'
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'
                    tabIndex={-1}
                    disabled={isLoading}>
                    {showPassword ? (
                      <EyeOff className='h-4 w-4' />
                    ) : (
                      <Eye className='h-4 w-4' />
                    )}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {formData.password && (
                  <div className='space-y-2'>
                    <div className='flex gap-1'>
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full ${
                            i <= strength ? getStrengthColor() : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <div className='grid grid-cols-2 gap-2 text-xs text-muted-foreground'>
                      <div className='flex items-center gap-1'>
                        <Check
                          className={`h-3 w-3 ${
                            formData.password.length >= 8
                              ? "text-green-500"
                              : "text-gray-300"
                          }`}
                        />
                        <span>8+ characters</span>
                      </div>
                      <div className='flex items-center gap-1'>
                        <Check
                          className={`h-3 w-3 ${
                            /[A-Z]/.test(formData.password)
                              ? "text-green-500"
                              : "text-gray-300"
                          }`}
                        />
                        <span>Uppercase</span>
                      </div>
                      <div className='flex items-center gap-1'>
                        <Check
                          className={`h-3 w-3 ${
                            /[0-9]/.test(formData.password)
                              ? "text-green-500"
                              : "text-gray-300"
                          }`}
                        />
                        <span>Number</span>
                      </div>
                      <div className='flex items-center gap-1'>
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
                  <p className='text-sm text-destructive'>{errors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className='space-y-2'>
                <Label
                  htmlFor='confirmPassword'
                  className='flex items-center gap-2'>
                  <Lock className='h-4 w-4' />
                  Confirm New Password
                </Label>
                <div className='relative'>
                  <Input
                    id='confirmPassword'
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder='••••••••'
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
                    autoComplete='new-password'
                  />
                  <button
                    type='button'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'
                    tabIndex={-1}
                    disabled={isLoading}>
                    {showConfirmPassword ? (
                      <EyeOff className='h-4 w-4' />
                    ) : (
                      <Eye className='h-4 w-4' />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className='text-sm text-destructive'>
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <Button
              type='submit'
              className='w-full h-11 text-base'
              disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Resetting Password...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className='flex flex-col space-y-4'>
          <div className='text-center text-sm'>
            <Link
              href='/signin'
              className='text-primary hover:underline'
              tabIndex={isLoading ? -1 : 0}>
              Back to Sign In
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
