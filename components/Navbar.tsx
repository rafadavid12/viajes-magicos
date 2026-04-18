"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore"; 
import { useRouter } from "next/navigation";

// Función auxiliar mejorada para iniciales (Ej: Deni Samantha -> DS)
function obtenerIniciales(nombre: string | null | undefined, email: string | null | undefined): string {
  if (nombre && nombre.trim().length > 0) {
    const partes = nombre.trim().split(/\s+/);
    if (partes.length >= 2) {
      return (partes[0][0] + partes[1][0]).toUpperCase();
    }
    return partes[0][0].toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return "VM";
}

export default function Navbar() {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [datosFirestore, setDatosFirestore] = useState<any>(null);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsuario(user);
        
        // Escuchamos Firestore en tiempo real
        const userDocRef = doc(db, "usuarios", user.uid);
        const unsubscribeSnap = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setDatosFirestore(docSnap.data());
          }
        });

        return () => unsubscribeSnap();
      } else {
        setUsuario(null);
        setDatosFirestore(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const cerrarSesion = async () => {
    try {
      await signOut(auth);
      setMenuAbierto(false);
      router.push("/");
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  // Variables calculadas para evitar errores de renderizado
  const nombreCompleto = datosFirestore?.nombre || usuario?.displayName || "";
  const primerNombre = nombreCompleto.split(" ")[0] || "Viajero";
  const iniciales = obtenerIniciales(nombreCompleto, usuario?.email);
  const photoURL = datosFirestore?.photoURL || usuario?.photoURL;

  return (
    <nav className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-xl border-b border-slate-100 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-black text-slate-900 tracking-tighter hover:opacity-80 transition-opacity">
          Viajes <span className="text-blue-600">Mágicos</span>
        </Link>

        {usuario ? (
          <div className="relative flex items-center gap-4">
            {/* NOMBRE SIEMPRE VISIBLE - Estilo Premium */}
            <span className="hidden md:block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              {primerNombre}
            </span>

            {/* BOTÓN DEL PERFIL */}
            <button 
              onClick={() => setMenuAbierto(!menuAbierto)}
              className="flex items-center gap-2 bg-white border border-slate-200 p-1 rounded-full hover:shadow-md transition-all active:scale-95"
            >
              {photoURL ? (
                <img src={photoURL} alt="Perfil" className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center shadow-inner border border-slate-800">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">
                    {iniciales}
                  </span>
                </div>
              )}
            </button>

            {/* MENÚ DESPLEGABLE ANIMADO */}
            {menuAbierto && (
              <div className="absolute right-0 top-full mt-3 w-64 bg-white border border-slate-100 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-2 animate-in fade-in zoom-in duration-200">
                <div className="px-5 py-4 border-b border-slate-50">
                  <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">Sesión activa</p>
                  <p className="text-sm font-bold text-slate-800 truncate">{usuario.email}</p>
                </div>
                
                <div className="p-1 space-y-1 mt-1">
                  <Link 
                    href="/perfil" 
                    onClick={() => setMenuAbierto(false)} 
                    className="flex items-center gap-3 p-4 hover:bg-slate-50 rounded-2xl text-xs font-black text-slate-700 uppercase tracking-widest transition-colors group"
                  >
                    <span className="group-hover:scale-125 transition-transform">👤</span> Mi Perfil
                  </Link>
                  
                  <Link 
                    href="/mis-viajes" 
                    onClick={() => setMenuAbierto(false)} 
                    className="flex items-center gap-3 p-4 hover:bg-slate-50 rounded-2xl text-xs font-black text-slate-700 uppercase tracking-widest transition-colors group"
                  >
                    <span className="group-hover:scale-125 transition-transform">📂</span> Mis Viajes
                  </Link>

                  <div className="border-t border-slate-50 my-1"></div>
                  
                  <button 
                    onClick={cerrarSesion} 
                    className="w-full flex items-center gap-3 p-4 hover:bg-red-50 rounded-2xl text-xs font-black text-red-500 uppercase tracking-widest transition-colors group"
                  >
                    <span className="group-hover:rotate-12 transition-transform">🚪</span> Salir
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-2xl hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-slate-900/20">
            Iniciar Sesión
          </Link>
        )}
      </div>
    </nav>
  );
}