import Navbar from '@/components/Navbar';

function Dashboard() {
  return (
    <>
    <Navbar />
      <section className='h-[calc(100vh-7rem)] flex flex-col justify-center items-center gap-4'>
        <h1 className='text-5xl'>Dashboard</h1>
      </section>
    </>
  );
}

export default Dashboard;
