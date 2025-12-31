import Link from "next/link";
import Button from "../components/ui/button";
import Card from "../components/ui/card";

export default function ProfilePage() {
  return (
    <div className='container mx-auto py-12 px-4'>
      <h1 className='mb-4 text-2xl font-semibold'>Your profile</h1>

      <Card className='mb-6 max-w-md' title={null}>
        <p className='mb-2 text-sm text-muted-foreground'>Name: Jane Doe</p>
        <p className='mb-2 text-sm text-muted-foreground'>
          Email: jane@example.com
        </p>
        <div className='mt-4 flex gap-2'>
          <Link href='/dashboard'>
            <Button variant='outline'>Back to dashboard</Button>
          </Link>
          <Button variant='destructive'>Sign out</Button>
        </div>
      </Card>
    </div>
  );
}
