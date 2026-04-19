"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase"; 

export default function PaginaPaquetes() {
  const [paquetes, setPaquetes] = useState<Record<string, any>[]>([]);
  const [paquetesFiltrados, setPaquetesFiltrados] = useState<Record<string, any>[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "destinos"));
        const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPaquetes(docs);
        setPaquetesFiltrados(docs);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setCargando(false);
      }
    };
    obtenerDatos();
  }, []);

  useEffect(() => {
    const filtrados = paquetes.filter((p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
    setPaquetesFiltrados(filtrados);
  }, [busqueda, paquetes]);

  return (
    <main className="min-h-screen bg-slate-50 pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER DIFERENTE PARA PAQUETES (Estilo Premium Mejorado) */}
        <div className="bg-slate-900 rounded-[3rem] p-12 text-center mb-16 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
          {/* Luces de fondo (Efecto Aurora) */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/20 via-transparent to-purple-600/20 blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10">
            <span className="inline-block bg-gradient-to-r from-blue-600 to-blue-400 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 shadow-[0_0_20px_rgba(37,99,235,0.4)]">
              ✨ VIP EXPERIENCES
            </span>
            
            {/* Título con degradado metálico */}
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-slate-300 tracking-tighter mb-10 drop-shadow-sm">
              Paquetes Todo Incluido
            </h1>
            
            {/* BUSCADOR PREMIUM SÚPER COOL */}
            <div className="max-w-2xl mx-auto relative group">
              {/* Resplandor animado detrás del buscador */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full blur opacity-25 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
              
              <div className="relative">
                <input 
                  type="text"
                  placeholder="¿A dónde quieres ir? (Ej. Malinalco)"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full bg-slate-900/80 backdrop-blur-2xl border border-white/10 px-8 py-5 rounded-full outline-none text-white placeholder:text-slate-400 font-bold focus:border-blue-400/50 focus:bg-slate-800/90 transition-all duration-300 pl-14 shadow-2xl text-base md:text-lg"
                />
                {/* Lupa en SVG interactiva */}
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-400 group-focus-within:text-cyan-300 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
              </div>
            </div>
            
          </div>
        </div>

        {cargando ? (
          <div className="text-center py-20 font-black text-blue-600 uppercase tracking-widest text-xs">Cargando paquetes...</div>
        ) : paquetesFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paquetesFiltrados.map((paquete) => (
              <div key={paquete.id} className="bg-white rounded-[2rem] p-4 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all group">
                <div>
                  <div className="relative w-full h-56 rounded-[1.5rem] overflow-hidden mb-6">
                    <img 
                      src={paquete.imagen ? paquete.imagen.trim().replace(/['"]/g, '') : '/placeholder.jpg'} 
                      alt={paquete.nombre} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-emerald-400 shadow-sm">
                      Todo Incluido ⭐
                    </div>
                  </div>
                  <div className="px-2">
                    <h3 className="text-xl font-black text-slate-900 mb-2">{paquete.nombre}</h3>
                    <div className="flex flex-wrap gap-2 mb-6">
                       <span className="bg-slate-50 border border-slate-100 text-slate-500 px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest">🚌 Transporte</span>
                       <span className="bg-slate-50 border border-slate-100 text-slate-500 px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest">🏨 Hotel</span>
                    </div>
                  </div>
                </div>
                <div className="px-2 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Desde</p>
                    <p className="text-xl font-black text-slate-900">${paquete.precio}</p>
                  </div>
                  <Link href={`/destino/${paquete.id}`} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-colors">
                    Reservar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
             <p className="text-slate-400 font-bold">No hay paquetes para "{busqueda}"</p>
          </div>
        )}
      </div>
    </main>
  );
}