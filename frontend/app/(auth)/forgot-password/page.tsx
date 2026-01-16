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
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In real app, send reset password email
      console.log("Sending reset email to:", email);

      setIsSubmitted(true);
    } catch (error) {
      console.error("Failed to send reset email:", error);
      setError("Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4'>
      <Card className='w-full max-w-md shadow-xl'>
        <CardHeader className='space-y-1'>
          <CardTitle className='text-2xl font-bold text-center'>
            Reset Your Password
          </CardTitle>
          <CardDescription className='text-center text-foreground'>
            {isSubmitted
              ? "Check your email for instructions"
              : "Enter your email to receive a reset link"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isSubmitted ? (
            <div className='space-y-6'>
              <Alert className='bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'>
                <AlertDescription className='text-green-800 dark:text-green-200'>
                  If an account exists for <strong>{email}</strong>, you will
                  receive a password reset link shortly.
                </AlertDescription>
              </Alert>

              <div className='space-y-4'>
                <div className='text-center text-sm text-foreground'>
                  <p className='mb-4'>Didn&apos;t receive the email?</p>
                  <Button
                    variant='outline'
                    onClick={() => {
                      setIsSubmitted(false);
                      handleSubmit(new Event("submit") as any);
                    }}
                    disabled={isLoading}
                    className='w-full'>
                    {isLoading ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Resending...
                      </>
                    ) : (
                      "Resend Email"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
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
                      if (error) setError("");
                    }}
                    className={`h-11 ${
                      error
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }`}
                    disabled={isLoading}
                    autoComplete='email'
                  />
                  {error && <p className='text-sm text-destructive'>{error}</p>}
                </div>
              </div>

              <Button
                type='submit'
                className='w-full h-11 text-base'
                disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Sending Reset Link...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>

              <div className='text-center text-sm text-foreground'>
                <p>We&apos;ll send you a link to reset your password.</p>
                <p className='mt-2'>
                  Make sure to check your spam folder if you don&apos;t see it.
                </p>
              </div>
            </form>
          )}
        </CardContent>

        <CardFooter className='flex flex-col space-y-4'>
          <div className='text-center text-sm'>
            <Link
              href='/signin'
              className='inline-flex items-center text-primary hover:underline'
              tabIndex={isLoading ? -1 : 0}>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Sign In
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
