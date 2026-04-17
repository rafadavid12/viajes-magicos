"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";

export default function Navbar() {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [cargando, setCargando] = useState(true); // ¡NUEVO! Le decimos que empiece cargando

  useEffect(() => {
    // Este observador escucha si hay un usuario logueado en la memoria del navegador
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      setCargando(false); // Cuando Firebase termina de revisar, quitamos el estado de carga
    });
    return () => unsubscribe();
  }, []);

  const cerrarSesion = () => {
    signOut(auth);
  };

  return (
    <nav className="flex justify-between items-center p-6 bg-white shadow-sm sticky top-0 z-50">
      <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition">
        Viajes Mágicos ✨
      </Link>
      
      <div className="space-x-6 font-medium flex items-center">
        <Link href="/destinos" className="hover:text-blue-500 transition hidden md:block">Destinos</Link>
        <Link href="/paquetes" className="hover:text-blue-500 transition hidden md:block">Paquetes</Link>
        
        {/* LOGICA DE RENDERIZADO (El cerebro del menú) */}
        {cargando ? (
          // 1. Mientras Firebase piensa, mostramos un pequeño círculo giratorio (Spinner)
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        ) : usuario ? (
          // 2. Si Firebase dice que SÍ hay usuario, mostramos tu foto
          <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-full border border-slate-200">
            <span className="text-sm text-slate-600 font-semibold hidden md:block">
              {usuario.displayName?.split(" ")[0]}
            </span>
            {usuario.photoURL ? (
              <img 
                src={usuario.photoURL} 
                alt="Perfil" 
                className="w-8 h-8 rounded-full border border-slate-300"
              />
            ) : (
               <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                 {usuario.displayName?.charAt(0)}
               </div>
            )}
            <button 
              onClick={cerrarSesion} 
              className="text-sm text-red-500 font-bold hover:underline ml-2"
            >
              Salir
            </button>
          </div>
        ) : (
          // 3. Si Firebase confirma que NO hay nadie, mostramos el botón azul normal
          <Link href="/login" className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition shadow-md hover:shadow-lg">
            Iniciar Sesión
          </Link>
        )}
      </div>
    </nav>
  );
}