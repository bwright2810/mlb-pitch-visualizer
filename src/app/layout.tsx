import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MLB Pitch Visualizer 3D - Interactive Baseball Pitch Analysis",
  description: "Explore and visualize MLB pitch types in stunning 3D. See pitcher-view trajectories, grip visualizations, and physics-based animations for fastballs, curveballs, sliders, and more.",
  keywords: ["MLB", "baseball", "pitch visualization", "3D", "pitch types", "fastball", "curveball", "slider", "pitch grips", "baseball analytics"],
  authors: [{ name: "Brandon Wright" }],
  openGraph: {
    title: "MLB Pitch Visualizer 3D",
    description: "Interactive 3D visualization of baseball pitch types with pitcher-view animations",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#030712",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="dark"
    >
      <body className={`${inter.variable} antialiased bg-gray-950 text-white`}>
        {children}
      </body>
    </html>
  );
}
