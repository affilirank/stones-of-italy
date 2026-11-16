import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Stones of Italy, Inc. | Ultra-Luxury Countertops Vero Beach & Treasure Coast',
  description: 'Custom Quartzite, Marble, Quartz & Porcelain Countertops — Precision Templated, In-House Fabricated & Installed in Days, Not Months. 4646 US-1, Vero Beach, FL 32967 | 772-299-7560',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Playfair+Display:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" />
      </head>
      <body className="bg-obsidian text-alabaster font-sans antialiased custom-scrollbar">{children}</body>
    </html>
  );
}
