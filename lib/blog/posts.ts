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
  {
    slug: 'carteles-nfc-para-resenas-google',
    title: 'Carteles NFC para reseñas de Google: cómo funcionan y dónde comprarlos',
    description: 'Todo lo que necesitás saber sobre los carteles NFC para conseguir reseñas en Google. Cómo funcionan, cuánto cuestan y cómo elegir el mejor para tu negocio.',
    keywords: ['carteles nfc', 'carteles google', 'cartel nfc reseñas', 'venta carteles nfc', 'carteles nfc argentina', 'comprar cartel nfc google'],
    date: '2026-08-10',
    category: 'Reseñas Google',
    readingTime: 7,
    emoji: '📲',
    intro: 'Los carteles NFC son la forma más simple y efectiva de conseguir reseñas en Google. El cliente apoya el celular, llega directo a la página de tu negocio y deja su opinión en segundos. Sin apps, sin QR que escanear, sin fricción. En esta guía te explicamos cómo funcionan, qué opciones hay en Argentina y cómo elegir el que más le conviene a tu negocio.',
    sections: [
      {
        h2: '¿Qué es un cartel NFC y cómo funciona?',
        paragraphs: [
          'NFC significa Near Field Communication, la misma tecnología que usás cuando pagás con el celular o tarjeta sin contacto. Un cartel NFC contiene un chip pequeño que, al acercarse un smartphone, abre automáticamente una URL programada. En el caso de los carteles para reseñas, esa URL es directamente la ficha de tu negocio en Google Maps.',
          'No requiere que el cliente descargue nada ni escanee nada: solo acerca el teléfono al cartel (la mayoría funciona desde 2-4 cm) y en menos de dos segundos ya está en la página de reseñas. Es la experiencia más rápida posible.',
        ],
        highlight: 'NFC es la misma tecnología del pago sin contacto. El cliente apoya el celular y llega directo a Google en menos de 2 segundos.',
      },
      {
        h2: 'Diferencia entre cartel NFC, cartel QR y cartel NFC+QR',
        paragraphs: [
          '**Cartel QR solamente:** el cliente tiene que abrir la cámara, apuntar al código, esperar que lo detecte y tocar el link. Son 4-5 pasos. Funciona pero tiene más fricción que NFC.',
          '**Cartel NFC solamente:** acercar el teléfono y listo. El problema es que los iPhones más viejos (antes del iPhone 7) y algunos Android de gama baja no leen NFC de manera nativa. Es una minoría, pero existe.',
          '**Cartel NFC + QR combinado:** la opción más recomendada. El cliente usa lo que prefiera o lo que tenga disponible. Los carteles de Calificar incluyen ambas tecnologías en el mismo soporte.',
        ],
      },
      {
        h2: '¿Qué teléfonos leen NFC?',
        paragraphs: [
          'La gran mayoría de smartphones actuales ya tienen NFC. En iPhone, desde el modelo 7 en adelante lee etiquetas NFC de manera nativa (no necesita app). En Android, prácticamente todos los modelos desde 2018 tienen NFC activado por defecto.',
          'En la Argentina, dado el parque de celulares que hay, se estima que más del 85% de los clientes en locales gastronómicos y de servicios tienen un smartphone compatible con NFC. El QR cubre al resto.',
        ],
      },
      {
        h2: 'Tipos de carteles NFC para negocios',
        paragraphs: [
          '**Acrílico de mesa:** el más popular para restaurantes y cafeterías. Se para solo, resiste líquidos y tiene buena visibilidad. Suele incluir el logo del negocio y un mensaje tipo "Dejanos tu opinión".',
          '**Tarjeta de PVC:** del tamaño de una tarjeta de crédito. Ideal para mozos, delivery o para dejar en la caja. Fácil de llevar encima.',
          '**Sticker:** para pegar en vidrieras, mesas, o junto al menú. El más económico, pero menos visible y más fácil de despegar.',
          '**Soporte de mostrador con base:** para peluquerías, estéticas y comercios donde el cliente pasa por la caja al irse.',
        ],
      },
      {
        h2: 'Carteles NFC dinámicos vs. estáticos',
        paragraphs: [
          'Un cartel NFC estático tiene la URL grabada de forma fija. Si querés cambiar a dónde apunta (porque cambiaste de negocio o querés alternar entre reseñas de Google y Tripadvisor), tenés que comprar un cartel nuevo.',
          'Un cartel NFC dinámico se conecta a un sistema como Calificar: podés cambiar el destino desde el panel de administración, ver cuántos escaneos tuvo, qué calificación promedio recibiste y filtrar las experiencias negativas antes de que lleguen a Google. Es la opción que más valor le aporta al negocio.',
        ],
        highlight: 'Con un sistema dinámico podés ver cuántas veces escanearon tu cartel, el promedio de calificaciones y redirigir a los clientes insatisfechos a un canal privado en lugar de Google.',
      },
      {
        h2: 'Cuánto cuesta un cartel NFC en Argentina',
        paragraphs: [
          'Los precios varían según el tipo de soporte y si es estático o dinámico. Un sticker NFC sin sistema cuesta entre $3.000 y $8.000. Un acrílico de mesa de calidad, entre $15.000 y $30.000 dependiendo del acabado.',
          'Los sistemas con cartel incluido y plataforma de gestión como Calificar tienen un costo de configuración inicial y una suscripción mensual que cubre el soporte, los cambios de destino y el panel de estadísticas. A diferencia de comprar un cartel estático, el sistema dinámico se paga solo si convertís aunque sea una o dos reseñas negativas en feedback privado.',
        ],
      },
    ],
    conclusion: 'Los carteles NFC son la forma más efectiva de reducir la fricción entre el momento en que el cliente tiene ganas de dejar una reseña y el momento en que realmente la deja. Combinados con un sistema dinámico que filtra experiencias negativas, son una de las mejores inversiones que puede hacer un local que quiere mejorar su presencia en Google.',
    ctaText: 'Pedir mi cartel NFC',
    ctaHref: '/gastronomia',
  },
  {
    slug: 'como-hacer-qr-dinamico-gratis',
    title: 'Cómo hacer un QR dinámico gratis (y para qué sirve en tu negocio)',
    description: 'Guía paso a paso para crear un QR dinámico gratis. Qué diferencia tiene con un QR estático, cómo editarlo sin imprimirlo de nuevo y cómo usarlo para conseguir más reseñas en Google.',
    keywords: ['como hacer qr dinamico', 'qr dinamico gratis', 'crear qr dinamico', 'qr dinamicos', 'qr dinamico para negocio', 'qr editable'],
    date: '2026-08-20',
    category: 'QR Dinámicos',
    readingTime: 6,
    emoji: '🔲',
    intro: 'Un QR dinámico te permite cambiar el link al que apunta sin tener que reimprimir nada. Podés hacer uno gratis en minutos y usarlo para mandar a tus clientes directo a tus reseñas de Google, a tu menú, a tu Instagram o a donde quieras. Te explicamos cómo hacerlo y por qué los negocios que los usan consiguen muchas más reseñas.',
    sections: [
      {
        h2: '¿Qué es un QR dinámico y en qué se diferencia del estático?',
        paragraphs: [
          'Un QR estático tiene la información (la URL o el texto) grabada directamente en el código. Una vez impreso, no se puede cambiar. Si el link cambia o cometiste un error, hay que hacer uno nuevo e imprimirlo de nuevo.',
          'Un QR dinámico, en cambio, apunta a una URL intermedia que vos controlás. El código impreso siempre es el mismo, pero desde un panel podés cambiar el destino final cuantas veces quieras. Podés tener el mismo cartel hace dos años y hoy apuntarlo a tu nueva carta, mañana a tu Google, pasado a una promo.',
        ],
        highlight: 'El QR dinámico siempre se ve igual impreso, pero el destino lo cambiás vos desde el panel, sin reimprimir nada.',
      },
      {
        h2: 'Ventajas de usar QR dinámicos en tu negocio',
        paragraphs: [
          'La principal ventaja es la flexibilidad. Podés usar el mismo cartel para diferentes propósitos según el día o la temporada. Pero hay más: los QR dinámicos también te dan estadísticas de escaneos (cuántas veces se escaneó, desde qué dispositivo, a qué hora), algo que los estáticos no pueden ofrecer.',
          'Para un restaurante, eso significa saber si los clientes del almuerzo escanean más que los de la cena. Para una peluquería, saber qué días tienen más movimiento. Es información de negocio real que viene de un simple cartel.',
        ],
      },
      {
        h2: 'Cómo crear un QR dinámico gratis en Calificar',
        paragraphs: [
          'En Calificar podés generar un QR dinámico sin costo en menos de dos minutos. Solo necesitás crear una cuenta, pegar la URL a la que querés apuntar (tu Google Business, tu menú, tu perfil de Instagram) y el sistema genera el código automáticamente.',
          'Desde el panel podés editarlo en cualquier momento, ver cuántas veces fue escaneado y, si usás el sistema completo, activar el filtro de reseñas para que los clientes satisfechos vayan a Google y los insatisfechos te escriban a vos primero.',
        ],
        list: {
          intro: 'Pasos para crear tu QR dinámico:',
          items: [
            'Creá tu cuenta en calificar.com.ar (gratis)',
            'Pegá la URL de tu negocio en Google Maps',
            'Descargá el QR generado en PNG o SVG',
            'Imprimilo o pedí el cartel físico',
            'Cambiá el destino cuando quieras desde el panel',
          ],
        },
      },
      {
        h2: 'QR dinámico para reseñas de Google: cómo configurarlo',
        paragraphs: [
          'Para apuntar el QR directo a la página de reseñas de tu negocio, necesitás el link específico de tu ficha de Google Business. Para encontrarlo: abrí Google Maps, buscá tu negocio, hacé clic en "Reseñas" y copiá la URL del navegador.',
          'Ese link lo pegás en el panel de Calificar como destino de tu QR. Cuando el cliente escanee, va directo a ese link y puede dejar la reseña sin buscar nada. Cuantos menos pasos, más reseñas.',
        ],
        highlight: 'Un QR que lleva directo a la página de reseñas de Google convierte entre 3 y 5 veces más que uno que lleva a la home del negocio.',
      },
      {
        h2: 'Personalización: color, tamaño y logo en el QR',
        paragraphs: [
          'Los QR dinámicos de Calificar se pueden personalizar con los colores de tu marca y el logo en el centro. Esto hace que el cartel quede más profesional y que los clientes confíen más en escanearlo (un QR genérico negro sobre blanco genera más dudas que uno con el logo del negocio).',
          'Para que el QR siga siendo legible, hay que mantener el contraste suficiente entre el color del código y el fondo, y no poner el logo en más del 30% del área central. El sistema de Calificar ya controla eso automáticamente.',
        ],
      },
      {
        h2: 'Dónde poner el cartel QR para conseguir más escaneos',
        paragraphs: [
          'La ubicación importa tanto como el diseño. Los mejores lugares son: en el centro de la mesa (en un soporte de acrílico), junto a la cuenta o en la caja, pegado en la vidriera a la salida, o uno por mesa junto al menú.',
          'Lo que no funciona: el cartel detrás del mostrador donde el cliente no lo ve, pegado muy alto o en un lugar de paso donde no hay tiempo de escanear. La regla es simple: tiene que estar en el lugar donde el cliente está tranquilo y ya terminó de consumir.',
        ],
      },
    ],
    conclusion: 'Crear un QR dinámico gratis es el primer paso. Lo que marca la diferencia es dónde lo ponés, qué le pedís al cliente que haga cuando lo escanea y si tenés un sistema que filtre las experiencias negativas antes de que lleguen a Google. Calificar lo hace todo junto.',
    ctaText: 'Crear mi QR dinámico gratis',
    ctaHref: '/login',
  },
  {
    slug: 'venta-carteles-nfc-qr-argentina',
    title: 'Dónde comprar carteles NFC y QR para tu negocio en Argentina',
    description: 'Guía para comprar carteles NFC y QR en Argentina. Qué buscar, cuánto pagar y por qué un sistema dinámico con filtro de reseñas vale mucho más que un cartel estático.',
    keywords: ['venta carteles nfc', 'comprar cartel nfc argentina', 'carteles qr para negocios', 'cartel google reviews argentina', 'donde comprar cartel nfc'],
    date: '2026-08-28',
    category: 'Reseñas Google',
    readingTime: 5,
    emoji: '🪧',
    intro: 'Cada vez más negocios en Argentina están usando carteles NFC y QR para conseguir reseñas en Google. La demanda creció mucho y con eso también las opciones disponibles. Pero no todos los carteles son iguales: hay una diferencia enorme entre un chip estático de $5.000 y un sistema dinámico que filtra reseñas negativas y te da estadísticas. Te explicamos qué tener en cuenta antes de comprar.',
    sections: [
      {
        h2: 'Qué opciones de carteles NFC hay en Argentina',
        paragraphs: [
          'En el mercado local hay principalmente tres tipos de proveedores. Primero, los vendedores de MercadoLibre que ofrecen stickers y tarjetas NFC estáticas, pre-programadas con el link que le indicás. Son baratos (entre $3.000 y $15.000) pero sin panel de administración ni estadísticas.',
          'Segundo, imprentas y diseñadores gráficos que hacen el cartel con tu marca pero igual usan chips estáticos: el cartel queda lindo pero el link no se puede cambiar después.',
          'Tercero, plataformas como Calificar que ofrecen el cartel físico con un sistema dinámico detrás: podés cambiar el destino, ver estadísticas de escaneos y activar el filtro de reseñas.',
        ],
      },
      {
        h2: 'Qué preguntar antes de comprar un cartel NFC',
        paragraphs: [
          '**¿Es estático o dinámico?** Si es estático, el link está grabado para siempre. Si mañana cambia la URL de tu Google Business, el cartel queda obsoleto.',
          '**¿Incluye panel de estadísticas?** Un cartel sin estadísticas es ciego: no sabés cuántos clientes lo usaron ni si está funcionando.',
          '**¿Tiene filtro de reseñas?** Esta es la pregunta más importante. Un cartel que manda a todos por igual a Google también manda a los clientes insatisfechos. Un sistema con filtro le pregunta primero cómo estuvo su experiencia y solo redirige a Google a los que tuvieron una buena.',
          '**¿Qué pasa si se me rompe o se desgasta?** Los carteles de acrílico duran años, pero los chips NFC en stickers pueden fallar si los doblan o mojan. Preguntá por la garantía.',
        ],
      },
      {
        h2: 'El costo real de un cartel "barato"',
        paragraphs: [
          'Un sticker NFC de $5.000 parece una ganga hasta que lo analizás en profundidad. Sin estadísticas, no sabés si funciona. Sin filtro de reseñas, cada cliente insatisfecho que lo usa puede ir directo a Google a bajarte la calificación. Sin panel dinámico, si cambia el link tenés que comprar otro.',
          'El costo de una sola reseña negativa en Google es difícil de calcular, pero está bien documentado que los negocios con 4.0 estrellas pierden entre 20% y 30% de los clientes potenciales respecto a los que tienen 4.5 o más.',
        ],
        highlight: 'Una reseña negativa en Google puede costar mucho más que la diferencia de precio entre un cartel estático y uno con sistema de filtrado.',
      },
      {
        h2: 'Carteles NFC de Calificar: qué incluyen',
        paragraphs: [
          'Los carteles de Calificar son de acrílico con chip NFC y QR combinado, personalizados con el nombre de tu negocio. Incluyen acceso al panel de administración donde podés cambiar el destino, ver estadísticas de escaneos y activar el flujo de calificación previa.',
          'El flujo funciona así: el cliente escanea el cartel, se le pregunta si tuvo una buena experiencia. Si dijo que sí, va directo a Google Maps a dejar su reseña. Si tuvo algún inconveniente, se le abre un formulario privado que llega a vos, no a Google.',
        ],
      },
      {
        h2: 'Cuántos carteles necesito para mi negocio',
        paragraphs: [
          'Depende del tamaño y el tipo de negocio. Para un restaurante o bar, lo recomendable es uno por mesa más uno en la caja. Un local de 20 mesas necesitaría 21-22 unidades. Pero si el presupuesto es acotado, arrancá con 3-5 en las mesas más concurridas y la caja: ya vas a ver un aumento significativo.',
          'Para peluquerías, estéticas y comercios, alcanza con uno en la caja o en el mostrador, donde el cliente pasa siempre al terminar.',
        ],
      },
    ],
    conclusion: 'Antes de comprar, definí si querés un cartel que simplemente mande a Google o un sistema que filtre las malas experiencias y te dé datos. La diferencia de precio entre las dos opciones es pequeña comparada con el impacto que tiene en tu reputación online a largo plazo.',
    ctaText: 'Consultar carteles NFC',
    ctaHref: '/gastronomia',
  },
  {
    slug: 'resenas-google-para-restaurantes',
    title: 'Reseñas en Google para restaurantes: la guía completa 2026',
    description: 'Cómo conseguir más reseñas en Google para tu restaurante, bar o cafetería en Argentina. Estrategias probadas, errores comunes y herramientas que automatizan el proceso.',
    keywords: ['reseñas google restaurante', 'reseñas google bar', 'como conseguir reseñas restaurante', 'google reviews gastronomia', 'mejorar reseñas google local'],
    date: '2026-09-01',
    category: 'Reseñas Google',
    readingTime: 8,
    emoji: '🍽️',
    intro: 'El 90% de los comensales lee las reseñas de Google antes de elegir dónde comer. Si tu restaurante tiene pocas reseñas o una calificación por debajo de 4.3, estás perdiendo clientes todos los días sin saberlo. Esta guía es específicamente para negocios gastronómicos en Argentina: restaurantes, bares, cafeterías, rotiserías y todo lo que sea comida.',
    sections: [
      {
        h2: 'Por qué los restaurantes necesitan reseñas más que cualquier otro negocio',
        paragraphs: [
          'La gastronomía es la categoría donde más se consultan las reseñas antes de ir. Según datos de Google, el 94% de los comensales dice que las reseñas online influyeron en su elección de restaurante. Es más que en hoteles, comercios o servicios.',
          'Además, Google Maps da más exposición a los negocios con más reseñas recientes. Un restaurante que consigue 5 reseñas por semana aparece mucho más seguido en los resultados de "restaurantes cerca de mí" que uno que tiene las mismas 20 reseñas hace dos años.',
        ],
        highlight: 'El 94% de los comensales lee reseñas antes de elegir restaurante. Las reseñas recientes pesan más que las antiguas en el algoritmo de Google Maps.',
      },
      {
        h2: 'Los errores más comunes de los restaurantes con sus reseñas',
        paragraphs: [
          '**No pedir la reseña en el momento correcto.** El mejor momento es cuando el cliente está pagando la cuenta o justo antes de irse, con la experiencia fresca. No días después por email.',
          '**Mandar a todos a Google sin filtrar.** El cliente que tuvo algún inconveniente con el pedido, la demora o la temperatura del plato también recibe el pedido de reseña. Y si está molesto, lo más probable es que vaya y lo escriba.',
          '**No responder las reseñas existentes.** Google valora que el dueño responda, y los potenciales clientes también. Un restaurante que responde a las críticas negativas con profesionalismo genera más confianza que uno que no lo hace.',
          '**Depender de que el personal lo pida de palabra.** El mozo que está atendiendo cinco mesas no siempre se acuerda o no siempre quiere hacerlo. El sistema tiene que funcionar solo, sin depender de que alguien se acuerde.',
        ],
      },
      {
        h2: 'El sistema de cartel QR o NFC en la mesa: por qué funciona',
        paragraphs: [
          'El cartel en la mesa hace el trabajo que el mozo no puede hacer siempre. El cliente lo ve mientras espera el cambio, termina de comer o espera que su acompañante vuelva del baño. Es el momento ideal: acaba de comer, está satisfecho (si la experiencia fue buena) y tiene el teléfono en la mano.',
          'Los restaurantes que usan el sistema de Calificar con cartel en cada mesa ven un aumento de entre 3 y 8 reseñas nuevas por semana desde el primer mes. El promedio de calificación también sube porque el sistema filtra las experiencias negativas antes de que lleguen a Google.',
        ],
      },
      {
        h2: 'Cómo manejar las reseñas negativas en gastronomía',
        paragraphs: [
          'Las reseñas negativas en gastronomía suelen venir de tres situaciones: demoras en el servicio, problemas con el pedido (plato equivocado, temperatura, porción) y trato del personal. Todas son recuperables si se interceptan a tiempo.',
          'El sistema de filtro de Calificar le pregunta al cliente cómo estuvo su experiencia antes de mandarlo a Google. Si tuvo un problema, se abre un canal privado donde puede contártelo a vos. Eso te da la oportunidad de compensarlo, aprender del error y evitar que esa queja llegue como reseña pública.',
        ],
      },
      {
        h2: 'Qué hacer con la ficha de Google Business de tu restaurante',
        paragraphs: [
          'La ficha de Google Business es gratuita y tiene mucho impacto. Asegurate de que esté completa: fotos actualizadas (el interior, los platos, el exterior), horarios correctos, menú cargado, y categoría bien elegida ("Restaurante argentino", "Pizzería", "Bar", etc.).',
          'Respondé todas las reseñas, las positivas y las negativas. Para las positivas, un agradecimiento breve y personalizado alcanza. Para las negativas, reconocé el problema sin ponerte a la defensiva, ofrecé una solución y cerrá con un dato de contacto para seguir la conversación en privado.',
        ],
        highlight: 'Los restaurantes que responden el 100% de sus reseñas tienen en promedio 0.2 estrellas más que los que no responden ninguna. Parece poco, pero la diferencia entre 4.1 y 4.3 es enorme para el algoritmo de Google.',
      },
      {
        h2: 'Cómo medir si el sistema está funcionando',
        paragraphs: [
          'Las métricas que importan son: cantidad de reseñas nuevas por semana, calificación promedio y cantidad de escaneos del cartel. Con el panel de Calificar podés ver todo eso en tiempo real.',
          'Un restaurante que arranca con 20 reseñas y 4.0 estrellas debería apuntar a tener 60-80 reseñas y 4.4+ en los primeros tres meses con el sistema activo. Esos números no son difíciles de alcanzar si el servicio es bueno y el sistema está bien ubicado.',
        ],
      },
    ],
    conclusion: 'Las reseñas en Google ya no son opcionales para un restaurante que quiere crecer. Son el factor que decide si un cliente elige tu local o el de enfrente. La buena noticia es que con el sistema correcto se pueden conseguir de manera consistente sin cambiar nada de tu operación diaria.',
    ctaText: 'Empezar a conseguir reseñas',
    ctaHref: '/gastronomia',
  },
]

export function getPost(slug: string): Post | undefined {
  return posts.find(p => p.slug === slug)
}

export function getAllSlugs(): string[] {
  return posts.map(p => p.slug)
}
