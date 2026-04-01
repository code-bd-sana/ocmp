import Link from "next/link";

export default function TermsPage() {
  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold">Terms of Service</h1>
      <p className="text-muted-foreground mt-4 text-sm leading-7">
        By using OCMP, you agree to use the platform for authorized operational
        and compliance activities, keep your credentials secure, and comply with
        your organization policies.
      </p>
      <p className="text-muted-foreground mt-4 text-sm leading-7">
        Access may be suspended for misuse, unauthorized activity, or violation
        of legal and contractual requirements.
      </p>
      <div className="mt-8">
        <Link
          href="/signin"
          className="text-primary font-semibold hover:underline"
        >
          Back to Sign In
        </Link>
      </div>
    </section>
  );
}
