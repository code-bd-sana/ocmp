import Link from "next/link";
import { Button } from "../ui/button";

export default function Nav() {
  return (
    <header className='border-b bg-background'>
      <div className='container mx-auto flex items-center justify-between py-4 px-4'>
        <Link href='/' className='text-lg font-semibold'>
          Tim Tim
        </Link>

        <nav aria-label='Primary' className='flex items-center gap-4'>
          <Link
            href='/'
            className='text-sm text-muted-foreground hover:text-foreground'>
            Home
          </Link>
          <Link
            href='/about'
            className='text-sm text-muted-foreground hover:text-foreground'>
            About
          </Link>
          <Link
            href='/contact'
            className='text-sm text-muted-foreground hover:text-foreground'>
            Contact
          </Link>

          <div className='ml-4 flex gap-2'>
            <Link href='/signin'>
              <Button variant='ghost'>Sign in</Button>
            </Link>
            <Link href='/signup'>
              <Button variant='primary'>Sign up</Button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
