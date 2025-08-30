import React from 'react';

import QueryProvider from '@/(shared)/providers/QueryProvider';
import './globals.css';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ветгид',
  description: 'Сервис для записи и оценки ветеринарных услуг',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
