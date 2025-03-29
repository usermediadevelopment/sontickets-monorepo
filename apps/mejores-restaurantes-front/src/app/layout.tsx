import { Poppins } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/layout/SiteHeader";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={poppins.className}>
      <body className="font-sans antialiased">
        <SiteHeader />

        {children}
      </body>
    </html>
  );
}
