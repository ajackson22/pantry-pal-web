export const metadata = {
  title: 'Pantry Pal API',
  description: 'Backend API for Pantry Pal application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
