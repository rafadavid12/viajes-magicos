"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase"; 

export default function PaginaDestinos() {
  const [todosLosDestinos, setTodosLosDestinos] = useState<Record<string, any>[]>([]);
  const [destinosFiltrados, setDestinosFiltrados] = useState<Record<string, any>[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "destinos"));
        const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTodosLosDestinos(docs);
        setDestinosFiltrados(docs); // Al principio, los filtrados son todos
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setCargando(false);
      }
    };
    obtenerDatos();
  }, []);

  // Lógica de filtrado en tiempo real
  useEffect(() => {
    const filtrados = todosLosDestinos.filter((destino) =>
      destino.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
    setDestinosFiltrados(filtrados);
  }, [busqueda, todosLosDestinos]);

  return (
    <main className="min-h-screen bg-slate-50 pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Todos los Destinos</h1>
            <p className="text-slate-500 font-medium mt-2">Explora la magia completa del Estado de México.</p>
          </div>

          {/* BUSCADOR DINÁMICO */}
          <div className="relative w-full md:w-96">
            <input 
              type="text"
              placeholder="¿A dónde quieres ir? (Ej. Malinalco)"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-white border border-slate-200 px-6 py-4 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-slate-600 pl-12"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          </div>
        </div>

        {cargando ? (
          <div className="text-center py-20 font-black text-blue-600 uppercase tracking-widest text-xs">Cargando catálogo...</div>
        ) : destinosFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinosFiltrados.map((destino) => (
              <div key={destino.id} className="bg-white rounded-[2rem] p-4 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-all">
                <div>
                  <div className="relative w-full h-52 rounded-[1.5rem] overflow-hidden mb-6">
                    <img 
                      src={destino.imagen ? destino.imagen.trim().replace(/['"]/g, '') : '/placeholder.jpg'} 
                      alt={destino.nombre} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="px-2">
                    <h3 className="text-xl font-black text-slate-900 mb-2">{destino.nombre}</h3>
                    <p className="text-slate-500 text-xs line-clamp-2 mb-6">{destino.descripcion}</p>
                  </div>
                </div>
                <div className="px-2 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <p className="text-xl font-black text-slate-900">${destino.precio} <span className="text-[10px] text-slate-400">MXN</span></p>
                  <Link href={`/destino/${destino.id}`} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-colors">
                    Ver Detalles
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-400 font-bold">No encontramos destinos que coincidan con "{busqueda}"</p>
          </div>
        )}
      </div>
    </main>
  );
}