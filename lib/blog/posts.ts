export type Section = {
  h2: string
  paragraphs?: string[]
  list?: { intro?: string; items: string[] }
  highlight?: string
}

export type Post = {
  slug: string
  title: string
  description: string
  keywords: string[]
  date: string
  category: string
  readingTime: number
  emoji: string
  intro: string
  sections: Section[]
  conclusion: string
  ctaText: string
  ctaHref: string
}

export const posts: Post[] = [
  {
    slug: 'como-conseguir-mas-resenas-en-google',
    title: 'Cómo conseguir más reseñas en Google para tu negocio',
    description: 'Guía práctica para aumentar las reseñas en Google de tu local o negocio en Argentina. Estrategias que funcionan y cómo automatizar el proceso.',
    keywords: ['como conseguir más reseñas en google', 'aumentar reseñas google', 'más reseñas google negocio', 'reseñas google argentina'],
    date: '2025-07-15',
    category: 'Reseñas Google',
    readingTime: 6,
    emoji: '⭐',
    intro: 'Las reseñas en Google son el nuevo boca a boca. Un local con 50 reseñas positivas genera más confianza que uno con solo 5, aunque el segundo sea mejor. El problema es que conseguirlas cuesta trabajo: los clientes satisfechos rara vez las dejan solas, mientras que los que tuvieron una mala experiencia no necesitan que nadie se los pida. En esta guía te contamos cómo revertir esa ecuación.',
    sections: [
      {
        h2: 'Por qué las reseñas en Google son tan importantes',
        paragraphs: [
          'Cuando alguien busca un restaurante, una peluquería o una clínica en Google Maps, lo primero que ve es la cantidad de estrellas y el número de reseñas. Un negocio con 4.7 estrellas y 80 reseñas aplasta a uno con 4.9 pero solo 3 opiniones. La cantidad le da confianza al consumidor.',
          'Además, Google usa las reseñas como uno de los factores para decidir qué negocios mostrar primero en los resultados locales. Más reseñas positivas = mejor posicionamiento en Maps = más clientes potenciales.',
        ],
      },
      {
        h2: 'La regla del 1%: por qué pocos clientes dejan reseñas',
        paragraphs: [
          'Se estima que solo entre el 1% y el 5% de los clientes satisfechos dejan una reseña de manera espontánea. El resto se va contento pero no hace nada. En cambio, un cliente que tuvo una mala experiencia tiene entre 2 y 3 veces más probabilidades de dejar una reseña negativa sin que nadie se lo pida.',
          'Esto crea un sesgo sistemático que perjudica a los negocios que atienden bien pero no piden activamente la opinión de sus clientes.',
        ],
        highlight: 'Solo el 1-5% de los clientes satisfechos dejan reseñas espontáneamente. Los insatisfechos lo hacen 2-3 veces más seguido.',
      },
      {
        h2: 'El momento perfecto para pedir la reseña',
        paragraphs: [
          'El timing lo es todo. El mejor momento para pedir una reseña es cuando el cliente acaba de tener una experiencia positiva: justo después de que terminó de comer, al momento de la despedida, cuando recoge un pedido. En ese instante la satisfacción está en su punto más alto.',
          'Lo que no funciona es mandar un email días después o pedir la reseña al comienzo de la visita. El cliente tiene que haber vivido la experiencia primero.',
        ],
      },
      {
        h2: 'Cómo pedir la reseña sin que suene forzado',
        paragraphs: [
          'La forma más efectiva es simple y directa: "¿Te atendimos bien? Si tenés un momento, nos ayudaría mucho dejar una reseña en Google." Sin rodeos, sin ofrecer descuentos a cambio (Google lo prohíbe y puede penalizarte), sin presionar.',
          'El cartel o tarjeta con QR hace todo el trabajo: el cliente apoya el celular, en tres toques ya está en la página de Google para dejar su opinión. No tiene que buscar el local, no tiene que escribir la URL. La fricción cero es clave.',
        ],
      },
      {
        h2: 'Por qué el filtro de experiencia negativa cambia todo',
        paragraphs: [
          'El problema de pedir reseñas a todos por igual es que también le estás pidiendo a los que estuvieron disconformes. Un cliente que esperó demasiado, que tuvo un problema con el pedido o que simplemente tuvo un mal día puede aprovechar ese momento para descargar su frustración en Google.',
          'La solución es filtrar antes: preguntarle primero si la experiencia fue buena. Si lo fue, redirigirlo a Google. Si no lo fue, darle un canal privado para que te lo cuente a vos en lugar de publicarlo. Así protegés tu reputación sin dejar de escuchar a tus clientes.',
        ],
      },
      {
        h2: 'Herramientas para automatizar el proceso',
        paragraphs: [
          'Hacer todo esto manualmente es difícil de sostener en el tiempo. Un mozo ocupado no siempre va a acordarse de pedir la reseña, y aunque lo haga, no va a tener el mismo resultado que un sistema automatizado.',
          'Los carteles NFC y QR que se conectan a un sistema de gestión de reseñas son la solución más práctica: el cliente escanea, califica su experiencia, y según si fue positiva o negativa el sistema lo dirige a Google o te envía el feedback por privado.',
        ],
      },
    ],
    conclusion: 'Conseguir más reseñas en Google no es magia ni suerte: es un proceso sistemático. El cliente satisfecho existe, solo hay que facilitarle el camino y pedírselo en el momento justo. Con las herramientas correctas, podés triplicar tus reseñas en cuestión de semanas sin cambiar nada de tu atención.',
    ctaText: 'Probá Calificar gratis',
    ctaHref: '/r/demo',
  },

  {
    slug: 'que-es-un-qr-dinamico-y-para-que-sirve',
    title: 'Qué es un QR dinámico y para qué sirve',
    description: 'Todo lo que tenés que saber sobre los códigos QR dinámicos: cómo funcionan, la diferencia con los QR estáticos y para qué los usan los negocios.',
    keywords: ['qr dinámico', 'qr dinámico gratis', 'para qué sirve un qr dinámico', 'código qr dinámico', 'qr dinámico argentina'],
    date: '2025-07-22',
    category: 'QR Dinámicos',
    readingTime: 5,
    emoji: '🔲',
    intro: 'Si alguna vez imprimiste un código QR y después tuviste que tirarlo porque la URL cambió, entonces entendés exactamente el problema que resuelven los QR dinámicos. A diferencia de los QR comunes, los dinámicos te permiten cambiar el destino cuando quieras sin necesidad de reimprimir nada.',
    sections: [
      {
        h2: 'Cómo funciona un QR dinámico',
        paragraphs: [
          'Cuando escaneás un QR estático, el código lleva grabada la URL de destino. Si esa URL cambia, el QR queda inservible. Un QR dinámico, en cambio, siempre apunta a la misma URL intermediaria (del tipo calificar.com.ar/g/ABC123), y esa URL intermediaria es la que redirige al destino real.',
          'Esto significa que podés cambiar a dónde va el QR desde un panel de control, en cualquier momento, sin tocar el QR impreso. El código físico nunca cambia, solo cambia el destino en la nube.',
        ],
      },
      {
        h2: 'Diferencia entre QR estático y QR dinámico',
        paragraphs: [
          'El QR estático es como un tatuaje: una vez impreso, no cambia. El QR dinámico es como un cartel con texto intercambiable: el soporte físico es permanente, pero el contenido podés actualizarlo.',
        ],
        list: {
          intro: 'Principales diferencias:',
          items: [
            'QR estático: URL fija, no editables, no tienen estadísticas, son ideales solo para contenido que nunca cambia.',
            'QR dinámico: URL editable, con estadísticas de scans, ideales para negocios que actualizan su contenido.',
            'Los QR dinámicos permiten saber cuántas personas escanearon, desde qué dispositivo y en qué horario.',
            'Si la URL de destino cambia, el QR dinámico sigue funcionando. El estático no.',
          ],
        },
      },
      {
        h2: 'Para qué los usan los negocios en Argentina',
        paragraphs: [
          'Los usos más comunes que vemos en negocios argentinos son el menú digital de restaurantes y bares (cuando actualizan precios o platos no tienen que reimprimir nada), las tarjetas de presentación con QR que lleva a Instagram o WhatsApp, los carteles de locales comerciales con horarios o promociones, y los sistemas de reseñas donde el QR lleva al cliente al perfil de Google.',
        ],
        list: {
          intro: 'Casos de uso frecuentes:',
          items: [
            'Menú digital: actualizás precios y platos desde el celular sin reimprimir.',
            'Redes sociales: el QR lleva siempre a tu perfil actualizado.',
            'WhatsApp de pedidos: si cambiás de número, actualizás el QR.',
            'Reseñas de Google: el cliente escanea y llega a tu perfil para calificarte.',
            'Eventos: el mismo QR puede apuntar a distintos links según la fecha.',
          ],
        },
      },
      {
        h2: 'Cuánto duran y si expiran',
        paragraphs: [
          'Un QR dinámico dura lo que dure el servicio que lo gestiona. Los servicios gratuitos como el de Calificar no tienen vencimiento: el QR que creás hoy puede seguir funcionando años después.',
          'Lo único que hace que deje de funcionar es que el servicio cierre o que vos mismo lo desactives. Por eso es importante elegir un proveedor confiable.',
        ],
      },
      {
        h2: 'Estadísticas: la ventaja que no tiene el QR estático',
        paragraphs: [
          'Cada vez que alguien escanea tu QR dinámico, el sistema registra ese evento. Podés ver el total de scans, la evolución día a día y así saber si tu QR está siendo usado o no.',
          'Esto es especialmente útil si usás el QR en distintos soportes (un cartel en la vidriera, uno en la mesa, uno en la bolsa de delivery) y querés saber cuál genera más interacción.',
        ],
        highlight: 'Los QR dinámicos te dan datos: cuántos scans, cuándo, y cómo evoluciona con el tiempo.',
      },
      {
        h2: 'Cómo crear un QR dinámico gratis',
        paragraphs: [
          'Crear un QR dinámico gratis en Calificar toma menos de un minuto: te registrás, pegás la URL de destino, y descargás el QR en PNG listo para imprimir. Podés cambiar la URL de destino cuando quieras desde el panel.',
          'El plan gratuito incluye hasta 30 QRs dinámicos, estadísticas de scans y descarga en alta resolución.',
        ],
      },
    ],
    conclusion: 'Si tenés un negocio y estás usando QRs estáticos, estás perdiendo flexibilidad y datos. Un QR dinámico cuesta lo mismo imprimirlo, pero te da control total sobre el destino y te dice cuánta gente lo está usando. En Argentina, todavía son pocos los negocios que los usan bien — es una ventaja que podés aprovechar hoy.',
    ctaText: 'Crear mi QR dinámico gratis',
    ctaHref: '/qr',
  },

  {
    slug: 'como-responder-resenas-negativas-en-google',
    title: 'Cómo responder reseñas negativas en Google (con ejemplos)',
    description: 'Guía práctica para responder reseñas negativas en Google sin perder clientes. Ejemplos reales de respuestas que funcionan y errores que hay que evitar.',
    keywords: ['como responder reseñas negativas google', 'responder reseña negativa', 'reseñas negativas google', 'gestionar reseñas negativas'],
    date: '2025-07-29',
    category: 'Reseñas Google',
    readingTime: 7,
    emoji: '💬',
    intro: 'Una reseña negativa en Google no arruina tu reputación. Una mala respuesta, sí. Cómo respondés a las críticas dice mucho más de tu negocio que la crítica misma. Los clientes potenciales que leen reseñas no solo leen las estrellas: leen cómo respondió el dueño.',
    sections: [
      {
        h2: 'Por qué responder las reseñas negativas importa',
        paragraphs: [
          'El 97% de los consumidores que leen reseñas también leen las respuestas de los dueños. Una respuesta bien redactada convierte una reseña negativa en una oportunidad de mostrar que te importa la experiencia del cliente.',
          'Además, Google toma en cuenta la actividad en el perfil del negocio. Responder reseñas (positivas y negativas) es una señal de que el negocio está activo y comprometido, lo que puede mejorar tu posicionamiento en Maps.',
        ],
        highlight: 'El 97% de los consumidores leen las respuestas del dueño. Tu respuesta habla más que la reseña.',
      },
      {
        h2: 'Lo que nunca hay que hacer al responder',
        paragraphs: [
          'Estos son los errores más comunes que destruyen la reputación de un negocio más que la reseña original:',
        ],
        list: {
          items: [
            'Ponerse a la defensiva o atacar al cliente: cualquier persona que lea la discusión va a quedar del lado del cliente.',
            'Negar los hechos cuando hay evidencia: si el cliente tiene razón aunque sea en parte, reconocerlo.',
            'Respuestas genéricas del tipo "gracias por tu opinión": son peores que no responder.',
            'Usar mayúsculas o signos de exclamación: da sensación de agresividad.',
            'Pedir que cambien la reseña en la respuesta pública: es un error de tono.',
          ],
        },
      },
      {
        h2: 'La fórmula para responder correctamente',
        paragraphs: [
          'Una respuesta efectiva a una reseña negativa tiene cuatro partes: reconocer, disculparse, explicar (si hay contexto válido) y ofrecer una solución.',
          'No tiene que ser larga. Dos o tres oraciones bien escritas son más efectivas que un párrafo defensivo.',
        ],
        list: {
          intro: 'Estructura recomendada:',
          items: [
            '1. Agradecé el feedback, aunque sea negativo.',
            '2. Reconocé el problema sin excusas.',
            '3. Explicá brevemente qué pasó o qué vas a hacer diferente (solo si es genuino).',
            '4. Invitá al cliente a contactarte directamente para resolverlo.',
          ],
        },
      },
      {
        h2: 'Ejemplos de respuestas que funcionan',
        paragraphs: [
          '**Reseña negativa:** "Esperé 45 minutos por mi pedido y nadie me avisó nada. Pésimo servicio."',
          '**Respuesta correcta:** "Hola [nombre], lamentamos mucho lo que viviste. No debería haber pasado y no fue el estándar de atención que queremos dar. Si querés contactarnos directamente al [número/email] nos gustaría compensarte de alguna manera. Gracias por avisarnos."',
          '**Reseña negativa:** "El producto no era lo que esperaba, llegó diferente a la foto."',
          '**Respuesta correcta:** "Hola, entendemos tu frustración. Trabajamos para que la descripción sea lo más fiel posible y claramente en este caso no lo logramos. Si querés coordinar un cambio o devolución, escribinos a [contacto]. Queremos que quedes conforme."',
        ],
      },
      {
        h2: 'Reseñas falsas: qué hacer',
        paragraphs: [
          'Si una reseña es claramente falsa (de alguien que nunca fue cliente, de un competidor, con información inventada), podés reportarla a Google a través de Google Business Profile. El proceso lleva tiempo y no siempre la eliminan, pero vale la pena intentarlo.',
          'Mientras tanto, respondé igual con calma: "No encontramos registros de tu visita en nuestro sistema. Si hubo algún error de nuestra parte, nos gustaría saberlo. Podés escribirnos directamente para verificarlo." Esto le avisa a los demás lectores que la reseña es cuestionable.',
        ],
      },
      {
        h2: 'Cómo evitar que las malas reseñas lleguen a publicarse',
        paragraphs: [
          'La mejor defensa es actuar antes. Si tenés un sistema que intercepta la experiencia negativa antes de que el cliente llegue a Google — dándole un canal privado para quejarse —, podés resolver el problema sin que se haga público.',
          'Esto es exactamente lo que hace el sistema de Calificar: cuando un cliente tuvo una mala experiencia, en lugar de ir a Google, recibe un formulario para contarte el problema a vos directamente. Le das la posibilidad de resolver antes de que la reseña negativa exista.',
        ],
      },
    ],
    conclusion: 'Las reseñas negativas son inevitables. Lo que diferencia a un buen negocio de uno mediocre no es si las recibe, sino cómo las maneja. Una respuesta empática y profesional puede transformar a un cliente insatisfecho en un embajador, y convencer a futuros clientes de que tu negocio es confiable incluso cuando algo sale mal.',
    ctaText: 'Ver cómo Calificar protege tu reputación',
    ctaHref: '/r/demo',
  },

  {
    slug: 'qr-dinamico-vs-estatico-diferencias',
    title: 'QR dinámico vs QR estático: diferencias y cuál conviene para tu negocio',
    description: 'Comparativa completa entre QR dinámico y QR estático. Ventajas, desventajas y cuándo usar cada uno en tu negocio.',
    keywords: ['qr dinamico vs estatico', 'diferencia qr dinamico estatico', 'qr estatico', 'que qr usar para mi negocio'],
    date: '2025-08-05',
    category: 'QR Dinámicos',
    readingTime: 5,
    emoji: '📊',
    intro: 'No todos los códigos QR son iguales. Hay dos tipos principales —estático y dinámico— y elegir el incorrecto puede costarte tiempo y dinero. En este artículo te explicamos las diferencias reales para que puedas tomar la mejor decisión para tu negocio.',
    sections: [
      {
        h2: 'Cómo funciona cada uno',
        paragraphs: [
          'El QR estático tiene la URL de destino "grabada" dentro del propio código. Cuando lo escanean, el celular lee esa URL directamente y lleva al usuario ahí. No hay intermediario. Esto lo hace simple pero rígido.',
          'El QR dinámico, en cambio, tiene grabada una URL corta que lleva a un servidor (por ejemplo calificar.com.ar/g/ABC123). Ese servidor es el que redirige al destino real. Al cambiar el destino en el servidor, el QR impreso sigue siendo el mismo pero lleva a otro lado.',
        ],
      },
      {
        h2: 'Tabla comparativa: estático vs dinámico',
        list: {
          items: [
            'URL editable después de imprimir: ❌ QR estático | ✅ QR dinámico',
            'Estadísticas de scans: ❌ QR estático | ✅ QR dinámico',
            'Funciona sin internet del servidor: ✅ QR estático | ❌ QR dinámico',
            'Código más compacto/limpio visualmente: ✅ QR estático | ✅ QR dinámico (igual)',
            'Gratis: ✅ QR estático | ✅ QR dinámico (con Calificar)',
            'Ideal para contenido que nunca cambia: ✅ QR estático | puede usarse también',
            'Ideal para negocios que actualizan contenido: ❌ QR estático | ✅ QR dinámico',
          ],
        },
      },
      {
        h2: 'Cuándo usar un QR estático',
        paragraphs: [
          'El QR estático tiene sentido cuando el destino nunca va a cambiar y no necesitás datos. Por ejemplo, un QR con el link a un documento PDF definitivo, un QR para un evento puntual que no se va a repetir, o una URL que no tiene ninguna posibilidad de modificarse.',
          'También funciona bien cuando no tenés acceso a internet en el momento de escanear: el estático no depende de ningún servidor para redirigir.',
        ],
      },
      {
        h2: 'Cuándo usar un QR dinámico',
        paragraphs: [
          'Para casi todo lo demás. Si el QR va a estar impreso en un cartel, tarjeta, packaging, menú o cualquier soporte físico que dure más de unos meses, el dinámico es la opción correcta.',
        ],
        list: {
          intro: 'Usá QR dinámico si:',
          items: [
            'Tu menú de precios o servicios cambia con frecuencia.',
            'El número de WhatsApp o la URL de Instagram puede cambiar.',
            'Querés saber cuánta gente escanea el QR.',
            'El QR va en un producto que vas a vender en cantidad.',
            'Usás el mismo QR para distintos propósitos según la temporada.',
          ],
        },
      },
      {
        h2: 'El mito del costo',
        paragraphs: [
          'Mucha gente cree que los QR dinámicos son caros. Históricamente algunos servicios cobraban suscripciones mensuales. Hoy existen opciones 100% gratuitas como la de Calificar, que te da hasta 30 QRs dinámicos sin costo, con estadísticas y sin vencimiento.',
          'Imprimir un QR dinámico cuesta exactamente lo mismo que imprimir uno estático. La diferencia está en lo que podés hacer después.',
        ],
        highlight: 'Imprimir un QR dinámico cuesta lo mismo que uno estático. La diferencia es lo que podés hacer después.',
      },
    ],
    conclusion: 'Si tu negocio tiene cualquier tipo de soporte físico con un QR —cartel, menú, tarjeta, packaging— la respuesta casi siempre es: QR dinámico. La posibilidad de cambiar el destino sin reimprimir y saber cuánta gente lo usa vale el mínimo esfuerzo de configuración. Y si es gratis, no hay ninguna razón para usar el estático.',
    ctaText: 'Crear mi QR dinámico gratis',
    ctaHref: '/qr',
  },

  {
    slug: '5-formas-de-mejorar-la-reputacion-online-de-tu-negocio',
    title: '5 formas de mejorar la reputación online de tu negocio en Argentina',
    description: 'Estrategias concretas para mejorar la reputación online de tu negocio: reseñas en Google, respuestas, contenido y herramientas que funcionan.',
    keywords: ['mejorar reputación online negocio', 'reputación online local', 'reputación online argentina', 'cómo mejorar reseñas negocio'],
    date: '2025-08-10',
    category: 'Reputación Online',
    readingTime: 6,
    emoji: '🏆',
    intro: 'La reputación online de tu negocio es lo primero que ve un cliente potencial antes de pisarlo. En Argentina, el 87% de los consumidores investiga online antes de visitar un local por primera vez. Lo que encuentran en esos minutos decide si van o no. Acá van cinco estrategias concretas para mejorar esa primera impresión.',
    sections: [
      {
        h2: '1. Completá y optimizá tu perfil de Google Business',
        paragraphs: [
          'El perfil de Google Business (antes Google My Business) es tu ficha en Google Maps. Si está incompleto o desactualizado, perdés clientes antes de que lleguen a tu puerta.',
          'Asegurate de tener fotos de calidad del local y los productos, el horario de atención actualizado (especialmente feriados), el número de teléfono correcto, la dirección exacta, y una descripción que incluya las palabras que tu cliente usaría para buscarte.',
        ],
        highlight: 'Los perfiles de Google Business con fotos reciben un 42% más de solicitudes de cómo llegar.',
      },
      {
        h2: '2. Respondé todas las reseñas, especialmente las negativas',
        paragraphs: [
          'Un negocio que no responde reseñas da la impresión de que no le importa la opinión de sus clientes. Respondé todas: a las positivas con un agradecimiento breve y genuino, a las negativas con calma y ofreciendo una solución.',
          'Los futuros clientes leen las respuestas antes de decidir. Una respuesta empática a una reseña negativa puede convencer a alguien de visitarte incluso después de leer la crítica.',
        ],
      },
      {
        h2: '3. Implementá un sistema para pedir reseñas activamente',
        paragraphs: [
          'No podés esperar a que los clientes satisfechos dejen reseñas solos. Hay que pedirlas en el momento justo, con el menor roce posible. Un cartel con QR en la mesa, en la caja o en la salida es la forma más efectiva: el cliente escanea y en tres toques ya está calificando.',
          'La clave es hacerlo parte del proceso de atención, no algo forzado o incómodo. "¿Todo bien con la comida? Si querés dejarnos una reseña en Google, acá tenés el código."',
        ],
      },
      {
        h2: '4. Creá contenido que muestre lo que hacés',
        paragraphs: [
          'Las fotos y videos en Google Business, Instagram y Facebook construyen reputación antes de que el cliente llegue. No hace falta producción profesional: una foto bien iluminada del plato del día, un video corto del equipo trabajando, o una story mostrando el detrás de escena son suficientes.',
          'El contenido constante y auténtico genera confianza. Un perfil de Instagram actualizado con regularidad dice "este negocio está activo y le importa su imagen".',
        ],
      },
      {
        h2: '5. Filtrá las quejas antes de que lleguen a Google',
        paragraphs: [
          'La estrategia más subestimada: darle al cliente insatisfecho un canal privado para que te lo cuente a vos antes de irse a Google. Si alguien tuvo una mala experiencia y encuentra una forma rápida de comunicárselo al negocio, muchos prefieren eso a una reseña pública.',
          'Sistemas como Calificar hacen exactamente eso: cuando el cliente califica mal su experiencia, en lugar de ir a Google, recibe un formulario para contarte el problema en privado. Vos lo podés resolver, y la reseña negativa nunca se publica.',
        ],
        highlight: 'Interceptar la queja antes de que llegue a Google es la forma más efectiva de proteger tu reputación.',
      },
    ],
    conclusion: 'La reputación online no se construye de un día para el otro, pero sí se puede mejorar sistemáticamente. Empezá por lo más simple: completar el perfil de Google y responder las reseñas que ya tenés. Después sumá el sistema de pedido activo de reseñas. En 60 días vas a ver resultados concretos.',
    ctaText: 'Conocer Calificar',
    ctaHref: '/',
  },
]

export function getPost(slug: string): Post | undefined {
  return posts.find(p => p.slug === slug)
}

export function getAllSlugs(): string[] {
  return posts.map(p => p.slug)
}
