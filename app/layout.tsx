import type { Metadata } from "next";
import { Amiri, Fraunces, Inter } from "next/font/google";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["300", "400", "500", "600"],
});
const amiri = Amiri({
  subsets: ["arabic"],
  variable: "--font-amiri",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "The Masterman Assessment",
  description:
    "A 4-minute diagnostic that shows you your type and your stage as a Muslim man.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${fraunces.variable} ${amiri.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
