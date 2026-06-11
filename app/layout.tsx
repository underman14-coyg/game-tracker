import './globals.css';

export const metadata = {
  title: 'Save Point',
  description: 'A personal game diary and backlog tracker',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
