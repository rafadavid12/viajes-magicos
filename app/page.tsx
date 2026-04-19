"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase"; // Asegúrate de que esta ruta apunte bien a tu archivo de Firebase

export default function Home() {
  const [viajesOriginales, setViajesOriginales] = useState<any[]>([]);
  const [resultados, setResultados] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  const [estiloFiltro, setEstiloFiltro] = useState("");
  const [destinoFiltro, setDestinoFiltro] = useState("");
  const [busquedaActiva, setBusquedaActiva] = useState(false);

  // --- CONEXIÓN REAL A FIREBASE ---
  useEffect(() => {
    const obtenerDestinos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "destinos"));
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setViajesOriginales(data);
        setResultados(data);
      } catch (error) {
        console.error("Error al obtener los destinos de Firebase:", error);
      } finally {
        setCargando(false);
      }
    };
    obtenerDestinos();
  }, []);

  // --- LÓGICA DE FILTRADO ADAPTADA A TUS NUEVOS DATOS ---
  const manejarBusqueda = () => {
    setBusquedaActiva(true);
    const filtrados = viajesOriginales.filter((viaje) => {
      // Revisa si el arreglo "estilos" contiene lo que el usuario busca
      const coincideEstilo = estiloFiltro === "" || (viaje.estilos && viaje.estilos.includes(estiloFiltro));
      
      // Revisa si el ID del destino coincide
      const coincideDestino = destinoFiltro === "" || viaje.id === destinoFiltro;
      
      return coincideEstilo && coincideDestino;
    });
    setResultados(filtrados);
  };

  const limpiarFiltros = () => {
    setEstiloFiltro("");
    setDestinoFiltro("");
    setResultados(viajesOriginales);
    setBusquedaActiva(false);
  };

  return (
    <main className="min-h-screen bg-slate-50">
      
      {/* SECCIÓN HERO Y BUSCADOR */}
      <section 
        className="relative pt-40 pb-32 px-6 flex flex-col items-center justify-center text-center bg-slate-900 overflow-hidden"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?q=80&w=1600&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"></div>

        <div className="relative z-10 w-full max-w-4xl mx-auto">
          <span className="inline-block border border-white/30 text-white bg-white/10 backdrop-blur-md px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6 shadow-xl">
            Agencia de Experiencias Mágicas
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-2 drop-shadow-2xl">
            Diseña tu
          </h1>
          <h1 className="text-5xl md:text-7xl font-black text-cyan-300 tracking-tighter mb-12 drop-shadow-2xl italic">
            escape perfecto
          </h1>

          <div className="bg-white/90 backdrop-blur-xl p-3 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-center gap-3 w-full max-w-3xl mx-auto">
            
            <div className="flex-1 w-full px-6 py-3 border-b md:border-b-0 md:border-r border-slate-200">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-left mb-1">1. ¿Qué buscas?</label>
              <select 
                value={estiloFiltro}
                onChange={(e) => setEstiloFiltro(e.target.value)}
                className="w-full bg-transparent text-slate-900 font-bold text-sm outline-none cursor-pointer"
              >
                <option value="">Cualquier estilo...</option>
                <option value="cultura">Cultura e Historia</option>
                <option value="relajacion">Relajación y Spa</option>
                <option value="familiar">Viaje Familiar</option>
                <option value="petfriendly">Pet Friendly 🐾</option>
              </select>
            </div>

            <div className="flex-1 w-full px-6 py-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-left mb-1">2. Destinos EDOMEX</label>
              <select 
                value={destinoFiltro}
                onChange={(e) => setDestinoFiltro(e.target.value)}
                className="w-full bg-transparent text-slate-900 font-bold text-sm outline-none cursor-pointer"
              >
                <option value="">Todos los destinos...</option>
                <option value="valle-de-bravo">Valle de Bravo</option>
                <option value="malinalco">Malinalco</option>
                <option value="tepotzotlan">Tepotzotlán</option>
                <option value="ixtapan-de-la-sal">Ixtapan de la Sal</option>
              </select>
            </div>

            <button 
              onClick={manejarBusqueda}
              className="w-full md:w-auto bg-slate-900 text-white px-10 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-slate-900/20 m-1"
            >
              Buscar
            </button>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-50 to-transparent"></div>
      </section>

      {/* SECCIÓN DE RESULTADOS DINÁMICOS */}
      <section className="py-20 px-6 max-w-7xl mx-auto min-h-[50vh]">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {busquedaActiva ? "Resultados de tu búsqueda" : "Pueblos Mágicos Destacados"}
            </h2>
            <p className="text-slate-500 font-medium mt-2">
              {cargando ? "Cargando desde la nube..." : `${resultados.length} ${resultados.length === 1 ? "experiencia encontrada" : "experiencias encontradas"}`}
            </p>
          </div>
          
          {busquedaActiva && (
            <button onClick={limpiarFiltros} className="text-xs font-black text-white bg-slate-900 px-6 py-3 rounded-xl uppercase tracking-widest hover:bg-red-500 transition-colors shadow-md">
              Limpiar filtros ✕
            </button>
          )}
        </div>

        {/* PANTALLA DE CARGA */}
        {cargando ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Conectando con Firebase...</p>
          </div>
        ) : resultados.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resultados.map((viaje) => (
              <div key={viaje.id} className="bg-white rounded-[2rem] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between">
                
                <div>
                  <div className="relative w-full h-56 rounded-[1.5rem] overflow-hidden mb-6">
                  <img 
                    src={viaje.imagen ? viaje.imagen.trim().replace(/['"]/g, '') : '/placeholder.jpg'} 
                    alt={viaje.nombre} 
                    className="w-full h-full object-cover" 
                  />               
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-900 shadow-sm">
                      {/* Mostramos el primer estilo que tenga registrado */}
                      {viaje.estilos && viaje.estilos[0] ? viaje.estilos[0].replace('_', ' ') : "Aventura"}
                    </div>
                  </div>

                  <div className="px-2">
                    <p className="text-blue-600 font-bold text-xs uppercase tracking-widest mb-1">{viaje.id.replace(/-/g, ' ')}</p>
                    <h3 className="text-xl font-black text-slate-900 leading-tight mb-2">{viaje.nombre}</h3>
                    <p className="text-slate-500 text-xs font-medium mb-6 line-clamp-2">
                      {viaje.descripcion}
                    </p>
                  </div>
                </div>
                
                <div className="px-2 flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Desde</p>
                    <p className="text-xl font-black text-slate-900">${viaje.precio} <span className="text-xs font-medium text-slate-500 uppercase">MXN</span></p>
                  </div>
                  
                  <Link href={`/destino/${viaje.id}`} className="bg-slate-50 border border-slate-200 text-slate-900 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all active:scale-95">
                    Ver Paquete
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
            <span className="text-5xl mb-4 block">🏜️</span>
            <h3 className="text-2xl font-black text-slate-900 mb-2">No encontramos viajes</h3>
            <p className="text-slate-500 font-medium">Prueba seleccionando otro estilo o destino.</p>
            <button onClick={limpiarFiltros} className="mt-6 bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-colors">
              Ver todos los viajes
            </button>
          </div>
        )}

      </section>
      
    </main>
  );
}