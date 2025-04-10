import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import React from "react";
import AuthProvider from "@/context/AuthProvider";

const inter = Inter({subsets: ['latin']});

export const metadata: Metadata = {
  title: 'Mstry Message',
  description: 'Generated by create next app',
};

function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
  return (
      <html lang={'en'}>
      <AuthProvider>
          <body className={inter.className}>
          {children}
          </body>
      </AuthProvider>
      </html>
  );
}

export default RootLayout;
