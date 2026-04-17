import type { Metadata } from "next";
import "./globals.css";
// Importamos nuestro nuevo componente profesional
import Navbar from "../components/Navbar";

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

        {/* Footer (Más adelante lo haremos componente también) */}
        <footer className="p-10 bg-slate-900 text-white text-center mt-20">
          <p>© 2026 Viajes Mágicos - Todos los derechos reservados.</p>
        </footer>
      </body>
    </html>
  );
}