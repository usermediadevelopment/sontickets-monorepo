import { Poppins } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/layout/SiteHeader";
import { FilterProvider } from "@/providers/FilterProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html className={poppins.className}>
      <body className="font-sans antialiased">
        <FilterProvider>
          <SiteHeader />
          {children}
        </FilterProvider>
      </body>
    </html>
  );
}
