'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Input } from '@nextui-org/react';
import { Divider } from '@nextui-org/react';
import { Button } from '@nextui-org/react';
import HomeLink from '@/helpers/HomeLink';
import { EyeFilledIcon } from '@/helpers/EyeFilledIcon';
import { EyeSlashFilledIcon } from '@/helpers/EyeSlashFilledIcon';
import { useForm } from 'react-hook-form';
import { BsExclamationOctagon } from 'react-icons/bs';
import { useRouter } from 'next/navigation';

export default function SignUp() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const router = useRouter();

  const onSubmit = handleSubmit(async (data) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const resJSON = await res.json();
    
    if(res.ok) {
      router.push('/auth/login')
    }
  });

  console.log(errors);

  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <>
      <div className='title flex flex-col items-center gap-7 mt-12'>
        <HomeLink />
        <h1 className='font-extrabold text-3xl text-yellow-500 text-center'>
          Sign up to start your
          <br />
          Collection
        </h1>
        <form
          className='flex flex-col flex-wrap md:flex-nowrap gap-7 w-96 px-3'
          onSubmit={onSubmit}
        >
          <Input
            variant='bordered'
            type='text'
            label='Name'
            {...register('username', {
              required: {
                value: true,
                message: 'Name is required.',
              },
            })}
          />
          {errors.username && (
            <span className='flex items-center text-red-500 mt-[-20px] text-small ml-1 gap-2'>
              <BsExclamationOctagon className='text-base' />
              {typeof errors.username.message === 'string' &&
                errors.username.message}
            </span>
          )}
          <Input
            variant='bordered'
            type='email'
            label='Email'
            {...register('email', {
              required: {
                value: true,
                message:
                  "Email is required. Make sure it's written like example@email.com",
              },
            })}
          />
          {errors.email && (
            <span className='flex items-center text-red-500 mt-[-20px] text-small ml-1 gap-2'>
              <BsExclamationOctagon className='text-[20px]' />
              {typeof errors.email.message === 'string' && errors.email.message}
            </span>
          )}
          <Input
            label='Password'
            variant='bordered'
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
            Sign up
          </Button>
        </form>
        <Divider className='my-1' />
        <footer className='flex justify-center gap-4 text-sm'>
          <span className='font-medium text-gray-600'>
            Already have an account?
          </span>
          <Link
            className='text-black font-bold text-sm underline'
            href='/auth/login'
          >
            Log in here
          </Link>
        </footer>
      </div>
    </>
  );
}
