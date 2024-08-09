import Collections from './main/Collections';

export const metadata = {
  title: 'Collections',
};

export default function Home() {
  return (
    <>
      <nav className='navbar flex justify-between border-b shadow-md w-full items-center'>
        <h1 className='title text-4xl pl-5 pb-2 mt-2 font-normal text-yellow-500'>
          Collections
        </h1>
        <div className='flex gap-2 text-slate-500'>
          <div className='pr-2 border-r-2 border-slate-300'>login</div>
          <div className='pr-5'>register</div>
        </div>
      </nav>
      <main>
        <Collections />
      </main>
    </>
  );
}
