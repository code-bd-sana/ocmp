"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { ContactFormAction } from "@/service/contact-form";

const contactFormSchema = z.object({
  fullName: z.string().min(2, "Name required"),
  email: z.string().email("Valid email required"),
  subject: z.string().min(5, "Subject required"),
  message: z.string().min(10, "Message required"),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      await ContactFormAction.submitContactForm(data);
      setSubmitSuccess(true);
      reset();
      toast.success("Message sent successfully!");
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100">
      <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/75 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-3 rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#044192]/20 hover:text-[#044192]"
          >
            <Image
              src="/OCMP Blue.svg"
              alt="OCMP logo"
              width={30}
              height={30}
              className="mt-2 rounded-full"
              style={{ width: "auto", height: "auto" }}
              priority
            />
            <p className="text-base">Dashboard</p>
          </Link>
          <p className="hidden text-xs font-medium tracking-[0.2em] text-slate-400 uppercase sm:inline">
            Contact
          </p>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-5xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="flex flex-col justify-center rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-[0_20px_60px_rgba(4,65,146,0.08)] backdrop-blur-sm sm:p-10">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#044192]/10 ring-1 ring-[#044192]/10">
                <Send className="h-5 w-5 text-[#044192]" />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-[0.22em] text-[#044192] uppercase">
                  OCMP
                </p>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                  Contact Us
                </h1>
              </div>
            </div>

            <p className="mb-8 max-w-md text-sm leading-6 text-slate-600 sm:text-base">
              Send us a message and we&apos;ll reply as soon as possible.
            </p>

            {submitSuccess && (
              <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                Message sent successfully.
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <input
                  {...register("fullName")}
                  type="text"
                  placeholder="Full name"
                  className={`w-full rounded-2xl border px-4 py-3 text-sm transition outline-none focus:border-[#044192] focus:ring-4 focus:ring-[#044192]/10 ${
                    errors.fullName
                      ? "border-red-300 bg-red-50"
                      : "border-slate-200 bg-white"
                  }`}
                />
                {errors.fullName && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="Email address"
                  className={`w-full rounded-2xl border px-4 py-3 text-sm transition outline-none focus:border-[#044192] focus:ring-4 focus:ring-[#044192]/10 ${
                    errors.email
                      ? "border-red-300 bg-red-50"
                      : "border-slate-200 bg-white"
                  }`}
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <input
                  {...register("subject")}
                  type="text"
                  placeholder="Subject"
                  className={`w-full rounded-2xl border px-4 py-3 text-sm transition outline-none focus:border-[#044192] focus:ring-4 focus:ring-[#044192]/10 ${
                    errors.subject
                      ? "border-red-300 bg-red-50"
                      : "border-slate-200 bg-white"
                  }`}
                />
                {errors.subject && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.subject.message}
                  </p>
                )}
              </div>

              <div>
                <textarea
                  {...register("message")}
                  rows={5}
                  placeholder="Message"
                  className={`w-full resize-none rounded-2xl border px-4 py-3 text-sm transition outline-none focus:border-[#044192] focus:ring-4 focus:ring-[#044192]/10 ${
                    errors.message
                      ? "border-red-300 bg-red-50"
                      : "border-slate-200 bg-white"
                  }`}
                />
                {errors.message && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.message.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#044192] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#033a80] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? "Sending..." : "Send message"}
              </button>
            </form>
          </section>

          <aside className="hidden flex-col justify-between rounded-3xl border border-slate-200 bg-[#044192] p-10 text-white shadow-[0_20px_60px_rgba(4,65,146,0.18)] lg:flex">
            <div>
              <p className="text-xs font-semibold tracking-[0.25em] text-white/70 uppercase">
                OCMP Support
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                Simple. Clear. Fast.
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-6 text-white/80">
                Reach out with questions, feedback, or support requests. We keep
                it easy.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo.png"
                  alt="OCMP logo"
                  width={42}
                  height={42}
                  className="rounded-full bg-white"
                  style={{ width: "auto", height: "auto" }}
                />
                <div>
                  <p className="text-sm font-semibold">Dashboard access</p>
                  <p className="text-xs text-white/75">
                    Use the logo to return to the dashboard.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
