"use client";
import { useEffect, useState } from "react";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore"; // Importamos updateDoc
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Perfil() {
  const [usuarioAuth, setUsuarioAuth] = useState<any>(null);
  const [datosPerfil, setDatosPerfil] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  
  // Nuevos estados para el "Modo Edición"
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [formulario, setFormulario] = useState({
    nombre: "",
    primerApellido: "",
    segundoApellido: "",
    telefono: ""
  });

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUsuarioAuth(user);
        const docRef = doc(db, "usuarios", user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDatosPerfil(data);
          // Pre-llenamos el formulario con sus datos reales para cuando le dé a Editar
          setFormulario({
            nombre: data.nombre || "",
            primerApellido: data.primerApellido || "",
            segundoApellido: data.segundoApellido || "",
            telefono: data.telefono || ""
          });
        }
      } else {
        router.push("/login");
      }
      setCargando(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Función maestra para guardar en la base de datos
  const guardarCambios = async () => {
    setGuardando(true);
    try {
      const docRef = doc(db, "usuarios", usuarioAuth.uid);
      await updateDoc(docRef, {
        nombre: formulario.nombre,
        primerApellido: formulario.primerApellido,
        segundoApellido: formulario.segundoApellido,
        telefono: formulario.telefono
      });
      
      // Actualizamos la pantalla con los nuevos datos y cerramos el modo edición
      setDatosPerfil({ ...datosPerfil, ...formulario });
      setEditando(false); 
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Hubo un error al guardar los cambios.");
    } finally {
      setGuardando(false);
    }
  };

  // Función para manejar lo que el usuario escribe en los inputs
  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value
    });
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pt-32 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mi Perfil</h1>
            <p className="text-slate-500 font-medium mt-1">Gestiona tu información personal y preferencias.</p>
          </div>
          <Link href="/mis-viajes" className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all text-sm uppercase tracking-widest shadow-sm">
            Ver Mis Viajes
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Tarjeta de Resumen (Izquierda) */}
          <div className="md:col-span-1 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <img 
              src={usuarioAuth?.photoURL || `https://ui-avatars.com/api/?name=${datosPerfil?.nombre || 'Viajero'}&background=0f172a&color=fff&size=150`} 
              alt="Perfil" 
              className="w-32 h-32 rounded-full object-cover mb-6 border-4 border-slate-50 shadow-lg"
            />
            <h2 className="text-xl font-black text-slate-900">
              {datosPerfil?.nombre} {datosPerfil?.primerApellido}
            </h2>
            <p className="text-slate-500 font-medium text-sm mt-1">{usuarioAuth?.email}</p>
            <div className="mt-6 w-full pt-6 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Miembro desde</p>
              <p className="text-slate-700 font-medium">
                {datosPerfil?.fechaRegistro ? new Date(datosPerfil.fechaRegistro).toLocaleDateString('es-MX', { year: 'numeric', month: 'long' }) : "Reciente"}
              </p>
            </div>
          </div>

          {/* Tarjeta de Detalles (Derecha) */}
          <div className="md:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span className="w-2 h-6 bg-blue-600 rounded-sm inline-block"></span>
                Información de Contacto
              </h3>
              {editando && (
                <button 
                  onClick={() => setEditando(false)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors"
                >
                  Cancelar
                </button>
              )}
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 pl-1">Nombre(s)</p>
                  {editando ? (
                    <input type="text" name="nombre" value={formulario.nombre} onChange={manejarCambio} className="w-full bg-white border-2 border-blue-100 text-slate-900 p-3.5 rounded-xl focus:outline-none focus:border-blue-600 transition-all font-medium" />
                  ) : (
                    <p className="text-slate-900 font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">{datosPerfil?.nombre || "No registrado"}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 pl-1">Apellido Paterno</p>
                  {editando ? (
                    <input type="text" name="primerApellido" value={formulario.primerApellido} onChange={manejarCambio} className="w-full bg-white border-2 border-blue-100 text-slate-900 p-3.5 rounded-xl focus:outline-none focus:border-blue-600 transition-all font-medium" />
                  ) : (
                    <p className="text-slate-900 font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">{datosPerfil?.primerApellido || "No registrado"}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 pl-1">Apellido Materno</p>
                  {editando ? (
                    <input type="text" name="segundoApellido" value={formulario.segundoApellido} onChange={manejarCambio} className="w-full bg-white border-2 border-blue-100 text-slate-900 p-3.5 rounded-xl focus:outline-none focus:border-blue-600 transition-all font-medium" />
                  ) : (
                    <p className="text-slate-900 font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">{datosPerfil?.segundoApellido || "No registrado"}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 pl-1">Teléfono Móvil</p>
                  {editando ? (
                    <input type="tel" name="telefono" value={formulario.telefono} onChange={manejarCambio} className="w-full bg-white border-2 border-blue-100 text-slate-900 p-3.5 rounded-xl focus:outline-none focus:border-blue-600 transition-all font-medium" />
                  ) : (
                    <p className="text-slate-900 font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">{datosPerfil?.telefono || "No registrado"}</p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 pl-1">Correo Electrónico <span className="text-[10px] text-slate-300 normal-case tracking-normal">(No se puede cambiar)</span></p>
                <p className="text-slate-500 font-medium bg-slate-50 p-4 rounded-xl border border-slate-100 cursor-not-allowed">
                  {usuarioAuth?.email}
                </p>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100">
              {editando ? (
                <button 
                  onClick={guardarCambios}
                  disabled={guardando}
                  className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all text-sm uppercase tracking-widest shadow-lg shadow-blue-600/30 active:scale-95 disabled:opacity-50"
                >
                  {guardando ? "Guardando..." : "Guardar Cambios"}
                </button>
              ) : (
                <button 
                  onClick={() => setEditando(true)}
                  className="bg-slate-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-all text-sm uppercase tracking-widest shadow-lg shadow-slate-900/20 active:scale-95"
                >
                  Editar Información
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}