import Link from 'next/link';
import Image from 'next/image';

export default function HomeLink() {
  return (
    <Link href='/'>
      <Image
        src='/Home_link.png'
        width={50}
        height={50}
        alt='collections_logo'
      />
    </Link>
  );
}
