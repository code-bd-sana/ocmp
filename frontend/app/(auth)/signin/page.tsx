"use client";
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
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function SignInPage() {
  /**
   * State Variables
   *
   * email: Stores the user's email input.
   * password: Stores the user's password input.
   * showPassword: Toggles the visibility of the password input.
   * isLoading: Indicates if the form submission is in progress.
   * errors: Holds validation error messages for email and password.
   *
   * Functions
   *
   * validateForm: Validates the email and password inputs, setting error messages as needed.
   * handleSubmit: Handles form submission, including validation and simulating an API call.
   *
   * Return JSX
   *
   * Renders the sign-in form with email and password fields, a submit button, and links for forgotten passwords and account creation.
   */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  // Validate form inputs
  function validateForm() {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Signing in with:", { email });
      // Replace with actual API call
      // const response = await signIn({ email, password });

      alert(`Successfully signed in as ${email}`);
      // In a real app: router.push("/dashboard");
    } catch (error) {
      console.error("Sign in failed:", error);
      alert("Sign in failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4'>
      <Card className='w-full max-w-md shadow-xl'>
        <CardHeader className='space-y-1'>
          <CardTitle className='text-2xl font-bold text-center'>
            Welcome Back To Tim Tim!
          </CardTitle>
          <CardDescription className='text-center'>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='email' className='flex items-center gap-2'>
                  <Mail className='h-4 w-4' />
                  Email Address
                </Label>
                <Input
                  id='email'
                  type='email'
                  placeholder='name@example.com'
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email)
                      setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  required
                  className={`h-11 ${
                    errors.email
                      ? "border-destructive focus-visible:ring-destructive"
                      : "border-input-foreground"
                  }`}
                  disabled={isLoading}
                  autoComplete='email'
                />
                {errors.email && (
                  <p className='text-sm text-destructive'>{errors.email}</p>
                )}
              </div>

              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <Label htmlFor='password' className='flex items-center gap-2'>
                    <Lock className='h-4 w-4' />
                    Password
                  </Label>
                  <Link
                    href='/forgot-password'
                    className='text-sm text-primary! hover:underline'
                    tabIndex={-1}>
                    Forgot password?
                  </Link>
                </div>
                <div className='relative'>
                  <Input
                    id='password'
                    type={showPassword ? "text" : "password"}
                    placeholder='••••••••'
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password)
                        setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    required
                    className={`h-11 pr-10 ${
                      errors.password
                        ? "border-destructive focus-visible:ring-destructive"
                        : "border-input-foreground"
                    }`}
                    disabled={isLoading}
                    autoComplete='current-password'
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
                {errors.password && (
                  <p className='text-sm text-destructive'>{errors.password}</p>
                )}
              </div>
            </div>

            <Button
              type='submit'
              className='w-full h-11 text-base bg-primary cursor-pointer'
              disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className='flex flex-col space-y-4'>
          <div className='text-center text-sm text-foreground'>
            By continuing, you agree to our{" "}
            <Link
              href='/terms'
              className='underline hover:text-primary font-semibold'>
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href='/privacy'
              className='underline hover:text-primary font-semibold'>
              Privacy Policy
            </Link>
          </div>

          <Separator />

          <div className='text-center text-sm'>
            Don&apos;t have an account?{" "}
            <Link
              href='/signup'
              className='font-semibold text-primary hover:underline'
              tabIndex={isLoading ? -1 : 0}>
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
