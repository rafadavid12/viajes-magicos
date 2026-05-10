import React from 'react';

export const metadata = {
  title: 'Aviso de Privacidad | Viajes Mágicos',
  description: 'Aviso de privacidad y protección de datos personales de Viajes Mágicos.',
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] py-24 px-6 sm:px-12 font-sans selection:bg-slate-900 selection:text-white">
      <main className="max-w-4xl mx-auto bg-white p-10 sm:p-16 border border-slate-200 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        
        <header className="mb-12 border-b border-slate-100 pb-8">
          <h1 className="text-4xl font-serif font-bold text-slate-900 tracking-tight mb-4">Aviso de Privacidad</h1>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Última actualización: 21 de Abril de 2026</p>
        </header>

        <article className="space-y-10 text-slate-600 leading-relaxed">
          <section>
            <p>
              En cumplimiento con lo establecido por la <strong>Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)</strong>, su Reglamento y los Lineamientos del Aviso de Privacidad, <strong>Viajes Mágicos by DevSquad</strong> (en adelante, "La Agencia"), con sede en el Estado de México, emite el presente Aviso de Privacidad.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">I. Datos Personales Recabados</h2>
            <p className="mb-3">Para llevar a cabo las finalidades descritas en el presente aviso, recabaremos las siguientes categorías de datos personales:</p>
            <ul className="list-disc pl-6 space-y-2 marker:text-slate-400">
              <li><strong>Datos de identificación:</strong> Nombre completo, identificación oficial, fecha de nacimiento.</li>
              <li><strong>Datos de contacto:</strong> Correo electrónico, número de teléfono fijo y/o celular, domicilio.</li>
              <li><strong>Datos patrimoniales y/o financieros:</strong> Información de tarjetas bancarias exclusivamente para el procesamiento de pagos de reservas (gestionados a través de pasarelas de pago seguras de terceros).</li>
              <li><strong>Datos digitales:</strong> Dirección IP, tipo de navegador, historial de navegación dentro de nuestro portal e interacciones con el Asistente de Inteligencia Artificial (Guía Mágico AI).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">II. Finalidades del Tratamiento</h2>
            <p className="mb-3">Los datos personales que recabamos de usted serán utilizados para las siguientes <strong>finalidades primarias</strong>, las cuales son necesarias para el servicio que solicita:</p>
            <ul className="list-disc pl-6 space-y-2 marker:text-slate-400 mb-4">
              <li>Cotización, gestión, procesamiento y confirmación de reservas de paquetes turísticos en los Pueblos Mágicos del Estado de México.</li>
              <li>Emisión de comprobantes de pago, tickets e itinerarios digitales.</li>
              <li>Comunicación de incidentes, cambios de horario o cancelaciones referentes a su viaje.</li>
            </ul>
            <p className="mb-3">De manera adicional, utilizaremos su información para las siguientes <strong>finalidades secundarias</strong>:</p>
            <ul className="list-disc pl-6 space-y-2 marker:text-slate-400">
              <li>Envío de promociones, boletines informativos y ofertas turísticas.</li>
              <li>Mejora continua del algoritmo de nuestro Asistente de Inteligencia Artificial mediante el análisis de consultas recurrentes (de forma anonimizada).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">III. Uso de Cookies y Web Beacons</h2>
            <p>
              Le informamos que en nuestra página de internet utilizamos cookies, web beacons y otras tecnologías a través de las cuales es posible monitorear su comportamiento como usuario de internet, con el objetivo de brindarle un mejor servicio y experiencia al navegar en nuestra página. Usted puede deshabilitar estas tecnologías en la configuración de su navegador web.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">IV. Derechos ARCO</h2>
            <p>
              Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los utilizamos y las condiciones del uso que les damos (Acceso). Es su derecho solicitar la corrección de su información (Rectificación); que la eliminemos de nuestros registros (Cancelación); así como oponerse al uso de sus datos para fines específicos (Oposición).
            </p>
            <p className="mt-4">
              Para el ejercicio de cualquiera de los derechos ARCO, usted deberá presentar la solicitud respectiva a través del correo electrónico: <a href="mailto:legal@viajesmagicos.com" className="text-slate-900 font-semibold hover:underline decoration-2 decoration-slate-300 underline-offset-4">legal@viajesmagicos.com</a>.
            </p>
          </section>
        </article>
      </main>
    </div>
  );
}