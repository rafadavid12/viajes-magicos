"use client";
import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { db, auth } from "../../lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

function ComprobanteDinamico() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  
  const [datos, setDatos] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [guardadoEnFirebase, setGuardadoEnFirebase] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    // 1. Ir a buscar la información secreta a Stripe
    const buscarMetadata = async () => {
      try {
        const res = await fetch(`/api/verify-session?session_id=${sessionId}`);
        const data = await res.json();
        
        if (data.metadata) {
          setDatos(data.metadata);
        }
      } catch (error) {
        console.error("Error al buscar metadatos", error);
      } finally {
        setCargando(false);
      }
    };

    buscarMetadata();
  }, [sessionId]);

  useEffect(() => {
    // 2. Guardar en Firebase cuando ya tenemos los datos
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && datos && sessionId && !guardadoEnFirebase) {
        try {
          // Usamos setDoc y el sessionId como ID único para evitar duplicados
          await setDoc(doc(db, "reservas", sessionId), {
            usuarioEmail: user.email,
            usuarioNombre: user.displayName || "Viajero",
            destinoNombre: datos.destinoNombre,
            totalPagado: Number(datos.totalPagado),
            fechaViaje: datos.fechaSalida,
            stripeSessionId: sessionId,
            fechaReserva: serverTimestamp(),
            estado: "Confirmado"
          }, { merge: true }); // merge: true actualiza si ya existe
          
          setGuardadoEnFirebase(true);
        } catch (error) {
          console.error("Error guardando reserva:", error);
        }
      }
    });

    return () => unsubscribe();
  }, [datos, sessionId, guardadoEnFirebase]);

  const imprimirRecibo = () => window.print();

  if (cargando) return <div className="text-center py-20">Generando tu comprobante oficial...</div>;
  if (!datos) return <div className="text-center py-20 text-red-500">Error: No se encontró la sesión de pago.</div>;

 return (
    // Agregamos print:p-4 para darle margen en la hoja, y achicamos la fuente base con print:text-sm
    <div className="bg-white p-10 md:p-16 shadow-[0_20px_60px_rgba(0,0,0,0.05)] print:shadow-none print:p-6 print:text-sm print:max-w-full">
      
      {/* ENCABEZADO */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-slate-900 pb-8 mb-10 print:pb-4 print:mb-4">
        <div>
          <h1 className="text-3xl print:text-2xl font-black uppercase tracking-tighter text-slate-900">Voucher de Viaje</h1>
          <p className="text-[10px] print:text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Documento Oficial de Reserva</p>
        </div>
        <div className="mt-6 md:mt-0 text-left md:text-right">
          <p className="text-xl print:text-lg font-black text-slate-900 tracking-tight">Viajes Mágicos</p>
          <p className="text-[10px] print:text-[8px] font-bold text-slate-400 uppercase tracking-widest">Operado por DevSquad</p>
        </div>
      </header>

      {/* METADATOS */}
      <div className="grid grid-cols-2 md:grid-cols-4 print:grid-cols-4 gap-6 print:gap-2 mb-12 print:mb-6">
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Folio Stripe</p>
          <p className="text-xs print:text-[10px] font-mono font-black text-slate-900 truncate w-40" title={sessionId || ""}>
            {sessionId}
          </p>
        </div>
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Fecha de Compra</p>
          <p className="text-sm print:text-xs font-bold text-slate-700">{new Date().toLocaleDateString('es-MX')}</p>
        </div>
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Estado</p>
          <p className="text-sm print:text-xs font-black text-emerald-600">PAGADO (Confirmado)</p>
        </div>
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Destino</p>
          <p className="text-sm print:text-xs font-bold text-slate-700">{datos.destinoNombre}</p>
        </div>
      </div>

      {/* LOGÍSTICA COMPLETA */}
      <section className="mb-10 print:mb-6 break-inside-avoid">
        {/* Cambiamos el fondo gris por un borde inferior en impresión para no gastar tinta */}
        <h2 className="text-xs print:text-[10px] font-black text-slate-900 uppercase tracking-widest bg-slate-100 print:bg-transparent print:border-b print:border-slate-300 p-3 print:p-1 mb-6 print:mb-4">
          Logística de Itinerario
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-8 print:gap-4 px-3 print:px-0">
          
          <div className="border-l-4 border-blue-600 pl-4 print:pl-3">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">Punto de Partida (Salida)</p>
            <div className="space-y-3">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ubicación Exacta</p>
                <p className="text-sm print:text-xs font-black text-slate-900 leading-tight">
                  {datos.direccionCompleta || "Portal Constitución #10, Col. Centro, Toluca"}
                </p>
              </div>
              <div className="flex gap-8">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Hora de Cita</p>
                  <p className="text-lg print:text-sm font-black text-slate-900">{datos.horaCita || "07:45 AM"}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Fecha</p>
                  <p className="text-lg print:text-sm font-black text-slate-900">{datos.fechaSalida}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-l-4 border-slate-900 pl-4 print:pl-3 bg-slate-50/50 print:bg-transparent p-4 print:p-0 rounded-r-2xl">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Punto de Retorno (Regreso)</p>
            <div className="space-y-3">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Lugar de Descenso</p>
                <p className="text-sm print:text-xs font-bold text-slate-700 leading-tight">
                  {datos.direccionCompleta || "Mismo punto de salida"}
                </p>
              </div>
              <div className="flex gap-8">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Hora Estimada</p>
                  <p className="text-lg print:text-sm font-black text-slate-900">06:00 PM</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Fecha</p>
                  <p className="text-lg print:text-sm font-black text-slate-900">{datos.fechaRegreso}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ¡EL CUADRO DE INSTRUCCIONES RESTAURADO Y HORIZONTAL! */}
        <div className="mt-6 print:mt-4 mx-3 print:mx-0 bg-slate-50 print:bg-transparent print:border print:border-slate-300 p-4 print:p-3 rounded-2xl">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 print:mb-2">Instrucciones de Abordaje</p>
          <ul className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-3 text-[9px] text-slate-600 font-bold uppercase tracking-wider">
            <li>• Identificación oficial obligatoria al abordar.</li>
            <li>• Equipaje máximo: 1 maleta de mano por persona.</li>
            <li>• El transporte partirá puntualmente sin excepciones.</li>
          </ul>
        </div>
      </section>

      {/* HOSPEDAJE */}
      <section className="mb-12 print:mb-6 break-inside-avoid">
        <h2 className="text-xs print:text-[10px] font-black text-slate-900 uppercase tracking-widest bg-slate-100 print:bg-transparent print:border-b print:border-slate-300 p-3 print:p-1 mb-6 print:mb-4">
          Alojamiento Confirmado
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-6 print:gap-4 px-3 print:px-0">
          <div className="md:col-span-2 print:col-span-2">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nombre del Establecimiento</p>
            <p className="text-xl print:text-lg font-black text-blue-600 tracking-tight italic">{datos.hotelTipo}</p>
            <p className="text-xs print:text-[10px] font-bold text-slate-500 mt-1 flex items-center gap-1">
              📍 {datos.hotelUbicacion}
            </p>
          </div>
          
          {/* TRUCO IMPRESORA: Cambiamos a borde y texto oscuro al imprimir para que siempre se lea */}
          <div className="bg-slate-900 text-white print:bg-transparent print:border-2 print:border-slate-900 print:text-slate-900 p-4 print:p-2 rounded-2xl shadow-lg print:shadow-none flex flex-col justify-center">
            <p className="text-[9px] font-black text-slate-300 print:text-slate-500 uppercase tracking-widest mb-1 text-center">Check-in</p>
            <p className="text-sm print:text-xs font-black text-center uppercase tracking-tighter">Garantizado ✓</p>
          </div>
        </div>
      </section>

      {/* TOTAL Y PIE DE PÁGINA */}
      <section className="border-t-2 border-slate-900 pt-8 print:pt-4 break-inside-avoid">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-black uppercase tracking-widest text-slate-900">Total Sancionado (MXN)</span>
          <span className="text-2xl print:text-xl font-black text-slate-900">${datos.totalPagado}.00</span>
        </div>
      </section>

      {/* BOTONES */}
      <div className="mt-12 text-center print:hidden">
        <button onClick={imprimirRecibo} className="bg-slate-900 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-blue-600 transition-all active:scale-95 mr-4">
          🖨️ Imprimir Voucher
        </button>
        <Link href="/mis-viajes" className="text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-blue-600">
          Ir a Mis Viajes
        </Link>
      </div>
    </div>
  );
}

export default function PagoExitosoPage() {
  return (
    <main className="min-h-screen bg-slate-100 py-10 print:py-0 print:m-0 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto">
        <Suspense fallback={<div className="text-center font-bold">Cargando...</div>}>
          <ComprobanteDinamico />
        </Suspense>
      </div>
    </main>
  );
}