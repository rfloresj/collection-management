import Navbar from '@/components/Navbar';
import DashboardTable from '@/components/DashboardTable/DashboardTable';

function Dashboard({params, searchParams}) {
  console.log('SearchParams:::', params, searchParams);
  return (
    <>
      <Navbar />
      <DashboardTable />
    </>
  );
}

export default Dashboard;
