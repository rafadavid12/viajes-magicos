"use client";
import { useState } from "react";
import { auth, db } from "../../lib/firebase"; // Asegúrate de importar db
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile // <--- AGREGA ESTA NUEVA HERRAMIENTA
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; // Para guardar los datos extra
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const [esRegistro, setEsRegistro] = useState(false);
  
  // Estados para los campos del formulario
  const [nombre, setNombre] = useState("");
  const [primerApellido, setPrimerApellido] = useState("");
  const [segundoApellido, setSegundoApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  // Filtros para evitar números en nombres y letras en teléfono
  const manejarNombre = (val: string) => setNombre(val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ""));
  const manejarPrimerApellido = (val: string) => setPrimerApellido(val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ""));
  const manejarSegundoApellido = (val: string) => setSegundoApellido(val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ""));
  const manejarTelefono = (val: string) => {
    const soloNumeros = val.replace(/[^0-9]/g, "");
    setTelefono(soloNumeros.substring(0, 10)); // Corta a 10 dígitos
  };
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  // Función para Google
  const manejarGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (error: any) {
      setError("Error al iniciar sesión con Google.");
    }
  };

  // Función principal de envío (Login o Registro)
  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      if (esRegistro) {
        // --- 1. BLOQUE DE VALIDACIONES NUEVAS ---
        
        // Validar que no haya campos obligatorios vacíos
        if (!nombre.trim() || !primerApellido.trim() || !telefono.trim() || !email.trim() || !password.trim()) {
          setError("Todos los campos marcados con * son obligatorios.");
          setCargando(false);
          return;
        }

        // Validar formato de correo electrónico
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          setError("Por favor, ingresa un correo electrónico válido.");
          setCargando(false);
          return;
        }

        // Validar que el teléfono tenga exactamente 10 dígitos
        if (telefono.length !== 10) {
          setError("El teléfono debe tener exactamente 10 dígitos.");
          setCargando(false);
          return;
        }

        // Validar que las contraseñas coincidan
        if (password !== confirmarPassword) {
          setError("Las contraseñas no coinciden.");
          setCargando(false);
          return;
        }

        // --- 2. PROCESO DE REGISTRO (Tu código original) ---
        
        const credenciales = await createUserWithEmailAndPassword(auth, email, password);
        const usuario = credenciales.user;

        await updateProfile(usuario, {
          displayName: nombre
        });

        await setDoc(doc(db, "usuarios", usuario.uid), {
          nombre: nombre.trim(),
          primerApellido: primerApellido.trim(),
          segundoApellido: segundoApellido.trim(),
          telefono: telefono,
          correo: email,
          fechaRegistro: new Date().toISOString(),
          rol: "cliente"
        });

      } else {
        // Iniciar sesión existente
        await signInWithEmailAndPassword(auth, email, password);
      }
      
      router.push("/"); 
      
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setError("Este correo ya está registrado. Intenta iniciar sesión.");
      } else if (error.code === 'auth/invalid-credential') {
        setError("Correo o contraseña incorrectos.");
      } else if (error.code === 'auth/weak-password') {
        setError("La contraseña debe tener al menos 6 caracteres.");
      } else {
        setError("Ocurrió un error en el servidor. Intenta de nuevo.");
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6 py-12 relative overflow-hidden">
      {/* Fondos */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>

      <div className={`bg-white p-8 md:p-12 rounded-[2rem] shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] w-full relative z-10 border border-slate-100 transition-all duration-500 ${esRegistro ? 'max-w-2xl' : 'max-w-md'}`}>
        
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-2xl font-black text-slate-800 tracking-tighter mb-6 hover:text-blue-600 transition-colors">
            Viajes <span className="text-blue-600">Mágicos</span>
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {esRegistro ? "Crea tu cuenta" : "Bienvenido de vuelta"}
          </h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">
            {esRegistro 
              ? "Completa tus datos para empezar a viajar." 
              : "Ingresa a tu cuenta para gestionar tus reservas."}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold mb-6 text-center border border-red-100">
            {error}
          </div>
        )}

        <button 
          onClick={manejarGoogle}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 text-slate-700 font-bold py-3.5 rounded-xl hover:bg-slate-50 transition-all mb-6"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continuar con Google
        </button>

        <div className="relative flex items-center justify-center mb-6">
          <div className="border-t border-slate-200 w-full"></div>
          <span className="bg-white px-4 text-xs font-bold text-slate-400 uppercase tracking-widest absolute">o con tu correo</span>
        </div>

        <form onSubmit={manejarSubmit} className="space-y-4">
          
          {/* CAMPOS EXTRA SOLO PARA REGISTRO */}
          {esRegistro && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* NOMBRE */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Nombre(s)</label>
                <input 
                  type="text" 
                  required 
                  value={nombre} 
                  onChange={(e) => manejarNombre(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3.5 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium outline-none" 
                  placeholder="Juan" 
                />
              </div>

              {/* APELLIDO PATERNO */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Primer Apellido</label>
                <input 
                  type="text" 
                  required 
                  value={primerApellido} 
                  onChange={(e) => manejarPrimerApellido(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3.5 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium outline-none" 
                  placeholder="Pérez" 
                />
              </div>

              {/* APELLIDO MATERNO */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Segundo Apellido</label>
                <input 
                  type="text" 
                  required 
                  value={segundoApellido} 
                  onChange={(e) => manejarSegundoApellido(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3.5 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium outline-none" 
                  placeholder="López" 
                />
              </div>
            </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Teléfono (10 dígitos)</label>
            <input 
              type="tel" 
              required 
              value={telefono} 
              onChange={(e) => manejarTelefono(e.target.value)} 
              maxLength={10}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3.5 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium outline-none" 
              placeholder="7221234567" 
            />
          </div>
            </>
          )}

          {/* CAMPOS DE CORREO Y CONTRASEÑA (SIEMPRE VISIBLES) */}
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Correo Electrónico</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3.5 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium outline-none" placeholder="tu@correo.com" />
          </div>

          <div className={`grid ${esRegistro ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-4`}>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Contraseña</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3.5 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium outline-none" placeholder="••••••••" />
            </div>
            
            {esRegistro && (
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Confirmar Contraseña</label>
                <input type="password" required value={confirmarPassword} onChange={(e) => setConfirmarPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3.5 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium outline-none" placeholder="••••••••" />
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={cargando}
            className="w-full bg-slate-900 text-white font-black uppercase tracking-widest text-sm py-4 rounded-xl shadow-xl hover:bg-blue-600 hover:shadow-blue-600/30 transition-all active:scale-[0.98] mt-6 disabled:opacity-50"
          >
            {cargando ? "Procesando..." : (esRegistro ? "Crear Cuenta" : "Iniciar Sesión")}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 font-medium text-sm">
            {esRegistro ? "¿Ya tienes una cuenta?" : "¿No tienes cuenta?"}{" "}
            <button 
              type="button"
              onClick={() => {
                setEsRegistro(!esRegistro);
                setError("");
              }}
              className="text-blue-600 font-bold hover:text-blue-800 transition-colors"
            >
              {esRegistro ? "Inicia sesión aquí" : "Regístrate aquí"}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}