import Link from "next/link";
import Button from "../components/ui/button";
import Card from "../components/ui/card";

export default function DashboardPage() {
  return (
    <div className='container mx-auto py-12 px-4'>
      <div className='mb-6 flex items-center justify-between'>
        <h1 className='text-2xl font-semibold'>Dashboard</h1>
        <Link href='/profile'>
          <Button variant='ghost'>View profile</Button>
        </Link>
      </div>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        <Card title='Stats'>Some summary stats go here.</Card>

        <Card title='Recent activity'>A list of recent events.</Card>

        <Card title='Quick actions'>
          <div className='flex gap-2'>
            <Button variant='primary'>Action</Button>
            <Button variant='outline'>More</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
