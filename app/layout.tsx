import type { Metadata } from 'next';
import { Inter, Open_Sans } from 'next/font/google';
import './globals.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { RootProviders } from './providers/RootProviders';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const openSans = Open_Sans({
  weight: ['300', '400', '500', '700'],
  style: ['normal'],
  subsets: ['latin'],
  variable: '--font-open-sans',
});

export const metadata: Metadata = {
  title: 'Collection App',
  description: 'A collection management app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className={`${inter.variable} ${openSans.variable}`}>
      <head>
        <link rel='icon' type='image/png' sizes='32x32' href='/favicon.png' />
      </head>
      <body>
        <RootProviders>
          <ToastContainer position="bottom-right" />
          {children}
        </RootProviders>
      </body>
    </html>
  );
}
