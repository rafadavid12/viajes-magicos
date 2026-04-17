"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
// Importamos tu base de datos y las herramientas para leerla
import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

// Definimos cómo se ve un Destino para que TypeScript no se queje
interface Destino {
  id: string;
  nombre: string;
  precio: number;
  imagen: string;
  descripcion: string;
}

export default function Home() {
  // Aquí guardaremos los destinos que lleguen de Firebase
  const [destinos, setDestinos] = useState<Destino[]>([]);
  const [cargando, setCargando] = useState(true);

  // Este efecto va a Firebase a buscar los datos en cuanto la página carga
  useEffect(() => {
    const obtenerDestinos = async () => {
      try {
        // 1. Apuntamos al "cajón" de destinos
        const cajonDestinos = collection(db, "destinos");
        // 2. Sacamos todos los "folders" (documentos)
        const consulta = await getDocs(cajonDestinos);
        // 3. Los empaquetamos en un arreglo que React pueda entender
        const datosExtraidos = consulta.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Destino, 'id'>)
        }));
        
        setDestinos(datosExtraidos);
        setCargando(false);
      } catch (error) {
        console.error("Error leyendo Firebase:", error);
      }
    };

    obtenerDestinos();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* SECCIÓN HERO (Tu banner principal) */}
      <section className="bg-blue-600 text-white py-20 text-center">
        <h1 className="text-5xl font-extrabold mb-4">Explora la Magia del Edomex</h1>
        <p className="text-xl">Encuentra hospedajes, rutas y experiencias únicas.</p>
      </section>

      {/* SECCIÓN DE DESTINOS DINÁMICOS */}
      <section className="max-w-7xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-slate-800 mb-8">Destinos Populares</h2>
        
        {cargando ? (
          // Mensaje de carga mientras Firebase responde
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : destinos.length === 0 ? (
           <p className="text-slate-500 text-center py-10">Aún no hay destinos en la base de datos.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Dibujamos las tarjetas usando los datos de FIREBASE */}
            {destinos.map((destino) => (
              <div key={destino.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all">
                <div className="h-48 bg-slate-200 relative">
                  {/* Si tienes las fotos, ponlas en la carpeta public y aquí se verán */}
                  <img src={destino.imagen} alt={destino.nombre} className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{destino.nombre}</h3>
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">{destino.descripcion}</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-blue-600 font-bold text-lg">${destino.precio} MXN</span>
                    <Link href={`/destino/${destino.id}`} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 transition">
                      Ver detalles
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}