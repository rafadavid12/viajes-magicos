"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { db, auth } from "../../lib/firebase"; // Ajusta esta ruta si tu lib está en otro lado
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

function TicketExito() {
  const searchParams = useSearchParams();
  const destino = searchParams.get("destino");
  const total = searchParams.get("total");
  const sessionId = searchParams.get("session_id");
  
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    // Escuchamos quién está logueado para guardar la reserva a su nombre
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Solo guardamos si hay usuario, si hay sessionId y si NO lo hemos guardado ya en esta sesión
      if (user && sessionId && destino && total && !guardado) {
        try {
          await addDoc(collection(db, "reservas"), {
            usuarioEmail: user.email,
            usuarioNombre: user.displayName || "Viajero",
            destinoNombre: destino,
            totalPagado: Number(total),
            stripeSessionId: sessionId,
            fechaReserva: serverTimestamp(),
            estado: "Confirmado"
          });
          setGuardado(true);
          console.log("¡Reserva guardada en Firebase exitosamente!");
        } catch (error) {
          console.error("Error al guardar la reserva:", error);
        }
      }
    });

    return () => unsubscribe();
  }, [sessionId, destino, total, guardado]);

  return (
    <div className="bg-white p-10 md:p-16 rounded-[3rem] shadow-2xl border border-slate-100 max-w-2xl w-full text-center relative overflow-hidden">
      <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center text-5xl mx-auto mb-8 shadow-inner animate-fade-in-up">
        ✓
      </div>
      
      <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-4 tracking-tight">
        ¡Viaje Confirmado!
      </h1>
      <p className="text-slate-500 font-medium mb-10">
        Tu pago ha sido procesado de forma segura por Stripe y tu reserva está guardada.
      </p>

      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-left mb-10">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Resumen de tu reserva</h3>
        <div className="flex justify-between items-center mb-3">
          <span className="font-bold text-slate-700">Destino:</span>
          <span className="font-black text-blue-600">{destino || "Viaje Mágico"}</span>
        </div>
        <div className="flex justify-between items-center mb-3">
          <span className="font-bold text-slate-700">Total Pagado:</span>
          <span className="font-black text-slate-900">${total || "0.00"} MXN</span>
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-slate-200/50 mt-4">
          <span className="font-bold text-slate-700 text-xs">Folio de Reserva:</span>
          <span className="font-mono text-slate-400 text-xs truncate w-32">{sessionId}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/mis-viajes" className="bg-blue-600 text-white font-black uppercase tracking-widest text-sm px-10 py-5 rounded-full shadow-xl hover:bg-slate-900 transition-all active:scale-95">
          Ver mis viajes
        </Link>
        <Link href="/" className="bg-white border-2 border-slate-200 text-slate-700 font-black uppercase tracking-widest text-sm px-10 py-5 rounded-full hover:border-slate-900 transition-all active:scale-95">
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}

export default function PagoExitosoPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[url('https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-0"></div>
      <div className="relative z-10 w-full max-w-2xl">
        <Suspense fallback={<div className="text-white text-center font-bold">Generando ticket...</div>}>
          <TicketExito />
        </Suspense>
      </div>
    </main>
  );
}