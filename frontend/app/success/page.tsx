import Link from "next/link";
import { CheckCircle2, ArrowRight, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type SuccessPageProps = {
  searchParams?: Promise<{
    session_id?: string;
  }>;
};

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const sessionId = resolvedSearchParams?.session_id;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-linear-to-br from-sky-50 via-white to-emerald-50 p-4 md:p-8">
      <Card className="w-full max-w-2xl border-0 shadow-xl">
        <CardContent className="space-y-6 p-8 md:p-10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide text-emerald-700 uppercase">
                Payment successful
              </p>
              <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                Your subscription checkout was completed
              </h1>
            </div>
          </div>

          <p className="text-sm leading-6 text-slate-600 md:text-base">
            Stripe has processed the payment. The backend webhook will activate
            your subscription automatically, then the dashboard will unlock
            create, update, and delete actions once the subscription record is
            written.
          </p>

          <div className="rounded-xl border bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">What happens next</p>
            <ul className="mt-2 space-y-2">
              <li>• Payment is confirmed by Stripe</li>
              <li>• Backend webhook creates the subscription record</li>
              <li>
                • Your account regains write access for the purchased duration
              </li>
            </ul>
          </div>

          {sessionId ? (
            <p className="text-xs text-slate-500">
              Session ID: <span className="font-mono">{sessionId}</span>
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="gap-2">
              <Link href="/dashboard/subscriptions">
                Go to subscriptions
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link href="/dashboard">
                <RefreshCw className="h-4 w-4" />
                Refresh dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
