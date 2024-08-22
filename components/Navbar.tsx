import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/authOptions';
import SignOutLink from './SignOutLink';

export default async function Navbar() {
  const session = await getServerSession(authOptions);

  return (
    <nav className='flex justify-between border-b shadow-md w-full items-center'>
      <h1 className='title text-4xl pl-5 pb-2 mt-2 font-normal text-yellow-500'>
        Collections
      </h1>
      <div className='flex gap-2 text-slate-500 font-bold'>
        {!session ? (
          <>
            <Link
              href='/auth/login'
              className='pr-2 border-r-2 border-slate-300 '
            >
              Log in
            </Link>
            <Link href='/auth/signup' className='pr-5'>
              Sign up
            </Link>
          </>
        ) : (
          <>
          <Link
              href='/'
              className='pr-2 border-r-2 border-slate-300 '
            >
              Home
            </Link>
            <Link
              href='/dashboard'
              className='pr-2 border-r-2 border-slate-300 '
            >
              Dashboard
            </Link>
            <SignOutLink />
          </>
        )}
      </div>
    </nav>
  );
}
