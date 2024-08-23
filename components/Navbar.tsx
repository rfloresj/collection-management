import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/authOptions';
import SignOutLink from './SignOutLink';
import { Input } from '@nextui-org/react';
import { CiSearch } from "react-icons/ci";

export default async function Navbar() {
  const session = await getServerSession(authOptions);

  return (
    <nav className='flex justify-between border-b shadow-md w-full items-center'>
      <h1 className='title text-4xl pl-5 pb-2 mt-2 font-normal text-yellow-500'>
        Collections
      </h1>
      <Input
        classNames={{
          base: 'max-w-[21vw] h-10 py-1',
          mainWrapper: 'h-full',
          input: 'text-small',
          inputWrapper:
            'h-full font-normal text-default-500 bg-default-400/25 dark:bg-default-500/30',
        }}
        placeholder='Type to search...'
        size='sm'
        startContent={<CiSearch size={18} />}
        type='search'
      />
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
            <Link href='/' className='pr-2 border-r-2 border-slate-300 '>
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
