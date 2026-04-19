"use client";
import Link from "next/link";
import Image from "next/image"; // <--- AGREGA ESTA LÍNEA

export default function Nosotros() {
  const valores = [
    {
      titulo: "Innovación Tecnológica",
      desc: "Implementamos herramientas digitales avanzadas para garantizar reservas fluidas y seguras.",
      icon: "💻"
    },
    {
      titulo: "Inclusividad",
      desc: "Diseñamos experiencias para todos, con opciones Pet Friendly y tarifas para todas las edades.",
      icon: "🐾"
    },
    {
      titulo: "Compromiso",
      desc: "Tu seguridad es nuestra prioridad. Garantizamos logística precisa y pagos protegidos.",
      icon: "🛡️"
    },
    {
      titulo: "Accesibilidad",
      desc: "Promovemos el turismo regional haciendo que viajar sea sencillo y esté al alcance de un clic.",
      icon: "📍"
    }
  ];

  return (
    <main className="min-h-screen bg-slate-50 pt-32 pb-20 px-6 relative overflow-hidden">
      {/* Burbujas de fondo para mantener el estilo del login */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* SECCIÓN: HERO / LOGO */}
        <div className="text-center mb-20">
          <div className="inline-block mb-6">
            {/* Usamos el componente optimizado de Next.js */}
            <Image 
              src="/logo-viajes.png" 
              alt="Logo Viajes Mágicos" 
              width={400} 
              height={200} 
              className="h-32 md:h-48 w-auto mx-auto object-contain drop-shadow-xl hover:scale-105 transition-transform duration-300" 
            />
          </div>
          <p className="text-xl font-bold text-slate-500 uppercase tracking-[0.4em] italic mt-4">
            "Rincones mágicos, momentos inolvidables"
          </p>
        </div>

        {/* SECCIÓN: MISIÓN Y VISIÓN (TARJETAS CRISTAL) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <section className="bg-white/70 backdrop-blur-xl border border-white p-10 rounded-[3rem] shadow-xl shadow-blue-900/5">
            <h2 className="text-xs font-black text-blue-600 uppercase tracking-[0.3em] mb-4">Nuestra Misión</h2>
            <p className="text-slate-700 text-lg font-medium leading-relaxed">
              Facilitar el acceso a la riqueza cultural y natural de los Pueblos Mágicos mediante una plataforma digital intuitiva, 
              ofreciendo experiencias turísticas organizadas, seguras y adaptadas a las necesidades de cada tipo de viajero.
            </p>
          </section>

          <section className="bg-white/70 backdrop-blur-xl border border-white p-10 rounded-[3rem] shadow-xl shadow-emerald-900/5">
            <h2 className="text-xs font-black text-emerald-600 uppercase tracking-[0.3em] mb-4">Nuestra Visión</h2>
            <p className="text-slate-700 text-lg font-medium leading-relaxed">
              Posicionarnos como la plataforma digital líder en turismo regional, transformando la forma en que los usuarios 
              descubren y reservan en el Estado de México, destacando por nuestro enfoque tecnológico e inclusivo.
            </p>
          </section>
        </div>

        {/* SECCIÓN: VALORES */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Nuestros Valores</h2>
          <div className="h-1.5 w-20 bg-blue-600 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {valores.map((v) => (
            <div key={v.titulo} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group hover:-translate-y-2">
              <div className="text-4xl mb-4 group-hover:scale-125 transition-transform inline-block">{v.icon}</div>
              <h3 className="font-black text-slate-900 uppercase tracking-wider text-sm mb-3">{v.titulo}</h3>
              <p className="text-slate-500 text-xs font-medium leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA FINAL */}
        <div className="mt-20 text-center">
          <Link href="/" className="bg-slate-900 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-blue-600 transition-all active:scale-95">
            Comenzar mi aventura ahora
          </Link>
        </div>
      </div>
    </main>
  );
}