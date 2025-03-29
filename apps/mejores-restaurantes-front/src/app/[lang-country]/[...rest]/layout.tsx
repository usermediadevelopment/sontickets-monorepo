// get the [...rest] from the url and create the seo meta data server component

import { Metadata } from "next";

type Props = {
  params: Promise<{ "lang-country": string; rest: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // read route params
  const { "lang-country": langCountry, rest } = await params;

  console.log(langCountry, rest);

  return {
    title: langCountry + " - " + rest.join(" - "),
  };
}

export default async function RestLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ "lang-country": string; rest: string[] }>;
}) {
  const { "lang-country": langCountry, rest } = await params;

  console.log(langCountry, rest);

  return <>{children}</>;
}
