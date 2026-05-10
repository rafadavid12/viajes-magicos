import React from 'react';

export const metadata = {
  title: 'Términos y Condiciones | Viajes Mágicos',
  description: 'Términos de servicio, políticas de cancelación y uso del portal.',
};

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] py-24 px-6 sm:px-12 font-sans selection:bg-slate-900 selection:text-white">
      <main className="max-w-4xl mx-auto bg-white p-10 sm:p-16 border border-slate-200 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        
        <header className="mb-12 border-b border-slate-100 pb-8">
          <h1 className="text-4xl font-serif font-bold text-slate-900 tracking-tight mb-4">Términos y Condiciones de Servicio</h1>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Vigencia a partir de: 21 de Abril de 2026</p>
        </header>

        <article className="space-y-10 text-slate-600 leading-relaxed">
          <section>
            <p>
              El presente documento establece los Términos y Condiciones bajo los cuales los usuarios podrán acceder y utilizar los servicios ofrecidos por <strong>Viajes Mágicos by DevSquad</strong>. Al confirmar una reserva a través de nuestro sitio web, usted declara haber leído, comprendido y aceptado en su totalidad las siguientes cláusulas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">1. Naturaleza del Servicio</h2>
            <p>
              Viajes Mágicos opera como una agencia de viajes digital especializada en experiencias dentro del Estado de México. Actuamos como intermediarios entre el usuario (el turista) y los proveedores finales de servicios (hoteles, guías locales, empresas de transporte y operadores turísticos).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">2. Uso de la Inteligencia Artificial (Guía Mágico AI)</h2>
            <p className="mb-3">
              Nuestra plataforma integra un Asistente Virtual impulsado por Inteligencia Artificial para facilitar la búsqueda de destinos. El usuario comprende y acepta que:
            </p>
            <ul className="list-disc pl-6 space-y-2 marker:text-slate-400">
              <li>El "Guía Mágico AI" provee recomendaciones automatizadas basadas en descripciones generales.</li>
              <li>La IA puede, ocasionalmente, generar respuestas inexactas respecto a horarios, disponibilidad en tiempo real o precios. <strong>La única información oficial y vinculante es la que aparece en el Checkout al momento de realizar el pago.</strong></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">3. Políticas de Pago, Precios e Impuestos</h2>
            <p className="mb-3">
              Todos los precios mostrados en el portal están expresados en Moneda Nacional (Pesos Mexicanos - MXN) e incluyen el Impuesto al Valor Agregado (IVA).
            </p>
            <ul className="list-disc pl-6 space-y-2 marker:text-slate-400">
              <li>Una reserva no se considerará confirmada hasta que el pago haya sido acreditado en su totalidad al 100%.</li>
              <li>Los comprobantes de pago generados en nuestro portal son válidos para canje físico el día del viaje.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">4. Políticas de Cancelación y Reembolso</h2>
            <p className="mb-3">
              En cumplimiento con la Ley Federal de Protección al Consumidor (PROFECO), establecemos los siguientes lineamientos para cancelaciones:
            </p>
            <ul className="list-disc pl-6 space-y-2 marker:text-slate-400">
              <li><strong>Cancelación con más de 15 días de anticipación:</strong> Se otorgará un reembolso del 80% del valor total, reteniendo un 20% por concepto de gastos administrativos.</li>
              <li><strong>Cancelación entre 7 y 14 días de anticipación:</strong> Se otorgará un reembolso del 50%.</li>
              <li><strong>Cancelación con menos de 7 días o No-Show (no presentarse):</strong> No existirá reembolso bajo ninguna circunstancia.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">5. Responsabilidad y Exenciones</h2>
            <p>
              Viajes Mágicos no será responsable por daños, lesiones, retrasos, pérdida de equipaje o eventos de fuerza mayor (fenómenos climáticos, huelgas, bloqueos carreteros) que afecten la prestación del servicio por parte de los operadores finales. Se recomienda ampliamente a los usuarios adquirir un seguro de viaje independiente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">6. Jurisdicción y Competencia</h2>
            <p>
              Para la interpretación y cumplimiento de los presentes términos, las partes se someten a la jurisdicción y competencia de los tribunales de la ciudad de Toluca, Estado de México, renunciando expresamente a cualquier otro fuero que pudiera corresponderles por razón de sus domicilios presentes o futuros.
            </p>
          </section>
        </article>
      </main>
    </div>
  );
}