"use client";
import { useEffect, useState } from "react";
import { db, auth } from "../../lib/firebase"; 
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import Link from "next/link";

interface Reserva {
  id: string;
  destinoNombre: string;
  totalPagado: number;
  fechaReserva: any;
  estado: string;
  stripeSessionId: string;
}

export default function MisViajes() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [cargando, setCargando] = useState(true);
  const [usuario, setUsuario] = useState<User | null>(null);
  
  // ESTADO NUEVO: Controla qué ticket está abierto en la pantalla emergente
  const [ticketAbierto, setTicketAbierto] = useState<Reserva | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUsuario(user);
      if (user) {
        try {
          const q = query(
            collection(db, "reservas"), 
            where("usuarioEmail", "==", user.email)
          );
          
          const querySnapshot = await getDocs(q);
          const misReservas = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Reserva[];
          
          setReservas(misReservas);
        } catch (error) {
          console.error("Error obteniendo reservas:", error);
        }
      }
      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  if (cargando) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>;
  }

  if (!usuario) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-black text-slate-800 mb-4">Debes iniciar sesión</h1>
        <p className="text-slate-500 mb-8">Para ver tus viajes confirmados necesitas entrar a tu cuenta.</p>
        <Link href="/login" className="bg-slate-900 text-white font-black uppercase tracking-widest px-8 py-4 rounded-full hover:bg-blue-600 transition-all shadow-lg">Iniciar Sesión</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pt-32 pb-20 px-6 font-sans relative">
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="mb-12">
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-2">Panel Privado</p>
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tighter italic">Mis Viajes Confirmados</h1>
        </div>

        {reservas.length === 0 ? (
          <div className="bg-white p-12 rounded-[3rem] border border-slate-100 text-center shadow-sm">
            <div className="text-6xl mb-6">🏜️</div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Aún no tienes aventuras</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">Parece que todavía no has reservado ningún viaje con nosotros. ¡Explora nuestros destinos y comienza la magia!</p>
            <Link href="/#catalogo" className="inline-block bg-blue-600 text-white font-black uppercase tracking-widest text-sm px-10 py-5 rounded-full shadow-xl hover:bg-slate-900 transition-all">Ver Destinos</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reservas.map((reserva) => (
              <div key={reserva.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[100px] -z-10 group-hover:bg-blue-100 transition-colors"></div>
                
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Destino</p>
                    <h3 className="text-2xl font-black text-slate-800 leading-tight">{reserva.destinoNombre || "Destino Desconocido"}</h3>
                  </div>
                  <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                    {reserva.estado || "Procesando"}
                  </span>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                    <span className="text-slate-500 font-bold text-sm">Total Pagado</span>
                    <span className="font-black text-slate-900 text-lg">${reserva.totalPagado || "0"} MXN</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold text-sm">Folio</span>
                    <span className="font-mono text-slate-400 text-xs w-24 truncate" title={reserva.stripeSessionId}>{reserva.stripeSessionId || "N/A"}</span>
                  </div>
                </div>

                {/* AQUÍ CONECTAMOS EL BOTÓN */}
                <button 
                  onClick={() => setTicketAbierto(reserva)}
                  className="w-full bg-slate-50 text-slate-700 font-black uppercase tracking-widest text-xs py-4 rounded-xl border border-slate-200 hover:bg-slate-900 hover:text-white transition-all active:scale-95"
                >
                  Ver Detalles del Ticket
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* VENTANA EMERGENTE (MODAL) DEL TICKET */}
      {ticketAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl transform transition-all">
            
            <div className="bg-slate-900 p-8 text-center relative">
              <button 
                onClick={() => setTicketAbierto(null)}
                className="absolute top-4 right-4 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors font-bold"
              >
                ✕
              </button>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-2">Pase de Abordar</p>
              <h2 className="text-3xl font-black text-white italic">{ticketAbierto.destinoNombre}</h2>
            </div>

            <div className="p-8">
              <div className="flex justify-between items-center border-b border-dashed border-slate-200 pb-4 mb-4">
                <span className="text-slate-500 font-bold text-sm">Titular</span>
                <span className="font-black text-slate-800">{usuario.displayName || "Viajero"}</span>
              </div>
              <div className="flex justify-between items-center border-b border-dashed border-slate-200 pb-4 mb-4">
                <span className="text-slate-500 font-bold text-sm">Estado del Pago</span>
                <span className="font-black text-emerald-600 flex items-center gap-1">✅ {ticketAbierto.estado || "Confirmado"}</span>
              </div>
              <div className="flex justify-between items-center border-b border-dashed border-slate-200 pb-4 mb-4">
                <span className="text-slate-500 font-bold text-sm">Total Facturado</span>
                <span className="font-black text-slate-900">${ticketAbierto.totalPagado} MXN</span>
              </div>
              <div className="flex flex-col items-center pt-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ID de Transacción Stripe</p>
                <p className="font-mono text-xs text-slate-500 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">{ticketAbierto.stripeSessionId}</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
              <button onClick={() => window.print()} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-800 transition-colors">
                🖨️ Imprimir Recibo
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}