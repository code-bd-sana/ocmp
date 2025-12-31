export default function Footer() {
  return (
    <footer className='border-t bg-background'>
      <div className='container mx-auto py-8 px-4 text-center'>
        <p className='text-sm text-muted-foreground'>
          © {new Date().getFullYear()} Tim Tim. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
