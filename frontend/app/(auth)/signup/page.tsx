"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    alert(`Creating account for ${name} <${email}>`);
  }

  return (
    <div className='container mx-auto py-12 px-4'>
      <div className='mx-auto w-full max-w-md rounded-lg border bg-card p-6'>
        <h2 className='mb-4 text-xl font-semibold'>Create your account</h2>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <Input
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className='flex items-center justify-between'>
            <Button type='submit'>Create account</Button>
            <Link href='/signin' className='text-sm text-primary'>
              Already have an account?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
