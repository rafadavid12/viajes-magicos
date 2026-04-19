"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase"; 

export default function PaginaPaquetes() {
  const [paquetes, setPaquetes] = useState<Record<string, any>[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "destinos"));
        const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPaquetes(docs);
      } catch (error) {
        console.error("Error al obtener paquetes:", error);
      } finally {
        setCargando(false);
      }
    };
    obtenerDatos();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER DIFERENTE PARA PAQUETES (Estilo Premium) */}
        <div className="bg-slate-900 rounded-[3rem] p-12 text-center mb-16 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full bg-blue-600/10 blur-3xl pointer-events-none"></div>
          <div className="relative z-10">
            <span className="inline-block bg-blue-600 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 shadow-lg">
              Experiencias Completas
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6">
              Paquetes Todo Incluido
            </h1>
            <p className="text-slate-400 font-medium max-w-2xl mx-auto text-sm md:text-base">
              Olvídate de planear. Nuestros paquetes VIP incluyen transporte redondo desde tu puerta, hospedaje seleccionado, accesos a los atractivos y guías certificados.
            </p>
          </div>
        </div>

        {/* LISTA DE PAQUETES */}
        {cargando ? (
          <div className="text-center py-20 font-black text-blue-600 uppercase tracking-widest text-xs">
            Cargando paquetes premium...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paquetes.map((paquete) => (
              <div key={paquete.id} className="bg-white rounded-[2rem] p-4 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all group">
                <div>
                  <div className="relative w-full h-56 rounded-[1.5rem] overflow-hidden mb-6">
                    <img 
                      src={paquete.imagen ? paquete.imagen.trim().replace(/['"]/g, '') : '/placeholder.jpg'} 
                      alt={paquete.nombre} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-emerald-400 shadow-sm border border-slate-700">
                      Todo Incluido ⭐
                    </div>
                  </div>
                  <div className="px-2">
                    <h3 className="text-xl font-black text-slate-900 mb-2">{paquete.nombre}</h3>
                    <p className="text-slate-500 text-xs line-clamp-2 mb-4">{paquete.descripcion}</p>
                    
                    {/* MINI BADGES DE LO QUE INCLUYE (Le da un toque súper comercial) */}
                    <div className="flex flex-wrap gap-2 mb-6">
                       <span className="bg-slate-50 border border-slate-100 text-slate-500 px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest">🚌 Transporte</span>
                       <span className="bg-slate-50 border border-slate-100 text-slate-500 px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest">🏨 Hotel</span>
                       <span className="bg-slate-50 border border-slate-100 text-slate-500 px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest">🎟️ Tour</span>
                    </div>
                  </div>
                </div>
                <div className="px-2 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Paquete desde</p>
                    <p className="text-xl font-black text-slate-900">${paquete.precio}</p>
                  </div>
                  <Link href={`/destino/${paquete.id}`} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-colors shadow-md">
                    Reservar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}