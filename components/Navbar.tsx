"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, onSnapshot, setDoc } from "firebase/firestore"; 
import { useRouter } from "next/navigation";

// Función auxiliar para iniciales
function obtenerIniciales(nombre: string | null | undefined): string {
  if (!nombre) return "VM";
  const partes = nombre.trim().split(/\s+/);
  if (partes.length >= 2) {
    return (partes[0][0] + partes[1][0]).toUpperCase();
  }
  return partes[0][0].toUpperCase();
}

export default function Navbar() {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [datosFirestore, setDatosFirestore] = useState<any>(null);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUsuario(user);
        
        const userDocRef = doc(db, "usuarios", user.uid);
        const unsubscribeSnap = onSnapshot(userDocRef, async (docSnap) => {
          if (docSnap.exists()) {
            setDatosFirestore(docSnap.data());
          } else {
            // Si es usuario de Google nuevo, preparamos su documento
            const nuevoDoc = {
              nombre: user.displayName || "",
              correo: user.email,
              fechaRegistro: new Date().toISOString(),
              photoURL: user.photoURL || ""
            };
            await setDoc(userDocRef, nuevoDoc);
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

  const nombreCompleto = datosFirestore?.nombre || usuario?.displayName || "";
  const primerNombre = nombreCompleto.split(" ")[0] || "Viajero";
  const iniciales = obtenerIniciales(nombreCompleto);
  const photoURL = datosFirestore?.photoURL || usuario?.photoURL;

  return (
    <nav className="fixed top-0 left-0 w-full bg-white/40 backdrop-blur-lg border-b border-white/30 z-50 shadow-sm transition-all print:hidden">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* LOGO Y DEVSQUAD */}
        <Link href="/" className="flex flex-col hover:opacity-80 transition-opacity">
          <span className="text-[8px] font-black text-blue-600 uppercase tracking-[0.3em] mb-0.5 ml-0.5 drop-shadow-sm">DevSquad</span>
          <div className="text-xl font-black text-slate-900 tracking-tighter leading-none drop-shadow-sm">
            Viajes <span className="text-blue-600">Mágicos</span>
          </div>
        </Link>

        {/* LADO DERECHO: Enlaces + Separador + Perfil */}
        <div className="flex items-center gap-5 sm:gap-6">
          
          {/* ENLACES DESTINOS / PAQUETES / NOSOTROS */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/destinos" className="text-[11px] font-black text-slate-700 hover:text-blue-600 uppercase tracking-widest transition-colors drop-shadow-sm">
              Destinos
            </Link>
            <Link href="/paquetes" className="text-[11px] font-black text-slate-700 hover:text-blue-600 uppercase tracking-widest transition-colors drop-shadow-sm">
              Paquetes
            </Link>
            <Link href="/nosotros" className="text-[11px] font-black text-slate-700 hover:text-blue-600 uppercase tracking-widest transition-colors drop-shadow-sm">
              Nosotros
            </Link>
          </div>

          {/* LÍNEA SEPARADORA FINA (Solo visible en pantallas grandes y si el usuario está logueado o hay links) */}
          <div className="hidden md:block w-[1px] h-6 bg-slate-400/40"></div>

          {/* ÁREA DE USUARIO */}
          {usuario ? (
            <div className="relative flex items-center gap-4">
              <span className="hidden md:block text-[10px] font-black text-slate-700 uppercase tracking-[0.2em] drop-shadow-sm">
                {primerNombre}
              </span>

              <button 
                onClick={() => setMenuAbierto(!menuAbierto)}
                className="flex items-center justify-center w-9 h-9 rounded-full ring-2 ring-transparent hover:ring-blue-400 hover:shadow-md transition-all active:scale-95 overflow-hidden"
              >
                {photoURL ? (
                  <img src={photoURL} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-900 flex items-center justify-center shadow-inner">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">
                      {iniciales}
                    </span>
                  </div>
                )}
              </button>

              {/* MENÚ DESPLEGABLE */}
              {menuAbierto && (
                <div className="absolute right-0 top-full mt-3 w-64 bg-white/95 backdrop-blur-xl border border-slate-100/50 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-2 animate-in fade-in zoom-in duration-200">
                  <div className="px-5 py-4 border-b border-slate-100">
                    <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">Sesión activa</p>
                    <p className="text-sm font-bold text-slate-800 truncate">{usuario.email}</p>
                  </div>
                  
                  <div className="p-1 space-y-1 mt-1">
                    <Link href="/perfil" onClick={() => setMenuAbierto(false)} className="flex items-center gap-3 p-4 hover:bg-slate-50 rounded-2xl text-xs font-black text-slate-700 uppercase tracking-widest transition-colors group">
                      <span className="group-hover:scale-125 transition-transform">👤</span> Mi Perfil
                    </Link>
                    <Link href="/mis-viajes" onClick={() => setMenuAbierto(false)} className="flex items-center gap-3 p-4 hover:bg-slate-50 rounded-2xl text-xs font-black text-slate-700 uppercase tracking-widest transition-colors group">
                      <span className="group-hover:scale-125 transition-transform">📂</span> Mis Viajes
                    </Link>
                    <div className="border-t border-slate-50 my-1"></div>
                    <button onClick={cerrarSesion} className="w-full flex items-center gap-3 p-4 hover:bg-red-50 rounded-2xl text-xs font-black text-red-500 uppercase tracking-widest transition-colors group text-left">
                      <span className="group-hover:rotate-12 transition-transform">🚪</span> Salir
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-6 py-3.5 rounded-2xl hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-slate-900/20">
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}