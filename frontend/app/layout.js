import "./globals.css";

export const metadata = {
  title: "HackMates – Find Your Hackathon Dream Team",
  description: "Post your hackathon, tell us which skills you need, and let the right teammates come to you.",
  keywords: "hackathon, team, teammates, skills, developer, designer, builder",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}