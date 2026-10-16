# Calificar — Documento Ejecutivo de Plataforma

> Versión interna · Uso comercial y onboarding

---

## 1. ¿Qué es Calificar y cómo funciona?

Calificar es una plataforma de fidelización digital para comercios locales que reemplaza las tarjetas de puntos de papel por una experiencia 100% web, sin que el cliente tenga que bajar ninguna app ni crear una cuenta nueva. El sistema vive en el navegador del celular: el cliente escanea un código QR o toca una placa NFC en el mostrador, completa su registro en segundos, y desde ese momento tiene su tarjeta de puntos guardada en el teléfono. El comercio, por su parte, accede a un panel de control donde ve en tiempo real los clientes activos, los sellos cargados y los premios canjeados.

---

## 2. Opciones de Registro de Usuarios (Cero Fricción)

El sistema está diseñado para que el cliente pueda unirse al programa sin importar el tipo de negocio ni si tiene local a la calle o no.

### Vía QR / NFC (presencial)

El local cuenta con un acrílico en el mostrador que tiene impreso un código QR y, opcionalmente, una placa de tecnología NFC. El cliente escanea con la cámara del celular o toca el acrílico, se abre el navegador de forma automática, completa su nombre y número de WhatsApp, y listo: la tarjeta digital queda vinculada a su dispositivo. Todo el proceso tarda menos de 30 segundos.

### Vía Link Directo (remoto)

Pensado para negocios que no tienen atención presencial: dark kitchens, locales de solo delivery, tiendas de ropa que operan por redes sociales o cualquier comercio que gestiona sus pedidos por WhatsApp. El comercio tiene asignado un **link único de registro** que puede enviar al cliente por cualquier canal digital. El cliente hace clic, completa el formulario desde su casa, y su tarjeta queda activa. No necesita visitar el local para empezar a acumular puntos.

---

## 3. ¿Cómo funciona la carga de sellos?

El comercio tiene dos mecanismos para cargar sellos, dependiendo del canal de venta:

### Carga presencial (mostrador)

El cajero abre la sección "Hoy" del panel y usa el **QR rotativo** que aparece en pantalla. El cliente lo escanea con su celular, el sistema lo reconoce, y el sello queda registrado de forma instantánea. El QR se rota cada 10 segundos como medida de seguridad: si un cliente lo fotografiara, solo tiene una ventana mínima antes de que caduque.

### Carga remota (delivery o link directo)

Para los pedidos sin contacto, el comercio dispone del **link de carga de sellos** — un enlace único y autenticado — que puede incluir junto al pedido (por WhatsApp, en la bolsa de delivery o en cualquier canal digital). El cliente hace clic, el sistema valida que es el destinatario correcto, y el sello aparece en su tarjeta.

En ambos casos, el sistema registra el sello, actualiza la tarjeta del cliente en tiempo real y genera el premio automáticamente si se alcanza la meta configurada. El link de carga no es público: solo funciona cuando lo usa alguien autenticado como operador del comercio, lo que garantiza que ningún cliente pueda asignarse sellos por su cuenta.

---

## 4. Diferencias Tecnológicas (Android vs. iOS)

Calificar funciona en ambos sistemas operativos. A continuación, el detalle honesto de la experiencia en cada plataforma:

### Android

Experiencia 100% nativa. El cliente puede instalar la tarjeta como una **Progressive Web App (PWA)** con un solo toque desde el navegador, igual que si fuera una app de Play Store. Una vez instalada, aparece en la pantalla de inicio con el ícono y los colores del local. Además, el sistema envía **notificaciones push directas**: cuando el cliente llega a la mitad de los sellos, cuando canjea un premio, o cuando el comercio lanza una promoción especial, le llega una notificación al celular como cualquier otra app.

### iOS (iPhone)

La tarjeta digital funciona perfectamente. El cliente puede acceder a su tarjeta desde el navegador Safari y guardarla en la pantalla de inicio como acceso directo. La fidelización opera sin ningún problema: acumula sellos, ve su progreso y canjea premios.

La única diferencia es que **Apple limita las notificaciones push web** en sus dispositivos. Por política del sistema operativo, las notificaciones solo están disponibles en iOS 16.4 o superior y requieren que la app esté instalada en modo standalone. En la práctica, parte de la base de clientes con iPhone no recibe los avisos automáticos. Esta limitación no afecta el funcionamiento del programa de puntos, pero sí reduce el alcance de las campañas de reactivación. La solución definitiva está en desarrollo (ver Roadmap, punto 8).

---

## 5. Nuestra Seguridad

La integridad del sistema es una prioridad. Calificar incorpora dos capas de protección para que el comercio no tenga que preocuparse por el abuso del programa:

**Validación de dueño (autenticación de operador):** Cada sello cargado requiere que quien lo valide sea un operador autenticado del comercio. El endpoint de carga de sellos está protegido por un token de autorización vinculado al propietario del programa. Esto hace imposible que un cliente externo, aunque conozca el ID de su tarjeta, pueda asignarse sellos por su cuenta.

**Sistema de cooldown anti-abuso:** El sistema tiene configurado un tiempo de espera de **4 horas entre sello y sello** para un mismo cliente. Si alguien intenta cargar más de un sello antes de que se cumpla ese tiempo, la solicitud es rechazada automáticamente. Esta regla aplica tanto para la carga presencial como para la remota.

---

## 6. Registro del Comercio (Onboarding)

El alta de un nuevo comercio es rápida y no requiere ningún conocimiento técnico por parte del dueño del local. Nosotros nos encargamos de toda la configuración inicial:

- **Identidad visual:** cargamos el logo del comercio, elegimos los colores principales (fondo de la tarjeta, color de texto, ícono de sello).
- **Parámetros del programa:** definimos juntos la cantidad de sellos necesarios para el premio, el nombre del premio y, si el comercio lo necesita, hitos intermedios (por ejemplo: a los 5 sellos, un 15% de descuento).
- **Entrega de herramientas:** el comercio recibe su QR listo para imprimir, el link de registro para clientes remotos, el link de carga de sellos para el cajero, y acceso al panel de control.

El resultado es un sistema **llave en mano**: el día del alta, el comercio puede empezar a registrar clientes desde el primer turno.

---

## 7. Nuestros Planes

Todos los planes incluyen tarjetas digitales ilimitadas y notificaciones push ilimitadas. La diferencia está en la cantidad de programas, las funciones de automatización y el nivel de soporte.

---

### Plan Trial

Gratuito. Para que el comercio pruebe la plataforma antes de comprometerse. Acceso limitado a las funciones principales.

---

### Plan Starter — $14.999 ARS/mes

*"Menos que un café por día."*

**Incluye:**
- 1 programa de fidelización con logo y colores propios
- Notificaciones push ilimitadas al celular de los clientes
- Cartelito NFC + QR para el mostrador
- Tarjeta digital en Google Wallet
- Panel de gestión en tiempo real
- Exportación de clientes: nombre y teléfono
- Soporte premium en español

---

### Plan Pro — $29.999 ARS/mes *(Recomendado)*

**Todo lo de Starter, más:**
- Hasta 3 programas de fidelización independientes — cada uno con su propio QR, su propio objetivo y su propia base de clientes. Un restaurante en zona de oficinas, por ejemplo, puede tener un programa de almuerzos (10 almuerzos → 1 almuerzo gratis) y otro de cafés (10 cafés → 1 café gratis). Los clientes pueden participar de los dos al mismo tiempo, cada sello va a la tarjeta correcta, y los premios son independientes.
- Campañas de cumpleaños automáticas
- Cupones únicos generados al completar la tarjeta
- Avisos de proximidad por geolocalización (notificación cuando el cliente pasa cerca del local)
- Soporte prioritario

---

### Plan Ultimate — $69.999 ARS/mes

*"Para cadenas, franquicias y negocios sin límites."*

**Todo lo de Pro, más:**
- Programas de fidelización ilimitados
- Sucursales ilimitadas
- Múltiples operadores por local — más de una persona del equipo puede entrar al panel para cargar sellos, sin necesidad de compartir la contraseña del dueño. El dueño crea un acceso separado para el encargado o los cajeros, y cada uno opera de forma independiente.
- Zonas de notificación por geolocalización ilimitadas
- Exportación detallada con historial completo
- Integración personalizada — analizamos el sistema actual del comercio (POS, software de delivery, facturación) y armamos una integración automática de carga de sellos según sus datos. El cliente compra, el sistema lo detecta, y el sello se acredita sin que nadie tenga que escanear nada.

---

## 8. Próximamente (Roadmap)

**Integración con Apple Wallet (.pkpass)**
En los próximos días lanzamos la posibilidad de que los clientes con iPhone descarguen su tarjeta de fidelización como un pase nativo de Apple Wallet, junto a sus tarjetas de crédito y pases de embarque. Esto resuelve el bloqueo de las notificaciones push en iOS: los premios, los sellos y las promociones llegarán como notificaciones nativas de la Wallet directamente al celular del cliente, sin configuraciones adicionales de su parte.

**Panel de Autogestión — Card Editor**
Ya disponible. Desde el panel de control, el dueño puede modificar en vivo los colores de su tarjeta, subir el ícono de sello personalizado, cambiar el fondo de la tarjeta y ver el resultado en un preview del celular (iOS y Android) antes de confirmar los cambios. No requiere intervención de nuestro equipo.

---

*Calificar — calificar.com.ar*
