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
import { Check, Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function SignUpPage() {
  /**
   * State Variables
   *
   * formData: Stores the user's input for name, email, password, and confirm password.
   * showPassword: Toggles the visibility of the password input.
   * showConfirmPassword: Toggles the visibility of the confirm password input.
   * isLoading: Indicates if the form submission is in progress.
   * errors: Holds validation error messages for the form fields.
   *
   * Functions
   *
   * checkPasswordStrength: Evaluates the strength of the password and updates the strength state.
   * validateForm: Validates the form inputs, setting error messages as needed.
   * handleChange: Updates formData state and clears errors on input change.
   * handleSubmit: Handles form submission, including validation and simulating an API call.
   *
   * Return JSX
   *
   * Renders the sign-up form with fields for name, email, password, and confirm password, a password strength meter, a terms agreement checkbox, and a submit button.
   */
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [strength, setStrength] = useState(0);

  // Check password strength
  const checkPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    setStrength(score);
  };

  // Validate form inputs
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

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

  // Handle form input changes
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    if (field === "password") {
      checkPasswordStrength(value);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Signing up with:", formData);
      alert(
        "Account created successfully! Please check your email to verify your account."
      );
      // In real app: router.push("/verify-email");
    } catch (error) {
      console.error("Sign up failed:", error);
      alert("Sign up failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Get color for password strength meter
  const getStrengthColor = () => {
    if (strength === 0) return "bg-gray-200";
    if (strength === 1) return "bg-red-500";
    if (strength === 2) return "bg-yellow-500";
    if (strength === 3) return "bg-blue-500";
    return "bg-green-500";
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4'>
      <Card className='w-full max-w-md shadow-xl'>
        <CardHeader className='space-y-1'>
          <CardTitle className='text-2xl font-bold text-center'>
            Create Account
          </CardTitle>
          <CardDescription className='text-center text-foreground'>
            Fill in your details to get started
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='space-y-4'>
              {/* Name Field */}
              <div className='space-y-2'>
                <Label htmlFor='name' className='flex items-center gap-2'>
                  <User className='h-4 w-4' />
                  Full Name
                </Label>
                <Input
                  id='name'
                  type='text'
                  placeholder='John Doe'
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={`h-11 bg-input ${
                    errors.name
                      ? "border-destructive focus-visible:ring-destructive"
                      : "border-input-foreground"
                  }`}
                  disabled={isLoading}
                  autoComplete='name'
                />
                {errors.name && (
                  <p className='text-sm text-destructive'>{errors.name}</p>
                )}
              </div>

              {/* Email Field */}
              <div className='space-y-2'>
                <Label htmlFor='email' className='flex items-center gap-2'>
                  <Mail className='h-4 w-4' />
                  Email Address
                </Label>
                <Input
                  id='email'
                  type='email'
                  placeholder='name@example.com'
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={`h-11 bg-input ${
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

              {/* Password Field */}
              <div className='space-y-2'>
                <Label htmlFor='password' className='flex items-center gap-2'>
                  <Lock className='h-4 w-4' />
                  Password
                </Label>
                <div className='relative'>
                  <Input
                    id='password'
                    type={showPassword ? "text" : "password"}
                    placeholder='••••••••'
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className={`h-11 pr-10 bg-input ${
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
                    <div className='grid grid-cols-2 gap-2 text-xs text-foreground'>
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
                  Confirm Password
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
                    className={`h-11 pr-10 bg-input ${
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

            {/* Terms Agreement */}
            <div className='flex items-start space-x-2 w-full font-light'>
              <input
                type='checkbox'
                id='terms'
                className='mt-0.5 h-4 w-4 rounded border-gray-300'
                required
                disabled={isLoading}
              />
              <Label htmlFor='terms' className='text-sm font-normal!'>
                I agree to the{" "}
                <Link
                  href='/terms'
                  className='text-primary hover:underline font-medium'>
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href='/privacy'
                  className='text-primary hover:underline font-medium'>
                  Privacy Policy
                </Link>
              </Label>
            </div>

            <Button
              type='submit'
              className='w-full h-11 text-base bg-primary cursor-pointer'
              disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className='flex flex-col space-y-4'>
          <Separator />

          <div className='text-center text-sm'>
            Already have an account?{" "}
            <Link
              href='/signin'
              className='font-semibold text-primary hover:underline'
              tabIndex={isLoading ? -1 : 0}>
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
