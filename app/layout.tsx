import type { Metadata } from "next";
import "./globals.css";
// Importamos nuestro nuevo componente profesional
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Chatbot from "./components/Chatbot";

export const metadata: Metadata = {
  title: "Viajes Mágicos | Marketplace Turístico",
  description: "Reserva experiencias únicas en los Pueblos Mágicos del Edomex.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased bg-slate-50 text-slate-900">
        {/* Insertamos el Navbar limpio y aislado */}
        <Navbar />
        
        {/* Aquí Next.js inyectará el contenido de cada página */}
        {children}

        {/* Mandamos llamar al Footer profesional */}
        <Footer />

        {/* El Chatbot flotante que aparecerá en todo el sitio */}
        <Chatbot />
      </body>
    </html>
  );
}