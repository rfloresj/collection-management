'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Input, Divider, Button } from '@nextui-org/react';
import { EyeFilledIcon } from '@/helpers/EyeFilledIcon';
import { EyeSlashFilledIcon } from '@/helpers/EyeSlashFilledIcon';
import { BsExclamationOctagon } from 'react-icons/bs';
import HomeLink from '@/helpers/HomeLink';
import { useForm } from 'react-hook-form';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = handleSubmit(async (data) => {
    const res = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (res) {
      if (res.error) {
        setError(res.error);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } else {
      console.error('Sign-in failed: No response from signIn function');
    }
  });
  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <>
      <div className='title flex flex-col items-center gap-7 mt-12'>
        <HomeLink />
        <h1 className='font-extrabold text-3xl text-yellow-500'>
          Log in to Collections
        </h1>
        <form
          onSubmit={onSubmit}
          className='flex flex-col flex-wrap md:flex-nowrap gap-7 w-96 px-3'
        >
          {error && (
            <span className='flex justify-center items-center bg-red-500 text-small gap-2 mt-[-1rem] mb-[-0.5rem] p-1'>
              <BsExclamationOctagon className='text-base text-slate-200' />
              <p className='text-slate-200 text-medium font-medium'>{error}</p>
            </span>
          )}
          <Input
            variant='bordered'
            type='email'
            label='Email'
            placeholder='Enter your email'
            {...register('email', {
              required: {
                value: true,
                message: 'Email is required.',
              },
            })}
          />
          {errors.email && (
            <span className='flex items-center text-red-500 mt-[-20px] text-small ml-1 gap-2'>
              <BsExclamationOctagon className='text-base' />
              {typeof errors.email.message === 'string' && errors.email.message}
            </span>
          )}
          <Input
            label='Password'
            variant='bordered'
            placeholder='Enter your password'
            endContent={
              <button
                className='focus:outline-none'
                type='button'
                onClick={toggleVisibility}
                aria-label='toggle password visibility'
              >
                {isVisible ? (
                  <EyeSlashFilledIcon className='text-2xl text-default-400 pointer-events-none' />
                ) : (
                  <EyeFilledIcon className='text-2xl text-default-400 pointer-events-none' />
                )}
              </button>
            }
            type={isVisible ? 'text' : 'password'}
            className='max-w-auto'
            {...register('password', {
              required: {
                value: true,
                message: 'Password is required',
              },
            })}
          />
          {errors.password && (
            <span className='flex items-center text-red-500 mt-[-20px] text-small ml-1 gap-2'>
              <BsExclamationOctagon className='text-base' />
              {typeof errors.password.message === 'string' &&
                errors.password.message}
            </span>
          )}
          <Button
            type='submit'
            className='rounded-3xl bg-yellow-500 p-2 text-base font-semibold'
          >
            Log in
          </Button>
        </form>
        <Divider className='my-1' />
        <footer className='flex justify-center text-sm gap-4'>
          <span className='font-medium text-gray-600'>
            Don&apos;t have an account?
          </span>
          <Link
            className='text-black font-bold text-sm underline'
            href='/auth/signup'
          >
            Sign up for Collections
          </Link>
        </footer>
      </div>
    </>
  );
}
