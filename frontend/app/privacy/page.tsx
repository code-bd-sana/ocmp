import Link from "next/link";

export default function PrivacyPage() {
  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="text-muted-foreground mt-4 text-sm leading-7">
        OCMP collects only the information required to provide and secure your
        account, process authenticated access, and support compliance workflows.
        Data is handled with appropriate technical and organizational
        safeguards.
      </p>
      <p className="text-muted-foreground mt-4 text-sm leading-7">
        If you need details about retention, deletion, or export requests,
        please contact the administrator of your OCMP deployment.
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
