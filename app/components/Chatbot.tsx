"use client";

import { useState, useRef, useEffect } from "react";

export default function Chatbot() {
  const [estaAbierto, setEstaAbierto] = useState(false);
  const [miTexto, setMiTexto] = useState("");
  const [cargando, setCargando] = useState(false);
  
  const [mensajes, setMensajes] = useState<{role: string, content: string}[]>([]);
  const finalDelChatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    finalDelChatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!miTexto.trim() || cargando) return;

    const textoAEnviar = miTexto;
    setMiTexto(""); 
    
    const historialActualizado = [...mensajes, { role: "user", content: textoAEnviar }];
    setMensajes(historialActualizado);
    setCargando(true);

    try {
      const respuesta = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: historialActualizado }),
      });

      if (!respuesta.ok) throw new Error("Falla en el servidor");

      const data = await respuesta.json();
      setMensajes(prev => [...prev, { role: "assistant", content: data.text }]);

    } catch (err) {
      console.error("Error al enviar:", err);
      setMensajes(prev => [...prev, { role: "assistant", content: "Lo siento, hubo un error de conexión con el servidor. Por favor, intenta de nuevo." }]);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Botón Flotante Moderno y Pulido (Slate-900) */}
      <button
        onClick={() => setEstaAbierto(!estaAbierto)}
        className="group relative w-16 h-16 bg-[#0f172a] rounded-full flex items-center justify-center text-white shadow-[0_10px_40px_rgba(15,23,42,0.3)] hover:shadow-[0_15px_50px_rgba(15,23,42,0.4)] hover:-translate-y-1.5 active:scale-95 transition-all duration-300 ml-auto border border-white/10"
      >
        {estaAbierto ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Ventana del Chat - Diseño VIP Rediseñado */}
      {estaAbierto && (
        <div className="absolute bottom-20 right-0 w-[380px] h-[580px] bg-white border border-gray-100 rounded-[2rem] shadow-[0_20px_70px_-10px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden">
          
          {/* Header Elegante (Slate-900 con Degradado Sutil) */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 px-6 py-5 flex justify-between items-center border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center border border-white/10 relative">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse"></div>
              </div>
              <div>
                <h3 className="font-serif font-semibold text-white text-base tracking-wide">
                  Guía Mágica de Viajes
                </h3>
                <p className="text-xs text-slate-400">Su asistente virtual está en línea</p>
              </div>
            </div>
            <button 
              onClick={() => setEstaAbierto(false)} 
              className="text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-full"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Área de Mensajes (Diseño de Burbujas "Lindas") */}
          <div className="flex-1 overflow-y-auto p-6 space-y-7 text-sm bg-slate-50 custom-scrollbar">
            {mensajes.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3 mt-4">
                <div className="w-16 h-16 bg-white border border-gray-100 rounded-full flex items-center justify-center shadow-inner mb-2">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-slate-800 font-serif font-bold text-xl">Viajes Mágicos</p>
                <p className="text-slate-600 px-6 leading-relaxed">
                  Descubramos juntos el próximo Pueblo Mágico de sus sueños. ¿En qué puedo asistirles hoy?
                </p>
              </div>
            )}
            
            {mensajes.map((m, index) => (
              <div key={index} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div 
                  className={`max-w-[85%] p-5 leading-relaxed relative ${
                    m.role === "user" 
                      ? "bg-[#0f172a] text-slate-50 rounded-[1.5rem] rounded-br-sm shadow-lg text-slate-100" 
                      : "bg-gradient-to-br from-white to-slate-50 text-slate-800 rounded-[1.5rem] rounded-bl-sm shadow-md border border-slate-100 text-slate-700"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            
            {/* Animación de "Escribiendo" Estilo VIP */}
            {cargando && (
              <div className="flex justify-start">
                <div className="bg-white rounded-[1.5rem] rounded-bl-sm border border-slate-100 p-5 flex gap-2 items-center shadow-md">
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={finalDelChatRef} />
          </div>

          {/* Área de Input - Integrada y Limpia */}
          <form onSubmit={enviar} className="p-5 bg-white border-t border-gray-100 flex gap-2 relative">
            <input
              className="flex-1 bg-slate-50 border border-slate-200 px-6 py-3.5 text-slate-800 rounded-full outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all placeholder:text-slate-400 text-sm leading-normal pr-14"
              value={miTexto}
              onChange={(e) => setMiTexto(e.target.value)}
              placeholder="Escriba su mensaje..."
              disabled={cargando}
            />
            <button 
              type="submit" 
              disabled={cargando || !miTexto.trim()}
              className="absolute right-7 top-7 bg-[#0f172a] text-white w-11 h-11 flex items-center justify-center rounded-full hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-[#0f172a] transition-all shadow-md"
            >
              {cargando ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}