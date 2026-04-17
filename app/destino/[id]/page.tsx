"use client";
import { useEffect, useState, use } from "react";
import { db, auth } from "../../../lib/firebase"; 
import { doc, getDoc, collection, addDoc } from "firebase/firestore";

export default function DetalleDestino({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [destino, setDestino] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  // --- 1. NUEVA LÓGICA DE GRUPOS (TARIFAS DIFERENCIADAS) ---
  const [adultos, setAdultos] = useState(2);
  const [mayores, setMayores] = useState(0); // Tercera edad / INAPAM
  const [ninos, setNinos] = useState(0);     // 3 a 11 años

  const totalPersonas = adultos + mayores + ninos;
  // Habitaciones calculadas en base al total de personas (1 cuarto x cada 2 personas)
  const numHabitaciones = Math.max(1, Math.ceil(totalPersonas / 2));
  
  // --- 2. LÓGICA DE TRANSPORTE ---
  const [transporte, setTransporte] = useState({ 
    tipo: "Punto: Toluca Centro", costo: 350, zona: "Centro", esDomicilio: false, detalle: "Catedral de Toluca"
  });
  const [direccion, setDireccion] = useState("");
  const [cotizacionMaps, setCotizacionMaps] = useState(0);
  const [calculando, setCalculando] = useState(false);

  // --- 3. LÓGICA DE HOSPEDAJE ---
  const [hospedaje, setHospedaje] = useState({ 
    tipo: "Posada Base (Incluida)", costoNoche: 0,
    foto: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=500",
    estrellas: "3⭐", descripcion: "Alojamiento estándar ya cubierto en tu paquete."
  });

  useEffect(() => {
    const obtenerDetalle = async () => {
      try {
        const docRef = doc(db, "destinos", id);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) setDestino(snapshot.data());
        setCargando(false);
      } catch (e) { console.error(e); }
    };
    obtenerDetalle();
  }, [id]);

  const simularGoogleMaps = () => {
    if (direccion.length < 5) return alert("Por favor ingresa una dirección válida.");
    setCalculando(true);
    setTimeout(() => {
      setCotizacionMaps((Math.floor(Math.random() * 80) + 20) * 18); 
      setCalculando(false);
    }, 1500);
  };

  // --- EL CEREBRO DE LOS PRECIOS ---
  const precioBase = destino?.precio || 0;
  
  // Descuentos aplicados directamente
  const subtotalAdultos = precioBase * adultos;
  const subtotalMayores = (precioBase * 0.8) * mayores; // 20% descuento INAPAM
  const subtotalNinos = (precioBase * 0.5) * ninos;     // 50% descuento

  const subtotalTour = subtotalAdultos + subtotalMayores + subtotalNinos;
  const costoTransporteFinal = transporte.esDomicilio ? cotizacionMaps : (transporte.costo * totalPersonas);
  const subtotalHospedaje = hospedaje.costoNoche * numHabitaciones;
  
  const granTotal = subtotalTour + costoTransporteFinal + subtotalHospedaje;

  // Datos simulados de la agencia
  const etiquetas = destino?.etiquetas || ["🐾 Pet Friendly", "👴 Accesible", "👨‍👩‍👧 Familiar"];
  const duracion = destino?.duracion || "3 Días / 2 Noches";
  const itinerario = destino?.itinerario || [
    "Día 1: Llegada, check-in y recorrido suave sin pendientes fuertes.",
    "Día 2: Excursión principal y tarde de spa o relajación.",
    "Día 3: Desayuno local y regreso cómodo."
  ];

  if (cargando) return <div className="flex justify-center py-20"><div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>;

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* BANNER PRINCIPAL */}
      <div className="h-[450px] w-full relative overflow-hidden bg-slate-900">
        <img src={destino?.imagen} className="w-full h-full object-cover opacity-60 scale-105 hover:scale-100 transition-transform duration-1000" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent flex items-end p-12">
          <div className="text-white w-full max-w-7xl mx-auto">
            <div className="flex flex-wrap gap-3 mb-4">
              <span className="bg-blue-600 text-white px-4 py-1 rounded-full font-bold text-sm shadow-lg">⏳ {duracion}</span>
              {etiquetas.map((tag: string) => (
                <span key={tag} className="bg-white/20 backdrop-blur-md text-white px-4 py-1 rounded-full font-medium text-sm border border-white/30 shadow-lg">
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-6xl md:text-7xl font-black italic drop-shadow-lg">{destino?.nombre}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10 mt-12 px-6">
        
        <div className="lg:col-span-2 space-y-10">
          
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">✨ Itinerario del Paquete</h3>
            <div className="space-y-4">
              {itinerario.map((actividad: string, index: number) => (
                <div key={index} className="flex items-start gap-4 p-4 hover:bg-slate-50 rounded-xl transition-colors">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black shrink-0">{index + 1}</div>
                  <p className="text-slate-600 font-medium pt-1">{actividad}</p>
                </div>
              ))}
            </div>
          </section>

          {/* NUEVO PANEL DE PASAJEROS (EDADES Y DESCUENTOS) */}
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">👥 Perfil de Viajeros</h3>
                <p className="text-sm text-slate-500 mt-1">Ingresa las edades para aplicar promociones.</p>
              </div>
              <span className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl font-bold text-sm">
                Total: {totalPersonas} Pasajeros
              </span>
            </div>

            <div className="space-y-6">
              {/* Adultos */}
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                <div>
                  <h4 className="font-bold text-slate-800 text-lg">Adultos</h4>
                  <p className="text-xs text-slate-500">12 a 59 años</p>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={() => adultos > 1 && setAdultos(adultos - 1)} className="w-10 h-10 rounded-full border-2 border-slate-200 flex items-center justify-center text-xl hover:bg-white text-slate-600 bg-white shadow-sm">-</button>
                  <span className="text-2xl font-black text-slate-800 w-6 text-center">{adultos}</span>
                  <button onClick={() => setAdultos(adultos + 1)} className="w-10 h-10 rounded-full border-2 border-slate-200 flex items-center justify-center text-xl hover:bg-white text-slate-600 bg-white shadow-sm">+</button>
                </div>
              </div>

              {/* Adultos Mayores */}
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-800 text-lg">Adultos Mayores</h4>
                    <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-md font-bold uppercase">-20% INAPAM</span>
                  </div>
                  <p className="text-xs text-blue-600/70 font-medium">60+ años</p>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={() => mayores > 0 && setMayores(mayores - 1)} className="w-10 h-10 rounded-full border-2 border-blue-200 flex items-center justify-center text-xl hover:bg-white text-blue-600 bg-white shadow-sm">-</button>
                  <span className="text-2xl font-black text-slate-800 w-6 text-center">{mayores}</span>
                  <button onClick={() => setMayores(mayores + 1)} className="w-10 h-10 rounded-full border-2 border-blue-200 flex items-center justify-center text-xl hover:bg-white text-blue-600 bg-white shadow-sm">+</button>
                </div>
              </div>

              {/* Niños */}
              <div className="flex justify-between items-center p-4 bg-orange-50 rounded-2xl border border-orange-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-800 text-lg">Niños</h4>
                    <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-md font-bold uppercase">-50% Desc.</span>
                  </div>
                  <p className="text-xs text-orange-600/70 font-medium">3 a 11 años</p>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={() => ninos > 0 && setNinos(ninos - 1)} className="w-10 h-10 rounded-full border-2 border-orange-200 flex items-center justify-center text-xl hover:bg-white text-orange-600 bg-white shadow-sm">-</button>
                  <span className="text-2xl font-black text-slate-800 w-6 text-center">{ninos}</span>
                  <button onClick={() => setNinos(ninos + 1)} className="w-10 h-10 rounded-full border-2 border-orange-200 flex items-center justify-center text-xl hover:bg-white text-orange-600 bg-white shadow-sm">+</button>
                </div>
              </div>
            </div>
          </section>

          {/* SECCIÓN TRANSPORTE */}
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-2xl font-bold mb-6 text-slate-800">🚐 Logística de Transporte</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { tipo: "Toluca Centro", costo: 350, zona: "Centro", detalle: "Salida 08:00 AM", esDomicilio: false },
                { tipo: "Metepec", costo: 450, zona: "Metepec", detalle: "Salida 08:30 AM", esDomicilio: false },
                { tipo: "A Domicilio", costo: 0, zona: "Maps", detalle: "Recogida exacta", esDomicilio: true }
              ].map((t) => (
                <button key={t.tipo} onClick={() => { setTransporte(t); setCotizacionMaps(0); setDireccion(""); }}
                  className={`p-5 rounded-2xl border-2 text-left transition-all ${transporte.tipo === t.tipo ? 'border-blue-600 bg-blue-50 shadow-sm' : 'border-slate-100 hover:border-blue-200'}`}>
                  <p className="font-bold text-slate-800">{t.tipo}</p>
                  <p className="text-xs text-slate-500 mb-2 h-4">{t.detalle}</p>
                  {!t.esDomicilio && <p className="font-black text-blue-600 text-lg">${t.costo} <span className="text-[10px] font-normal text-slate-400 uppercase">/ pers</span></p>}
                  {t.esDomicilio && <p className="text-xs text-blue-600 font-bold mt-2 flex items-center gap-1">Cotizar 🗺️</p>}
                </button>
              ))}
            </div>

            {/* COTIZADOR GOOGLE MAPS */}
            {transporte.esDomicilio && (
              <div className="mt-6 p-6 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl">
                <h4 className="font-bold text-slate-800 mb-2">🗺️ Cotizar Viaje Privado Domicilio</h4>
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <input type="text" placeholder="Ej. San Mateo Atenco..." value={direccion} onChange={(e) => setDireccion(e.target.value)}
                    className="flex-1 p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none" />
                  <button onClick={simularGoogleMaps} disabled={calculando}
                    className="bg-slate-900 text-white font-bold px-8 py-4 rounded-xl hover:bg-slate-800 transition disabled:opacity-50">
                    {calculando ? "Calculando..." : "Ver Tarifa"}
                  </button>
                </div>
                {cotizacionMaps > 0 && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl flex justify-between items-center text-green-800">
                    <p className="font-bold">✅ Vehículo Asignado</p>
                    <p className="text-2xl font-black">${cotizacionMaps}</p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* MEJORAS DE ALOJAMIENTO */}
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">🏨 Tu Hospedaje</h3>
            <div className="space-y-4">
              {[
                { 
                  tipo: "Posada Base (Incluida)", costoNoche: 0, estrellas: "3⭐",
                  foto: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=500",
                  descripcion: "Habitación cómoda céntrica. Incluida en tu paquete."
                },
                { 
                  tipo: "Upgrade: Santuario Luxury", costoNoche: 2500, estrellas: "5⭐",
                  foto: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=500",
                  descripcion: "Sube de nivel. Vista al lago, alberca y desayuno."
                }
              ].map((h) => (
                <div key={h.tipo} onClick={() => setHospedaje(h)}
                  className={`flex flex-col md:flex-row gap-6 p-4 rounded-3xl border-2 cursor-pointer transition-all ${hospedaje.tipo === h.tipo ? 'border-blue-600 bg-blue-50 shadow-md transform scale-[1.01]' : 'border-slate-100 hover:bg-slate-50'}`}>
                  <img src={h.foto} className="w-full md:w-56 h-32 object-cover rounded-2xl" alt={h.tipo} />
                  <div className="flex-1 py-2 pr-2">
                    <div className="flex justify-between items-start">
                      <h4 className="text-lg font-bold text-slate-800">{h.tipo} <span className="text-yellow-500 text-sm">{h.estrellas}</span></h4>
                      <div className="text-right">
                        <p className="font-black text-blue-600 text-xl">{h.costoNoche === 0 ? "GRATIS" : `+ $${h.costoNoche}`}</p>
                        {h.costoNoche > 0 && <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">Noche x Hab.</p>}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mt-2">{h.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* EL NUEVO TICKET DESGLOSADO */}
        <div className="relative">
          <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-slate-100 sticky top-10">
            <div className="text-center mb-6 border-b border-slate-100 pb-6">
              <h3 className="text-3xl font-black text-slate-800">Factura Proforma</h3>
              <p className="text-slate-400 text-[10px] uppercase tracking-[0.2em] mt-2 font-bold">Viajes Mágicos SA de CV</p>
            </div>
            
            <div className="space-y-4 mb-8 text-slate-600">
              
              {/* Desglose de Pasajeros */}
              {adultos > 0 && (
                <div className="flex justify-between items-center">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Tour Adultos ({adultos}x)</div>
                  <div className="font-bold text-slate-800">${subtotalAdultos}</div>
                </div>
              )}
              {mayores > 0 && (
                <div className="flex justify-between items-center text-blue-700 bg-blue-50/50 p-2 rounded-lg -mx-2">
                  <div className="text-xs font-bold uppercase tracking-wider">Tercera Edad ({mayores}x)</div>
                  <div className="font-bold">${subtotalMayores}</div>
                </div>
              )}
              {ninos > 0 && (
                <div className="flex justify-between items-center text-orange-700 bg-orange-50/50 p-2 rounded-lg -mx-2">
                  <div className="text-xs font-bold uppercase tracking-wider">Menores ({ninos}x)</div>
                  <div className="font-bold">${subtotalNinos}</div>
                </div>
              )}

              <div className="h-px bg-slate-100 my-2"></div>

              {/* Logística */}
              <div className="flex justify-between items-center">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Logística Viaje</div>
                <div className="font-bold text-slate-800">${costoTransporteFinal}</div>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-dashed border-slate-200">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Hotel ({numHabitaciones} hab)</div>
                <div className="font-bold text-slate-800">${subtotalHospedaje}</div>
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-400 font-black text-sm uppercase tracking-widest">Total a Pagar</span>
                <span className="text-4xl font-black text-blue-600 tracking-tighter">${granTotal}</span>
              </div>
            </div>

            <button disabled={transporte.esDomicilio && cotizacionMaps === 0}
              className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-blue-600 transition-all transform hover:-translate-y-1 active:scale-95 text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none">
              {transporte.esDomicilio && cotizacionMaps === 0 ? "Calcula tu ruta 👆" : "Proceder al Pago"}
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}