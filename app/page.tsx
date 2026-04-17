"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

interface Destino {
  id: string;
  nombre: string;
  precio: number;
  imagen: string;
  descripcion: string;
  estilos?: string[]; // ¡Nueva propiedad preparada para Firebase!
}

export default function Home() {
  const [destinos, setDestinos] = useState<Destino[]>([]);
  const [cargando, setCargando] = useState(true);
  
  // Estados del Buscador
  const [estiloSeleccionado, setEstiloSeleccionado] = useState("");
  const [destinoSeleccionado, setDestinoSeleccionado] = useState("");

  const estilosDeViaje = [
    { id: "jovenes", nombre: "Aventura / Jóvenes", emoji: "🏕️", img: "https://images.unsplash.com/photo-1522199755839-a2bacb67c546?auto=format&fit=crop&w=600" },
    { id: "mayores", nombre: "Relax / Mayores", emoji: "🧘‍♂️", img: "https://images.unsplash.com/photo-1499591934245-40b55745b905?auto=format&fit=crop&w=600" },
    { id: "petfriendly", nombre: "Pet Friendly", emoji: "🐾", img: "https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&w=600" },
    { id: "parejas", nombre: "Romántico", emoji: "✨", img: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=600" }
  ];

  useEffect(() => {
    const obtenerDestinos = async () => {
      try {
        const cajonDestinos = collection(db, "destinos");
        const consulta = await getDocs(cajonDestinos);
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

  // MAGIA LÓGICA: Filtramos la lista de destinos basándonos en el estilo seleccionado.
  const destinosFiltrados = estiloSeleccionado 
    ? destinos.filter(d => !d.estilos || d.estilos.includes(estiloSeleccionado))
    : destinos;

  // Si el usuario cambia el estilo y el destino actual ya no es compatible, borramos la selección del destino.
  useEffect(() => {
    if (destinoSeleccionado) {
      const destinoSigueDisponible = destinosFiltrados.find(d => d.id === destinoSeleccionado);
      if (!destinoSigueDisponible) {
        setDestinoSeleccionado("");
      }
    }
  }, [estiloSeleccionado, destinosFiltrados, destinoSeleccionado]);

  const destinosDestacados = destinos.slice(0, 3);

  return (
    <main className="min-h-screen bg-slate-50 font-sans">
      
      {/* 1. HERO SECTION (Más inmersivo y elegante) */}
      <section className="relative w-full h-[90vh] flex items-center justify-center overflow-hidden bg-slate-900">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?auto=format&fit=crop&w=1920&q=80')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/40 to-slate-50 z-10"></div>

        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto w-full mt-10">
          <span className="inline-block px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold uppercase tracking-[0.3em] shadow-lg mb-6">
            Agencia de Experiencias Curadas
          </span>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white drop-shadow-xl mb-10 leading-[1.1] tracking-tight">
            Diseña tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-teal-300 italic pr-4 pb-2 inline-block">escape perfecto</span>
          </h1>

          {/* BARRA DE SELECCIÓN EN CASCADA (Efecto cristal) */}
          <div className="bg-white/80 backdrop-blur-xl p-3 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row max-w-4xl mx-auto border border-white/60">
            
            {/* PASO 1: Elegir Estilo */}
            <div className="flex-1 flex items-center px-6 py-4 border-b md:border-b-0 md:border-r border-slate-200 group">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-2xl mr-4 shadow-inner group-hover:bg-blue-100 transition-colors">✨</div>
              <div className="text-left w-full relative">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">1. ¿Cómo viajas?</p>
                <select 
                  value={estiloSeleccionado} onChange={(e) => setEstiloSeleccionado(e.target.value)}
                  className="w-full font-bold text-slate-800 bg-transparent outline-none cursor-pointer appearance-none text-lg relative z-10"
                >
                  <option value="">Cualquier vibra...</option>
                  {estilosDeViaje.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select>
                {/* Flecha personalizada para el select */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">▼</div>
              </div>
            </div>

            {/* PASO 2: Elegir Destino */}
            <div className="flex-1 flex items-center px-6 py-4 group">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-2xl mr-4 shadow-inner group-hover:bg-blue-100 transition-colors">📍</div>
              <div className="text-left w-full relative">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">2. Destinos Disponibles</p>
                <select 
                  value={destinoSeleccionado} onChange={(e) => setDestinoSeleccionado(e.target.value)}
                  disabled={destinosFiltrados.length === 0}
                  className="w-full font-bold text-slate-800 bg-transparent outline-none cursor-pointer appearance-none text-lg disabled:opacity-50 relative z-10"
                >
                  <option value="">
                    {destinosFiltrados.length === 0 ? "No hay destinos con ese estilo" : "Selecciona un lugar..."}
                  </option>
                  {destinosFiltrados.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">▼</div>
              </div>
            </div>

            {/* BOTÓN DINÁMICO */}
            <div className="flex items-center justify-center p-2">
              {destinoSeleccionado ? (
                <Link href={`/destino/${destinoSeleccionado}`}
                  className="w-full md:w-auto bg-slate-900 hover:bg-blue-600 text-white font-bold rounded-[2rem] px-10 py-5 transition-all shadow-lg active:scale-95 text-center text-sm tracking-widest uppercase">
                  Ver Viaje
                </Link>
              ) : (
                <button disabled
                  className="w-full md:w-auto bg-slate-100 text-slate-400 font-bold rounded-[2rem] px-10 py-5 cursor-not-allowed text-center text-sm tracking-widest uppercase">
                  Buscar
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. SECCIÓN VISUAL: ESTILOS DE VIAJE (Tarjetas más finas) */}
      <section className="max-w-6xl mx-auto py-24 px-6 -mt-16 relative z-30">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">O explora por tu vibra</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {estilosDeViaje.map((estilo) => (
            <div 
              key={estilo.id} 
              onClick={() => {
                setEstiloSeleccionado(estilo.id);
                window.scrollTo({ top: 0, behavior: 'smooth' }); 
              }}
              className="group relative h-56 rounded-[2rem] overflow-hidden cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] transition-all duration-300 transform hover:-translate-y-1"
            >
              <img src={estilo.img} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={estilo.nombre} />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 flex flex-col items-start">
                <span className="text-3xl mb-3 bg-white/20 backdrop-blur-sm p-3 rounded-full">{estilo.emoji}</span>
                <h3 className="text-white font-bold text-xl leading-tight">{estilo.nombre}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. SOLO "TOP 3" DESTACADOS (Tarjetas de catálogo ultra limpias) */}
      <section className="max-w-6xl mx-auto pb-32 px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-4">Joyas Destacadas</h2>
            <div className="w-16 h-1 bg-blue-600 mx-auto md:mx-0 rounded-full"></div>
          </div>
          <button className="bg-white border-2 border-slate-200 hover:border-slate-900 text-slate-800 font-bold px-8 py-3 rounded-full transition-colors text-sm uppercase tracking-widest">
            Ver Catálogo
          </button>
        </div>
        
        {cargando ? (
           <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {destinosDestacados.map((destino) => (
              <Link href={`/destino/${destino.id}`} key={destino.id} className="group">
                <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.1)] border border-slate-100 overflow-hidden transition-all duration-300 h-full flex flex-col">
                  
                  <div className="h-64 relative overflow-hidden bg-slate-200">
                    <img src={destino.imagen} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={destino.nombre} />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black text-slate-800 shadow-sm uppercase tracking-widest">
                      Top
                    </div>
                  </div>

                  <div className="p-8 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors line-clamp-1">{destino.nombre}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-6">{destino.descripcion}</p>
                    </div>
                    
                    <div className="pt-6 border-t border-slate-100 flex justify-between items-end">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Desde</p>
                        <p className="text-2xl font-black text-slate-900">${destino.precio}</p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                      </div>
                    </div>
                  </div>

                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

    </main>
  );
}