import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'The Grand Aurelia | Luxury Hotel, Resort & Spa',
  description: 'Experience refined Mediterranean luxury, Michelin-starred gastronomy, and holistic botanical spa retreats at The Grand Aurelia.',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏨</text></svg>',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-stone-50 text-slate-800 antialiased font-sans selection:bg-amber-100 selection:text-amber-900">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

