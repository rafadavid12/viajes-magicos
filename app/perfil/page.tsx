"use client";
import { useEffect, useState, useRef } from "react";
import { auth, db, storage } from "../../lib/firebase";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { doc, getDoc, updateDoc, onSnapshot, setDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import Link from "next/link";

function obtenerIniciales(nombre: string | null | undefined): string {
  if (!nombre) return "VM";
  const partes = nombre.trim().split(/\s+/);
  if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
  return partes[0][0].toUpperCase();
}

export default function Perfil() {
  const [usuarioAuth, setUsuarioAuth] = useState<any>(null);
  const [datosPerfil, setDatosPerfil] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [notificacion, setNotificacion] = useState<{ tipo: 'exito' | 'error', mensaje: string } | null>(null);
  
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [cargandoFoto, setCargandoFoto] = useState(false);
  
  const [formulario, setFormulario] = useState({
    nombre: "",
    primerApellido: "",
    segundoApellido: "",
    telefono: ""
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (notificacion) {
      const timer = setTimeout(() => setNotificacion(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notificacion]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsuarioAuth(user);
        const docRef = doc(db, "usuarios", user.uid);
        
        const unsubscribeSnap = onSnapshot(docRef, async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setDatosPerfil(data);
            setFormulario({
              nombre: data.nombre || user.displayName || "",
              primerApellido: data.primerApellido || "",
              segundoApellido: data.segundoApellido || "",
              telefono: data.telefono || ""
            });
          } else {
            // Si es usuario de Google nuevo, le creamos su perfil base
            const nuevoUsuario = {
              nombre: user.displayName || "",
              primerApellido: "",
              segundoApellido: "",
              telefono: "",
              correo: user.email,
              fechaRegistro: new Date().toISOString(),
              photoURL: user.photoURL || ""
            };
            await setDoc(docRef, nuevoUsuario);
          }
          setCargando(false);
        }, (error) => {
          console.error("Error Firestore:", error);
          setCargando(false);
        });

        return () => unsubscribeSnap();
      } else {
        router.push("/login");
        setCargando(false);
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  // Maneja los cambios y aplica bloqueos inteligentes
  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === "telefono") {
      // Si es teléfono, solo acepta números
      const soloNumeros = value.replace(/[^0-9]/g, '');
      setFormulario({ ...formulario, [name]: soloNumeros.substring(0, 10) });
    } else {
      // Si es nombre o apellidos, solo acepta letras, espacios y acentos
      const soloLetras = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
      setFormulario({ ...formulario, [name]: soloLetras });
    }
  };

  // La validación fuerte antes de mandar a la base de datos
  const guardarCambios = async () => {
    const nombreLimpio = formulario.nombre.trim();
    const primerLimpio = formulario.primerApellido.trim();
    const segundoLimpio = formulario.segundoApellido.trim();
    const telefonoLimpio = formulario.telefono.trim();

    // 1. Validar campos vacíos obligatorios
    if (!nombreLimpio || !primerLimpio) {
      setNotificacion({ tipo: 'error', mensaje: 'Nombre y Primer Apellido son obligatorios' });
      return;
    }

    // 2. Validar que el teléfono exista y tenga exactamente 10 números
    if (!telefonoLimpio || telefonoLimpio.length !== 10) {
      setNotificacion({ tipo: 'error', mensaje: 'El teléfono debe tener 10 dígitos exactos' });
      return;
    }

    setGuardando(true);
    try {
      const docRef = doc(db, "usuarios", usuarioAuth.uid);
      const nuevosDatos = {
        nombre: nombreLimpio,
        primerApellido: primerLimpio,
        segundoApellido: segundoLimpio, // Si está vacío, se guarda vacío, sin la "X"
        telefono: telefonoLimpio
      };

      await updateDoc(docRef, nuevosDatos);
      setEditando(false); 
      setNotificacion({ tipo: 'exito', mensaje: '¡Perfil actualizado con éxito!' });
    } catch (error) {
      setNotificacion({ tipo: 'error', mensaje: 'Ocurrió un error al guardar' });
    } finally {
      setGuardando(false);
    }
  };

  const manejarSubidaImagen = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const archivo = e.target.files?.[0];
      if (!archivo) return;

      // Validación de tamaño: Firestore tiene un límite de 1MB por documento.
      // Limitamos a 500KB para estar seguros y no saturar la base de datos.
      if (archivo.size > 500000) {
        setNotificacion({ tipo: 'error', mensaje: 'La foto es muy pesada. Elige una menor a 500KB' });
        return;
      }

      setCargandoFoto(true);

      try {
        const reader = new FileReader();
        
        reader.onloadend = async () => {
          const base64String = reader.result as string;

          // 1. Guardamos la imagen como texto directamente en Firestore
          // Esto es lo que permite que la foto sea persistente sin usar Storage.
          await updateDoc(doc(db, "usuarios", usuarioAuth.uid), {
            photoURL: base64String
          });

          // NOTA: Eliminamos 'updateProfile' de Auth porque no soporta textos tan largos (Base64).
          // Como tu componente ya lee la foto de 'datosPerfil', esto es suficiente.

          setNotificacion({ tipo: 'exito', mensaje: '¡Imagen de perfil actualizada!' });
          setCargandoFoto(false);
        };

        reader.readAsDataURL(archivo);

      } catch (error) {
        console.error("Error al procesar imagen:", error);
        setNotificacion({ tipo: 'error', mensaje: 'Error al procesar la foto' });
        setCargandoFoto(false);
      }
    };
  if (cargando) return (
    <div className="min-h-screen flex justify-center items-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  const photoURL = datosPerfil?.photoURL || usuarioAuth?.photoURL;
  const iniciales = obtenerIniciales(datosPerfil?.nombre);

  return (
    <main className="min-h-screen bg-slate-50 pt-32 pb-12 px-6">
      <div className="max-w-5xl mx-auto">
        <input type="file" ref={fileInputRef} onChange={manejarSubidaImagen} accept="image/*" className="hidden" />

        {/* HEADER */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Mi Perfil</h1>
            <p className="text-slate-500 font-medium mt-2">Gestiona tu información personal y preferencias.</p>
          </div>
          <Link href="/mis-viajes" className="bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-black hover:bg-slate-50 transition-all text-xs uppercase tracking-widest shadow-sm">
            Ver Mis Viajes
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* TARJETA IZQUIERDA */}
          <div className="lg:col-span-4 bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center text-center h-fit">
            <div className="relative group cursor-pointer mb-8" onClick={() => fileInputRef.current?.click()}>
              {photoURL ? (
                <img src={photoURL} alt="Perfil" className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-xl" />
              ) : (
                <div className="w-40 h-40 rounded-full bg-slate-900 flex items-center justify-center border-4 border-white shadow-xl">
                  <span className="text-5xl font-black text-white">{iniciales}</span>
                </div>
              )}
              <div className={`absolute inset-0 bg-slate-900/60 rounded-full flex items-center justify-center transition-all ${cargandoFoto ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                {cargandoFoto ? <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div> : <span className="text-3xl">📸</span>}
              </div>
            </div>
            
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
              {datosPerfil?.nombre} {datosPerfil?.primerApellido} {datosPerfil?.segundoApellido}
            </h2>
            <p className="text-blue-600 font-bold text-sm mb-8">{usuarioAuth?.email}</p>
            
            <div className="w-full pt-8 border-t border-slate-50">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-1">Miembro desde</p>
              <p className="text-slate-900 font-black text-sm uppercase">
                {datosPerfil?.fechaRegistro ? new Date(datosPerfil.fechaRegistro).toLocaleDateString('es-MX', { year: 'numeric', month: 'long' }) : "Abril de 2026"}
              </p>
            </div>
          </div>

          {/* TARJETA DERECHA (FORMULARIO) */}
          <div className="lg:col-span-8 bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <span className="w-1.5 h-8 bg-blue-600 rounded-full inline-block"></span>
                Información de Contacto
              </h3>
              {editando && (
                <button onClick={() => setEditando(false)} className="text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest transition-all">
                  Cancelar
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* CAMPO: NOMBRE */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre(s)</label>
                {editando ? (
                  <input type="text" name="nombre" value={formulario.nombre} onChange={manejarCambio} className="w-full bg-white border-2 border-blue-600 p-4 rounded-2xl font-bold text-slate-900 outline-none shadow-lg shadow-blue-600/10" />
                ) : (
                  <div className="bg-slate-100 p-5 rounded-2xl border border-slate-200 font-bold text-slate-500">{datosPerfil?.nombre || "N/A"}</div>
                )}
              </div>

              {/* CAMPO: PRIMER APELLIDO */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Primer Apellido</label>
                {editando ? (
                  <input type="text" name="primerApellido" value={formulario.primerApellido} onChange={manejarCambio} className="w-full bg-white border-2 border-blue-600 p-4 rounded-2xl font-bold text-slate-900 outline-none shadow-lg shadow-blue-600/10" />
                ) : (
                  <div className="bg-slate-100 p-5 rounded-2xl border border-slate-200 font-bold text-slate-500">{datosPerfil?.primerApellido || "N/A"}</div>
                )}
              </div>

              {/* CAMPO: SEGUNDO APELLIDO */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Segundo Apellido</label>
                {editando ? (
                  <input type="text" name="segundoApellido" value={formulario.segundoApellido} onChange={manejarCambio} className="w-full bg-white border-2 border-blue-600 p-4 rounded-2xl font-bold text-slate-900 outline-none shadow-lg shadow-blue-600/10" />
                ) : (
                  <div className="bg-slate-100 p-5 rounded-2xl border border-slate-200 font-bold text-slate-500">{datosPerfil?.segundoApellido || "N/A"}</div>
                )}
              </div>

              {/* CAMPO: TELÉFONO (CON VALIDACIÓN) */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Teléfono Móvil (10 dígitos)</label>
                {editando ? (
                  <input 
                    type="tel" 
                    name="telefono" 
                    value={formulario.telefono} 
                    onChange={manejarCambio} 
                    maxLength={10} 
                    placeholder="Ej. 7221234567"
                    className="w-full bg-white border-2 border-blue-600 p-4 rounded-2xl font-bold text-slate-900 outline-none shadow-lg shadow-blue-600/10" 
                  />
                ) : (
                  <div className="bg-slate-100 p-5 rounded-2xl border border-slate-200 font-bold text-slate-500">
                    {datosPerfil?.telefono ? `${datosPerfil.telefono.slice(0,2)} ${datosPerfil.telefono.slice(2,6)} ${datosPerfil.telefono.slice(6,10)}` : "Falta registrar"}
                  </div>
                )}
              </div>

              {/* CAMPO: EMAIL (SIEMPRE LECTURA) */}
              <div className="md:col-span-2 space-y-2 opacity-50">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Correo Electrónico (No editable)</label>
                <div className="bg-slate-200 p-5 rounded-2xl border border-slate-300 font-bold text-slate-600 cursor-not-allowed">{usuarioAuth?.email}</div>
              </div>
            </div>

            <div className="mt-12 pt-10 border-t border-slate-50">
              <button 
                onClick={editando ? guardarCambios : () => setEditando(true)}
                disabled={guardando}
                className={`w-full md:w-auto px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-xl ${editando ? 'bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-700' : 'bg-slate-900 text-white shadow-slate-900/20 hover:bg-slate-800'}`}
              >
                {guardando ? "Guardando..." : (editando ? "Confirmar Cambios" : "Editar mi Información")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* NOTIFICACIÓN PREMIUM */}
      {notificacion && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className={`flex items-center gap-4 px-8 py-5 rounded-[2rem] shadow-2xl backdrop-blur-xl border ${notificacion.tipo === 'exito' ? 'bg-slate-900/90 border-emerald-500/50 text-white' : 'bg-red-600/90 border-red-400 text-white'}`}>
            <div className={`p-2 rounded-full ${notificacion.tipo === 'exito' ? 'bg-emerald-500' : 'bg-white/20'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d={notificacion.tipo === 'exito' ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} /></svg>
            </div>
            <p className="text-xs font-black uppercase tracking-widest">{notificacion.mensaje}</p>
          </div>
        </div>
      )}
    </main>
  );
}