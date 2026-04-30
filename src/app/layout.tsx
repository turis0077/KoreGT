import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";

// Fuente premium sugerida para tech e-commerce
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans", 
});

export const metadata: Metadata = {
  title: "KoreGT | Premium Tech Store",
  description: "La tienda de hardware más exclusiva de Guatemala",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.variable}>
        {/* Proveedor de Contexto para el Tema Oscuro/Claro */}
        <ThemeProvider>
          <div className="app-layout">
            <Navbar />
            <div className="main-content-wrapper">
              <Sidebar />
              {/* Contenedor dinámico de la página actual */}
              <main className="main-body">
                {children}
              </main>
            </div>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
