import Link from "next/link";
import { XCircle, ArrowRight, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CancelPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-linear-to-br from-amber-50 via-white to-slate-100 p-4 md:p-8">
      <Card className="w-full max-w-2xl border-0 shadow-xl">
        <CardContent className="space-y-6 p-8 md:p-10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <XCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide text-amber-700 uppercase">
                Payment cancelled
              </p>
              <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                Your Stripe checkout was not completed
              </h1>
            </div>
          </div>

          <p className="text-sm leading-6 text-slate-600 md:text-base">
            No payment was taken. You can return to the subscriptions page,
            choose the plan again, and continue through Stripe checkout when you
            are ready.
          </p>

          <div className="rounded-xl border bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Need to try again?</p>
            <p className="mt-2">
              Open subscriptions, pick the package you want, and click Buy now
              to restart the secure payment flow.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="gap-2">
              <Link href="/dashboard/subscriptions">
                <ShoppingCart className="h-4 w-4" />
                Back to subscriptions
              </Link>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link href="/dashboard">
                Go to dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
