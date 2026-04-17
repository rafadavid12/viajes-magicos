"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";

export default function Navbar() {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [cargando, setCargando] = useState(true);
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      setCargando(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 border-b border-slate-200/50 transition-all duration-500">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* LOGO ANIMADO DevSquad + Viajes Mágicos */}
        <Link href="/" className="group flex flex-col items-start leading-none outline-none transform transition-transform duration-300 active:scale-95">
          <span className="text-[9px] font-black text-blue-600/30 uppercase tracking-[0.4em] mb-1 transition-all duration-500 group-hover:text-blue-500 group-hover:tracking-[0.5em]">
            DevSquad
          </span>
          <span className="text-2xl font-black tracking-tighter text-slate-800 transition-all duration-300 group-hover:drop-shadow-[0_0_15px_rgba(37,99,235,0.3)]">
            Viajes <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-400 to-emerald-400 bg-[length:200%_auto] animate-gradient-x">Mágicos</span>
          </span>
        </Link>
        
        <div className="flex items-center gap-8 font-medium">
          {/* ENLACES CON SUBRAYADO ANIMADO */}
          <div className="hidden md:flex items-center gap-8 border-r border-slate-200 pr-8">
            <Link href="/destinos" className="relative text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] transition-colors hover:text-blue-600 group">
              Destinos
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/paquetes" className="relative text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] transition-colors hover:text-blue-600 group">
              Paquetes
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </div>
          
          {/* SECCIÓN DE USUARIO CON DROPDOWN */}
          <div className="relative">
            {cargando ? (
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            ) : usuario ? (
              <>
                <button 
                  onClick={() => setMenuAbierto(!menuAbierto)}
                  className="flex items-center gap-3 bg-white border border-slate-200 rounded-full py-1.5 pl-4 pr-1.5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300 active:scale-95"
                >
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wider hidden md:block">
                    {usuario.displayName?.split(" ")[0]}
                  </span>
                  <div className="relative">
                    <img 
                      src={usuario.photoURL || ""} 
                      alt="Perfil" 
                      className="w-8 h-8 rounded-full object-cover border border-slate-100 shadow-inner"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                  </div>
                </button>

                {/* MENÚ DESPLEGABLE ANIMADO */}
                {menuAbierto && (
                  <div className="absolute right-0 mt-3 w-60 bg-white/95 backdrop-blur-xl border border-slate-100 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-2 transition-all duration-300 animate-in fade-in zoom-in slide-in-from-top-2">
                    <div className="px-5 py-4 border-b border-slate-50">
                      <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1">Tu cuenta</p>
                      <p className="text-sm font-bold text-slate-800 truncate">{usuario.email}</p>
                    </div>
                    <div className="p-1">
                      <Link 
                        href="/mis-viajes" 
                        className="flex items-center gap-3 p-4 hover:bg-blue-50 rounded-2xl text-xs font-black text-slate-700 uppercase tracking-widest transition-colors group"
                      >
                        <span className="group-hover:scale-125 transition-transform">📂</span> Mis Viajes
                      </Link>
                      <button 
                        onClick={() => signOut(auth)}
                        className="w-full flex items-center gap-3 p-4 hover:bg-red-50 rounded-2xl text-xs font-black text-red-500 uppercase tracking-widest transition-colors group"
                      >
                        <span className="group-hover:rotate-12 transition-transform">🚪</span> Salir
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Link href="/login" className="bg-slate-900 text-white px-8 py-3 rounded-full hover:bg-blue-600 transition-all shadow-lg hover:shadow-blue-500/30 text-[11px] font-black uppercase tracking-widest active:scale-95">
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}