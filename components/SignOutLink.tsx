'use client';

import { signOut } from 'next-auth/react';

export default function SignOutLink() {
  return (
    <button
      onClick={() => {
        signOut();
      }}
      className='pr-5 cursor-pointer'
    >
      Sign Out
    </button>
  );
}
