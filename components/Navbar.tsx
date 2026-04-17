"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";

export default function Navbar() {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Tu lógica original de Firebase
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      setCargando(false);
    });
    return () => unsubscribe();
  }, []);

  const cerrarSesion = () => {
    signOut(auth);
  };

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/80 border-b border-slate-200/50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* IDENTIDAD: DevSquad + Viajes Mágicos */}
        <Link href="/" className="group flex flex-col items-start leading-none outline-none">
          <span className="text-[10px] font-black text-blue-600/40 uppercase tracking-[0.3em] mb-1 transition-colors group-hover:text-blue-600">
            DevSquad
          </span>
          <span className="text-2xl font-black tracking-tighter text-slate-800 transition-colors">
            Viajes <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-400">Mágicos</span>
          </span>
        </Link>
        
        <div className="flex items-center gap-8 font-medium">
          {/* ENLACES DE NAVEGACIÓN */}
          <div className="hidden md:flex items-center gap-8 border-r border-slate-200 pr-8">
            <Link href="/destinos" className="text-[11px] font-black text-slate-500 hover:text-blue-600 uppercase tracking-[0.2em] transition-colors">
              Destinos
            </Link>
            <Link href="/paquetes" className="text-[11px] font-black text-slate-500 hover:text-blue-600 uppercase tracking-[0.2em] transition-colors">
              Paquetes
            </Link>
          </div>
          
          {/* LÓGICA DE RENDERIZADO (Tu lógica original) */}
          <div className="flex items-center">
            {cargando ? (
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            ) : usuario ? (
              <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-full py-1.5 pl-4 pr-1.5 shadow-sm hover:shadow-md transition-all">
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider hidden md:block">
                  {usuario.displayName?.split(" ")[0]}
                </span>
                
                {usuario.photoURL ? (
                  <img 
                    src={usuario.photoURL} 
                    alt="Perfil" 
                    className="w-8 h-8 rounded-full border border-slate-100 object-cover shadow-sm"
                  />
                ) : (
                   <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black text-[10px]">
                     {usuario.displayName?.charAt(0)}
                   </div>
                )}
                
                <button 
                  onClick={cerrarSesion} 
                  className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full transition-all"
                >
                  Salir
                </button>
              </div>
            ) : (
              <Link href="/login" className="bg-slate-900 text-white px-8 py-3 rounded-full hover:bg-blue-600 transition-all shadow-lg text-[11px] font-black uppercase tracking-widest">
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}