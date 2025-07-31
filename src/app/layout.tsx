'use client';

import { Inter } from 'next/font/google';
import { WalletProvider } from '@/components/WalletProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import { LanguageProvider } from '@/components/LanguageProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>
          <ThemeProvider>
            <WalletProvider>
              {children}
            </WalletProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
} 