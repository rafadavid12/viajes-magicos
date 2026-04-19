import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="relative bg-slate-950 pt-24 pb-10 overflow-hidden mt-20 border-t border-slate-900">
      
      {/* 🌟 EFECTOS DE LUZ EN EL FONDO */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
          
          {/* COLUMNA 1: INFO EMPRESA Y LOGO */}
          <div className="md:col-span-12 lg:col-span-5">
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-4">Respaldado por DevSquad</p>
            
            {/* MEJORA 1: Logo libre, sin caja de fondo, y un poco más grande */}
            <Link href="/" className="inline-block mb-6 hover:scale-105 transition-transform origin-left">
              <Image 
                src="/logo-viajes.png" 
                alt="Logo Viajes Mágicos" 
                width={200} 
                height={96} 
                className="h-24 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" 
              />
            </Link>
            
            {/* MEJORA 2: La preguntita para introducir el texto */}
            <h4 className="text-lg font-black text-white mb-2 tracking-tight">
              ¿Qué nos hace mágicos?
            </h4>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm mb-8 font-medium">
              Somos una agencia boutique dedicada a curar las experiencias más auténticas en el Estado de México. 
              Enfocada en digitalizar y facilitar el turismo local con tecnología de punta.
            </p>
          </div>

          {/* COLUMNA 2: ENLACES RÁPIDOS */}
          <div className="md:col-span-6 lg:col-span-3">
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-8">Explora</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-400">
              <li>
                <Link href="/#catalogo" className="hover:text-blue-400 hover:translate-x-2 inline-block transition-all">
                  Destinos Populares
                </Link>
              </li>
              <li>
                <Link href="/paquetes" className="hover:text-blue-400 hover:translate-x-2 inline-block transition-all">
                  Paquetes Todo Incluido
                </Link>
              </li>
              <li>
                {/* MEJORA 3: Cambio de "¿Quiénes Somos?" por "Nuestra Historia" */}
                <Link href="/nosotros" className="hover:text-blue-400 hover:translate-x-2 inline-block transition-all">
                  Nuestra Historia
                </Link>
              </li>
              <li className="pt-2">
                <Link href="/mis-viajes" className="hover:text-emerald-400 hover:translate-x-2 inline-block transition-all text-emerald-500">
                  Ver mis reservas →
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMNA 3: CONTACTO Y NEWSLETTER */}
          <div className="md:col-span-6 lg:col-span-4">
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-8">Contacto Directo</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-400 mb-8">
              <li className="flex items-center gap-3"><span className="opacity-80">📍</span> Toluca, Estado de México</li>
              <li className="flex items-center gap-3"><span className="opacity-80">📧</span> soporte@devsquad.com</li>
              <li className="flex items-center gap-3"><span className="opacity-80">📞</span> +52 (722) 123 4567</li>
            </ul>

            {/* MEJORA EXTRA: Sombra y cristal en el buscador */}
            <div className="bg-slate-900/50 backdrop-blur-sm p-2 rounded-2xl border border-slate-800 flex items-center shadow-inner">
              <input 
                type="email" 
                placeholder="Únete al boletín..." 
                className="bg-transparent text-sm text-white px-4 outline-none w-full placeholder-slate-500" 
              />
              <button className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-5 py-3 rounded-xl hover:bg-blue-500 transition-colors shrink-0 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                Suscribir
              </button>
            </div>
          </div>
        </div>

        {/* BARRA INFERIOR */}
        <div className="pt-8 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center md:text-left">
            © {new Date().getFullYear()} Viajes Mágicos por DevSquad. Todos los derechos reservados.
          </p>
          
          <div className="flex gap-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <Link href="#" className="hover:text-white transition-colors">Privacidad</Link>
            <Link href="#" className="hover:text-white transition-colors">Términos</Link>
            <span className="hover:text-blue-500 cursor-pointer transition-colors">Instagram</span>
            <span className="hover:text-blue-500 cursor-pointer transition-colors">Facebook</span>
          </div>
        </div>
      </div>
    </footer>
  );
}