export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* INFO EMPRESA */}
          <div className="col-span-1 md:col-span-2">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-2">DevSquad Software</p>
            <h3 className="text-2xl font-black text-slate-800 mb-6">Viajes Mágicos</h3>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
              Somos una agencia boutique dedicada a curar las experiencias más auténticas en el Estado de México. 
              Propiedad de DevSquad, enfocada en digitalizar el turismo local.
            </p>
          </div>

          {/* ENLACES RÁPIDOS */}
          <div>
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Explora</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-500">
              <li><Link href="/#catalogo" className="hover:text-blue-600 transition">Destinos Populares</Link></li>
              <li><Link href="/paquetes" className="hover:text-blue-600 transition">Paquetes Todo Incluido</Link></li>
              <li><Link href="/nosotros" className="hover:text-blue-600 transition">¿Quiénes Somos?</Link></li>
            </ul>
          </div>

          {/* CONTACTO */}
          <div>
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Contacto</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-500">
              <li>📍 Toluca, Estado de México</li>
              <li>📧 soporte@devsquad.com</li>
              <li>📞 +52 (722) 123 4567</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            © 2026 Viajes Mágicos por DevSquad. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-slate-400">
            {/* Aquí irían tus iconos de redes sociales */}
            <span className="text-xs font-black cursor-pointer hover:text-blue-600 uppercase tracking-widest">Instagram</span>
            <span className="text-xs font-black cursor-pointer hover:text-blue-600 uppercase tracking-widest">Facebook</span>
          </div>
        </div>
      </div>
    </footer>
  );
}