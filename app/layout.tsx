import type { Metadata } from "next";
import { Lora, Lato } from "next/font/google";
import "./globals.css";

const ebGaramond = Lora({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

export const metadata: Metadata = {
  title: "pagina — Her gün bir pasaj",
  description:
    "Telif hakkı serbest kitaplardan rastgele pasajlar. Oku, hisset, paylaş.",
  openGraph: {
    title: "pagina",
    description: "Telif hakkı serbest kitaplardan rastgele pasajlar.",
    siteName: "pagina",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${ebGaramond.variable} ${lato.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
