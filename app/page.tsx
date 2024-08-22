import Navbar from '@/components/Navbar';
import Collections from './main/Collections';

export const metadata = {
  title: 'Collections',
};

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Collections />
      </main>
    </>
  );
}
