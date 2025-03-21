import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  params: Promise<{
    lang: string;
  }>;
}

export default async function Layout({ children, params }: LayoutProps) {
  const { lang } = await params;
  console.log("Language parameter:", lang);

  return <>{children}</>;
}
