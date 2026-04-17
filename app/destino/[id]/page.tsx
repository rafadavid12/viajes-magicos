"use client";
import { useEffect, useState } from "react";
import { db } from "../../../lib/firebase"; // Subimos 3 carpetas para encontrar tu archivo de conexión
import { doc, getDoc } from "firebase/firestore";
import { use } from "react"; // Herramienta de Next.js 15 para leer la URL

// Le explicamos a la página qué forma tiene nuestro folder de Firebase
interface Destino {
  nombre: string;
  precio: number;
  imagen: string;
  descripcion: string;
}

export default function DetalleDestino({ params }: { params: Promise<{ id: string }> }) {
  // 1. Extraemos el código raro de la URL
  const { id } = use(params); 
  
  // 2. Preparamos la memoria de la página
  const [destino, setDestino] = useState<Destino | null>(null);
  const [cargando, setCargando] = useState(true);

  // 3. Vamos a Firebase en cuanto la página abre
  useEffect(() => {
    const obtenerDetalle = async () => {
      try {
        // Le decimos a Firebase: "Busca en el cajón 'destinos' el folder con este 'id'"
        const referenciaFolder = doc(db, "destinos", id);
        const documento = await getDoc(referenciaFolder);
        
        if (documento.exists()) {
          // Si lo encuentra, lo guardamos en la memoria
          setDestino(documento.data() as Destino);
        }
        setCargando(false);
      } catch (error) {
        console.error("Error leyendo Firebase:", error);
      }
    };
    obtenerDetalle();
  }, [id]);

  // Si está pensando, mostramos el círculo de carga
  if (cargando) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Si Firebase dice que ese ID no existe
  if (!destino) {
    return <div className="text-center py-20 text-2xl font-bold text-slate-800">Destino no encontrado 😢</div>;
  }

  // Si sí lo encontró, dibujamos la página con los datos reales
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Banner gigante con la foto de Firebase */}
      <div className="w-full h-[400px] relative bg-slate-900">
        <img 
          src={destino.imagen} 
          alt={destino.nombre} 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white drop-shadow-xl text-center px-4">
            {destino.nombre}
          </h1>
        </div>
      </div>

      {/* Contenido (Descripción y precio) */}
      <div className="max-w-5xl mx-auto py-12 px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Acerca de esta experiencia</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              {destino.descripcion}
            </p>
          </section>
        </div>

        {/* Tarjeta de Reserva */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 h-fit sticky top-28">
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-4xl font-extrabold text-slate-900">${destino.precio}</span>
            <span className="text-slate-500 font-medium">/ MXN</span>
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-md transform hover:-translate-y-1">
            Reservar ahora
          </button>
        </div>
      </div>
    </main>
  );
}