"use client";
import { useEffect, useState, use } from "react";
import { db, auth } from "../../../lib/firebase"; 
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";

export default function DetalleDestino({ params }: { params: Promise<{ id: string }> }) {
const [usuario, setUsuario] = useState<User | null>(null);
const router = useRouter();

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    setUsuario(user);
  });
  return () => unsubscribe();
}, []);
  const { id } = use(params);
  const [destino, setDestino] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [procesandoPago, setProcesandoPago] = useState(false);

  // --- 1. NUEVA LÓGICA DE GRUPOS (TARIFAS DIFERENCIADAS) ---
  const [adultos, setAdultos] = useState(0);
  const [mayores, setMayores] = useState(0); // Tercera edad / INAPAM
  const [ninos, setNinos] = useState(0);     // 3 a 11 años

  // --- NUEVA LÓGICA DE CALENDARIO ---
  const [fechaSalida, setFechaSalida] = useState("");
  const [fechaRegreso, setFechaRegreso] = useState("");

  // Función inteligente que calcula el regreso sola y evita el bug de zona horaria
  const manejarCambioSalida = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevaSalida = e.target.value;
    setFechaSalida(nuevaSalida);

    if (nuevaSalida) {
      // Le agregamos 'T12:00:00' para forzar que sea a mediodía y no se recorra al día anterior en México
      const fechaObj = new Date(nuevaSalida + 'T12:00:00');
      
      // Sumamos 2 días (que equivalen a las 2 noches del paquete base)
      fechaObj.setDate(fechaObj.getDate() + 2); 
      
      // Convertimos de vuelta al formato YYYY-MM-DD que necesita el input
      const regresoFormateado = fechaObj.toISOString().split('T')[0];
      setFechaRegreso(regresoFormateado);
    } else {
      setFechaRegreso("");
    }
  };

  // Función auxiliar para mostrar la fecha bonita en el mensaje final
  const formatearFecha = (fechaString: string) => {
    if (!fechaString) return "";
    return new Date(fechaString + 'T12:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  };
  // -----------------------------------

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
  // --- 3. LÓGICA DE HOSPEDAJE ---
  const [hospedaje, setHospedaje] = useState<any>({ // <-- Agregamos <any> para que no sea estricto
    tipo: "Posada Base (Incluida)", 
    costoNoche: 0,
    foto: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=500",
    estrellas: "3⭐", 
    descripcion: "Alojamiento estándar ya cubierto en tu paquete.",
    ubicacion: "Centro Histórico" // <-- AGREGA ESTA LÍNEA
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

  const manejarPago = async () => {
    setProcesandoPago(true);

    // Definimos los detalles según el punto de encuentro
    const detallesLogistica = {
      "Punto: Toluca Centro": { hora: "07:45 AM", calle: "Portal Constitución #10, Col. Centro, Toluca (Frente a Catedral)" },
      "Metepec": { hora: "08:15 AM", calle: "Plaza Juárez, Metepec Centro (Kiosco principal)" },
      "A Domicilio": { hora: "08:30 AM", calle: direccion || "Dirección proporcionada por el cliente" }
    }[transporte.tipo] || { hora: "08:00 AM", calle: "Punto de encuentro por confirmar" };

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idDestino: id,
          nombreDestino: destino?.nombre || "Destino DevSquad",
          granTotal: granTotal,
          totalPersonas: totalPersonas,
          horaCita: detallesLogistica.hora,
          direccionCompleta: detallesLogistica.calle,
          // --- NUEVOS DATOS PARA EL VOUCHER ---
          fechaSalida: fechaSalida,
          fechaRegreso: fechaRegreso,
          hotelTipo: hospedaje.tipo,
          hotelUbicacion: hospedaje.ubicacion || "Ubicación del destino",
          transporteTipo: transporte.tipo,
          adultos: adultos,
          mayores: mayores,
          ninos: ninos
          // ------------------------------------
        }),
      });
      
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url; 
      } else {
        console.error("No se recibió URL de Stripe", data);
        setProcesandoPago(false);
      }
    } catch (error) {
      console.error("Error al procesar el pago", error);
      setProcesandoPago(false);
    }
  };
  // Datos simulados de la agencia
  const etiquetas = destino?.etiquetas || ["🐾 Pet Friendly", "👴 Accesible", "👨‍👩‍👧 Familiar"];
  const duracion = destino?.duracion || "3 Días / 2 Noches";
  const itinerario = destino?.itinerario || [
    "Día 1: Llegada, check-in y recorrido suave sin pendientes fuertes.",
    "Día 2: Excursión principal y tarde de spa o relajación.",
    "Día 3: Desayuno local y regreso cómodo."
  ];
return (
    <main className="min-h-screen bg-slate-50 pb-20 font-sans">
      
      {/* 1. BANNER PRINCIPAL */}
      <section className="relative w-full pt-40 pb-48 flex flex-col items-center justify-center overflow-hidden bg-slate-900">
        
        {/* Imagen fija y directa, sin preguntar a Firebase */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-60 transition-transform duration-1000 scale-105"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop')" }} 
        ></div>
        
        {/* Degradado que funde el banner con el fondo de la página */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-50 z-10"></div>

        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto w-full">
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <span className="bg-blue-600/90 backdrop-blur-md text-white px-5 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg">
              ⏳ {duracion}
            </span>
            {etiquetas.map((tag: string) => (
              <span key={tag} className="bg-white/10 backdrop-blur-md text-white px-5 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest border border-white/20 shadow-lg">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white drop-shadow-2xl tracking-tighter italic">
            {destino?.nombre}
          </h1>
        </div>
      </section>

      {/* CONTENEDOR PRINCIPAL: Subimos el contenido con -mt-20 para que flote sobre el banner */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10 -mt-20 relative z-30 px-6">
        
        {/* COLUMNA IZQUIERDA: TARJETAS SUAVIZADAS */}
        <div className="lg:col-span-2 space-y-8">
          
          <section className="bg-white/90 backdrop-blur-sm border border-slate-100 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">✨ Itinerario del Paquete</h3>
            <div className="space-y-4">
              {itinerario.map((actividad: string, index: number) => (
                <div key={index} className="flex items-start gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black shrink-0">{index + 1}</div>
                  <p className="text-slate-600 font-medium pt-1">{actividad}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white/90 backdrop-blur-sm border border-slate-100 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-2xl font-black text-slate-800">👥 Perfil de Viajeros</h3>
                <p className="text-sm text-slate-500 mt-1">Ingresa las edades para aplicar promociones.</p>
              </div>
              <span className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md">
                Total: {totalPersonas}
              </span>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <h4 className="font-bold text-slate-800 text-lg">Adultos</h4>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">12 a 59 años</p>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={() => adultos > 1 && setAdultos(adultos - 1)} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-xl hover:bg-white text-slate-600 bg-white shadow-sm active:scale-95 transition-transform">-</button>
                  <span className="text-2xl font-black text-slate-800 w-6 text-center">{adultos}</span>
                  <button onClick={() => setAdultos(adultos + 1)} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-xl hover:bg-white text-slate-600 bg-white shadow-sm active:scale-95 transition-transform">+</button>
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-800 text-lg">Adultos Mayores</h4>
                    <span className="bg-blue-600 text-white text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest shadow-sm">-20% INAPAM</span>
                  </div>
                  <p className="text-xs text-blue-600/70 font-black uppercase tracking-widest mt-1">60+ años</p>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={() => mayores > 0 && setMayores(mayores - 1)} className="w-10 h-10 rounded-full border border-blue-200 flex items-center justify-center text-xl hover:bg-white text-blue-600 bg-white shadow-sm active:scale-95 transition-transform">-</button>
                  <span className="text-2xl font-black text-slate-800 w-6 text-center">{mayores}</span>
                  <button onClick={() => setMayores(mayores + 1)} className="w-10 h-10 rounded-full border border-blue-200 flex items-center justify-center text-xl hover:bg-white text-blue-600 bg-white shadow-sm active:scale-95 transition-transform">+</button>
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-orange-50/50 rounded-2xl border border-orange-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-800 text-lg">Niños</h4>
                    <span className="bg-orange-500 text-white text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest shadow-sm">-50% Desc</span>
                  </div>
                  <p className="text-xs text-orange-600/70 font-black uppercase tracking-widest mt-1">3 a 11 años</p>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={() => ninos > 0 && setNinos(ninos - 1)} className="w-10 h-10 rounded-full border border-orange-200 flex items-center justify-center text-xl hover:bg-white text-orange-600 bg-white shadow-sm active:scale-95 transition-transform">-</button>
                  <span className="text-2xl font-black text-slate-800 w-6 text-center">{ninos}</span>
                  <button onClick={() => setNinos(ninos + 1)} className="w-10 h-10 rounded-full border border-orange-200 flex items-center justify-center text-xl hover:bg-white text-orange-600 bg-white shadow-sm active:scale-95 transition-transform">+</button>
                </div>
              </div>
            </div>
          </section>

          {/* --- NUEVA SECCIÓN DE CALENDARIO AUTOMÁTICO --- */}
          <section className="bg-white/90 backdrop-blur-sm border border-slate-100 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">📅 Fechas de tu Viaje</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Input de Fecha de Salida (El único que el usuario toca) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-blue-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Fecha de Salida</label>
                <input 
                  type="date" 
                  value={fechaSalida}
                  onChange={manejarCambioSalida}
                  min={new Date().toLocaleDateString('en-CA')} // Formato seguro para hoy
                  className="w-full bg-transparent text-slate-900 font-bold outline-none cursor-pointer"
                />
              </div>

              {/* Input de Fecha de Regreso (Automático y Bloqueado) */}
              <div className="p-4 bg-slate-100/50 rounded-2xl border border-slate-200 relative">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Fecha de Regreso (Auto)</label>
                <input 
                  type="date" 
                  value={fechaRegreso}
                  readOnly // ¡Esto evita que el usuario lo cambie!
                  className="w-full bg-transparent text-slate-500 font-bold outline-none cursor-not-allowed"
                />
                <div className="absolute top-4 right-4 text-slate-400">🔒</div>
              </div>
            </div>

            {/* Mensaje de confirmación con las fechas correctas */}
            {fechaSalida && fechaRegreso && (
              <p className="mt-6 text-xs font-black text-emerald-700 uppercase tracking-widest bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-center shadow-sm">
                ✅ VIAJE AGENDADO DEL {formatearFecha(fechaSalida).toUpperCase()} AL {formatearFecha(fechaRegreso).toUpperCase()}
              </p>
            )}
          </section>
          {/* ----------------------------------- */}

          <section className="bg-white/90 backdrop-blur-sm border border-slate-100 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <h3 className="text-2xl font-black mb-6 text-slate-800">🚐 Logística de Transporte</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { tipo: "Toluca Centro", costo: 350, zona: "Centro", detalle: "Salida 08:00 AM", esDomicilio: false },
                { tipo: "Metepec", costo: 450, zona: "Metepec", detalle: "Salida 08:30 AM", esDomicilio: false },
                { tipo: "A Domicilio", costo: 0, zona: "Maps", detalle: "Recogida exacta", esDomicilio: true }
              ].map((t) => (
                <button key={t.tipo} onClick={() => { setTransporte(t); setCotizacionMaps(0); setDireccion(""); }}
                  className={`p-5 rounded-2xl border-2 text-left transition-all active:scale-95 ${transporte.tipo === t.tipo ? 'border-blue-600 bg-blue-50/50 shadow-sm' : 'border-slate-100 hover:border-blue-200'}`}>
                  <p className="font-bold text-slate-800">{t.tipo}</p>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2 h-4 mt-1">{t.detalle}</p>
                  {!t.esDomicilio && <p className="font-black text-blue-600 text-xl">${t.costo} <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">/ pers</span></p>}
                  {t.esDomicilio && <p className="text-xs text-blue-600 font-black mt-2 flex items-center gap-1 uppercase tracking-widest">Cotizar 🗺️</p>}
                </button>
              ))}
            </div>

            {transporte.esDomicilio && (
              <div className="mt-6 p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl animate-fade-in-up">
                <h4 className="font-bold text-slate-800 mb-2">🗺️ Cotizar Viaje Privado Domicilio</h4>
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <input type="text" placeholder="Ej. San Mateo Atenco..." value={direccion} onChange={(e) => setDireccion(e.target.value)}
                    className="flex-1 p-4 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                  <button onClick={simularGoogleMaps} disabled={calculando}
                    className="bg-slate-900 text-white font-black uppercase tracking-widest text-xs px-8 py-4 rounded-xl hover:bg-blue-600 transition-all shadow-md active:scale-95 disabled:opacity-50">
                    {calculando ? "Calculando..." : "Ver Tarifa"}
                  </button>
                </div>
                {cotizacionMaps > 0 && (
                  <div className="mt-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex justify-between items-center text-emerald-800 animate-fade-in-up">
                    <p className="font-black text-xs uppercase tracking-widest">✅ Vehículo Asignado</p>
                    <p className="text-2xl font-black">${cotizacionMaps}</p>
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="bg-white/90 backdrop-blur-sm border border-slate-100 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <h3 className="text-2xl font-black text-slate-800 mb-6">🏨 Tu Hospedaje</h3>
            <div className="space-y-4">
              {[
                { 
                  tipo: "Posada Base (Incluida)", costoNoche: 0, estrellas: "3⭐",
                  foto: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=500",
                  descripcion: "Habitación cómoda céntrica. Incluida en tu paquete.",
                  ubicacion: "A 2 cuadras de la plaza principal" // <-- ¡Nuevo!
                },
                { 
                  tipo: "Upgrade: Santuario Luxury", costoNoche: 2500, estrellas: "5⭐",
                  foto: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=500",
                  descripcion: "Sube de nivel. Vista al lago, alberca y desayuno.",
                  ubicacion: "Zona hotelera, frente al lago" // <-- ¡Nuevo!
                }
              ].map((h) => (
                <div key={h.tipo} onClick={() => setHospedaje(h)}
                  className={`flex flex-col md:flex-row gap-6 p-4 rounded-3xl border-2 cursor-pointer transition-all active:scale-[0.98] ${hospedaje.tipo === h.tipo ? 'border-blue-600 bg-blue-50/30 shadow-md' : 'border-slate-100 hover:bg-slate-50'}`}>
                  <img src={h.foto} className="w-full md:w-56 h-32 object-cover rounded-2xl" alt={h.tipo} />
                  <div className="flex-1 py-2 pr-2">
                    <div className="flex justify-between items-start">
                      
                      {/* Aquí agrupamos el Título, las Estrellas y la NUEVA UBICACIÓN */}
                      <div>
                        <h4 className="text-lg font-bold text-slate-800">{h.tipo} <span className="text-yellow-500 text-sm">{h.estrellas}</span></h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">📍 {h.ubicacion}</p>
                      </div>

                      <div className="text-right">
                        <p className="font-black text-blue-600 text-xl">{h.costoNoche === 0 ? "GRATIS" : `+ $${h.costoNoche}`}</p>
                        {h.costoNoche > 0 && <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mt-1">Por Habitación</p>}
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 mt-2 font-medium">{h.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* 2. COLUMNA DERECHA: FACTURA EFECTO CRISTAL */}
        <div className="relative">
          <div className="sticky top-32 bg-white/70 backdrop-blur-2xl border border-white rounded-[2.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.15)] p-8 md:p-10 z-10 transition-all">
            <div className="text-center mb-6 border-b border-slate-200/50 pb-6">
              <h3 className="text-3xl font-black text-slate-800">Factura Proforma</h3>
              <p className="text-blue-600 text-[9px] uppercase tracking-[0.3em] mt-2 font-black">Viajes Mágicos by DevSquad</p>
            </div>
            
            <div className="space-y-4 mb-8 text-slate-600">
              
              {adultos > 0 && (
                <div className="flex justify-between items-center">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Tour Adultos ({adultos}x)</div>
                  <div className="font-bold text-slate-800">${subtotalAdultos}</div>
                </div>
              )}
              {mayores > 0 && (
                <div className="flex justify-between items-center text-blue-700 bg-blue-50/80 p-3 rounded-xl -mx-3">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em]">Tercera Edad ({mayores}x)</div>
                  <div className="font-black">${subtotalMayores}</div>
                </div>
              )}
              {ninos > 0 && (
                <div className="flex justify-between items-center text-orange-700 bg-orange-50/80 p-3 rounded-xl -mx-3">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em]">Menores ({ninos}x)</div>
                  <div className="font-black">${subtotalNinos}</div>
                </div>
              )}

              <div className="h-px bg-slate-200/50 my-4"></div>

              <div className="flex justify-between items-center">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Logística Viaje</div>
                <div className="font-bold text-slate-800">${costoTransporteFinal}</div>
              </div>
              <div className="flex justify-between items-center pb-6 border-b border-dashed border-slate-300">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Hotel ({numHabitaciones} hab)</div>
                <div className="font-bold text-slate-800">${subtotalHospedaje}</div>
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-400 font-black text-xs uppercase tracking-widest">Total a Pagar</span>
                <span className="text-4xl font-black text-blue-600 tracking-tighter">${granTotal}</span>
              </div>
            </div>

            {usuario ? (
            <button 
              onClick={manejarPago} // Aquí pones la función que ya tenías que llama a Stripe
              className="w-full bg-slate-900 text-white font-black uppercase tracking-widest text-sm py-4 rounded-xl shadow-xl hover:bg-blue-600 transition-all active:scale-95"
            >
              Proceder al Pago
            </button>
          ) : (
            <button 
              onClick={() => router.push('/login')}
              className="w-full bg-slate-200 text-slate-500 font-black uppercase tracking-widest text-sm py-4 rounded-xl border-2 border-dashed border-slate-300 hover:bg-slate-300 hover:text-slate-700 transition-all"
            >
              Inicia sesión para reservar
            </button>
          )}
          </div>
        </div>

      </div>
    </main>
  );
}