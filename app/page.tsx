"use client";
import { useState } from "react";
import Link from "next/link";

// 1. MINI BASE DE DATOS DE VIAJES
const VIAJES_MUESTRA = [
  {
    id: "valle-de-bravo",
    titulo: "Aventura en Valle de Bravo",
    destino: "Valle de Bravo",
    vibra: "Aventura",
    precio: 5700,
    dias: 3,
    noches: 2,
    // ¡CORREGIDO! Imagen de bosque/lago funcionando al 100%
    imagen: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "valle-relax",
    titulo: "Retiro Spa en Valle",
    destino: "Valle de Bravo",
    vibra: "Relax",
    precio: 8500,
    dias: 4,
    noches: 3,
    imagen: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "tequila-romantico",
    titulo: "Escapada a Tequila",
    destino: "Tequila",
    vibra: "Fiesta", 
    precio: 6200,
    dias: 2,
    noches: 1,
    // ¡URL NUEVA Y VERIFICADA! (Unos buenos drinks de fiesta)
    imagen: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "malinalco-mascotas",
    titulo: "Cabañas Malinalco",
    destino: "Malinalco",
    vibra: "Pet Friendly",
    precio: 4100,
    dias: 3,
    noches: 2,
    imagen: "https://images.unsplash.com/photo-1534361960057-19889db9621e?q=80&w=800&auto=format&fit=crop"
  }
];

export default function Home() {
  const [vibraFiltro, setVibraFiltro] = useState("");
  const [destinoFiltro, setDestinoFiltro] = useState("");
  const [resultados, setResultados] = useState(VIAJES_MUESTRA);
  const [busquedaActiva, setBusquedaActiva] = useState(false);

  const manejarBusqueda = () => {
    setBusquedaActiva(true);
    const filtrados = VIAJES_MUESTRA.filter((viaje) => {
      const coincideVibra = vibraFiltro === "" || viaje.vibra === vibraFiltro;
      const coincideDestino = destinoFiltro === "" || viaje.destino === destinoFiltro;
      return coincideVibra && coincideDestino;
    });
    setResultados(filtrados);
  };

  const limpiarFiltros = () => {
    setVibraFiltro("");
    setDestinoFiltro("");
    setResultados(VIAJES_MUESTRA);
    setBusquedaActiva(false);
  };

  return (
    <main className="min-h-screen bg-slate-50">
      
      {/* SECCIÓN HERO Y BUSCADOR */}
      <section 
        className="relative pt-40 pb-32 px-6 flex flex-col items-center justify-center text-center bg-slate-900 overflow-hidden"
        style={{
          // ¡CORREGIDO! Imagen de globos aerostáticos espectacular y 100% funcional
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
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-left mb-1">1. ¿Cómo viajas?</label>
              <select 
                value={vibraFiltro}
                onChange={(e) => setVibraFiltro(e.target.value)}
                className="w-full bg-transparent text-slate-900 font-bold text-sm outline-none cursor-pointer"
              >
                <option value="">Cualquier vibra...</option>
                <option value="Aventura">Aventura</option>
                <option value="Relax">Relax / Spa</option>
                <option value="Fiesta">Fiesta</option>
                <option value="Pet Friendly">Pet Friendly</option>
              </select>
            </div>

            <div className="flex-1 w-full px-6 py-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-left mb-1">2. Destinos</label>
              <select 
                value={destinoFiltro}
                onChange={(e) => setDestinoFiltro(e.target.value)}
                className="w-full bg-transparent text-slate-900 font-bold text-sm outline-none cursor-pointer"
              >
                <option value="">Cualquier lugar...</option>
                <option value="Valle de Bravo">Valle de Bravo</option>
                <option value="Tequila">Tequila</option>
                <option value="Malinalco">Malinalco</option>
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
      <section className="py-20 px-6 max-w-7xl mx-auto">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {busquedaActiva ? "Resultados de tu búsqueda" : "Viajes Destacados"}
            </h2>
            <p className="text-slate-500 font-medium mt-2">
              {resultados.length} {resultados.length === 1 ? "experiencia encontrada" : "experiencias encontradas"}
            </p>
          </div>
          
          {busquedaActiva && (
            <button onClick={limpiarFiltros} className="text-xs font-black text-white bg-slate-900 px-6 py-3 rounded-xl uppercase tracking-widest hover:bg-red-500 transition-colors shadow-md">
              Limpiar filtros ✕
            </button>
          )}
        </div>

        {resultados.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resultados.map((viaje) => (
              <div key={viaje.id} className="bg-white rounded-[2rem] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between">
                
                <div>
                  <div className="relative w-full h-56 rounded-[1.5rem] overflow-hidden mb-6">
                    <img src={viaje.imagen} alt={viaje.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-900 shadow-sm">
                      {viaje.vibra}
                    </div>
                  </div>

                  <div className="px-2">
                    <p className="text-blue-600 font-bold text-xs uppercase tracking-widest mb-1">{viaje.destino}</p>
                    <h3 className="text-xl font-black text-slate-900 leading-tight mb-2">{viaje.titulo}</h3>
                    <p className="text-slate-500 text-sm font-medium mb-6">
                      {viaje.dias} días / {viaje.noches} noches
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
            <p className="text-slate-500 font-medium">Prueba seleccionando otra vibra o destino.</p>
            <button onClick={limpiarFiltros} className="mt-6 bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-colors">
              Ver todos los viajes
            </button>
          </div>
        )}

      </section>

    </main>
  );
}