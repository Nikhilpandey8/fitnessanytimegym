import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FitnessAnytime - Gym Management',
  description: 'Premium gym management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white">
        {children}
      </body>
    </html>
  );
}