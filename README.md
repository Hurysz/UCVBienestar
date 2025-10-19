Proyecto: UCV Bienestar

UCV Bienestar es una plataforma web integral diseñada para ofrecer apoyo a la salud mental y el bienestar de los estudiantes de la comunidad UCV. La aplicación brinda un espacio seguro para conectar, acceder a recursos y gestionar el cuidado personal de manera proactiva.

1. Requerimientos del Proyecto
Requerimientos funcionales

Gestión de autenticación de usuarios

Registro: los usuarios pueden crear una cuenta nueva usando un correo institucional (@ucvvirtual.edu.pe). Se valida que las contraseñas coincidan y cumplan con la longitud mínima.

Inicio de sesión: permite acceder con correo y contraseña.

Recuperación de contraseña: se envía un enlace por correo para restablecerla.

Cierre de sesión: permite salir de la cuenta de forma segura.

Gestión de perfil de usuario

Los usuarios pueden ver y actualizar su información personal, incluyendo nombre completo y biografía.

Permite subir o actualizar una foto de perfil almacenada de forma segura en Firebase Storage.

Agendamiento de citas

Los usuarios pueden agendar sesiones virtuales o presenciales con profesionales de bienestar.

Se puede seleccionar profesional, fecha, hora y motivo de la consulta.

El sistema permite cancelar o retomar citas bajo ciertas condiciones (por ejemplo, cancelar con 2 días de anticipación).

Tras una cita completada, el usuario puede enviar comentarios sobre la sesión.

Grupos de apoyo (chat comunitario)

Canal de chat en tiempo real donde los estudiantes interactúan, comparten experiencias y se brindan apoyo mutuo en un entorno moderado.

Biblioteca de recursos

Artículos informativos sobre salud mental y bienestar.

Herramientas interactivas como ejercicios de respiración guiada y pausas activas con cronómetro.

Sistema de votación para talleres y actividades, donde los más votados se destacan en el panel principal.

Asistente virtual (chatbot con IA)

Chatbot integrado con Genkit capaz de responder preguntas, buscar recursos, consultar citas y ofrecer enlaces de navegación.

Notificaciones por correo

Envío automático de correos mediante Resend al agendar una cita o enviar feedback, notificando tanto a usuarios como administradores.

Panel principal (dashboard)

Centro de control con enlaces rápidos, citas próximas o pasadas y un tablón de anuncios con novedades.

Requerimientos no funcionales

Rendimiento

Tiempos de carga rápidos mediante el uso de App Router y Server Components de Next.js.

Navegación fluida gracias al enrutamiento del lado del cliente.

Usabilidad y experiencia de usuario

Diseño moderno y limpio utilizando ShadCN/UI y Tailwind CSS.

Totalmente adaptable a dispositivos móviles, tabletas y computadoras.

Animaciones sutiles implementadas con Framer Motion.

Seguridad

Autenticación restringida a correos institucionales.

Firestore Security Rules garantizan acceso solo a datos propios.

Firebase Storage protege las fotos de perfil con permisos específicos por usuario.

Escalabilidad

Arquitectura serverless de Firebase (Firestore, Auth y Storage) y despliegue en Firebase App Hosting que permite escalar automáticamente según la demanda.

Mantenibilidad

Código organizado por módulos y responsabilidad.

Uso de TypeScript para reducir errores y facilitar el mantenimiento.

2. Arquitectura del Proyecto

La aplicación utiliza una arquitectura moderna basada en componentes y orientada a servicios, construida sobre Next.js (App Router) y Firebase.

Frontend (cliente):

Framework: Next.js con React.

Interfaz: componentes de ShadCN/UI estilizados con Tailwind CSS.

Estado global manejado con React Context para la autenticación y servicios de Firebase.

Los componentes cliente ('use client') interactúan directamente con Firebase para lectura y escritura en tiempo real.

Backend (servicios en la nube):

Base de datos: Cloud Firestore (NoSQL).

Autenticación: Firebase Authentication.

Almacenamiento: Firebase Storage para fotos de perfil.

Inteligencia artificial: Genkit, integrado con modelos de Google Gemini.

Notificaciones: servicio de correo Resend integrado en los flujos de Genkit.

Hosting:

Desplegado en Firebase App Hosting, con integración nativa para proyectos Next.js.

3. Estructura de Carpetas
/
├── public/                 Archivos estáticos (imágenes locales como logo y banner)
├── src/
│   ├── app/                Páginas y enrutamiento principal (App Router)
│   │   ├── (auth)/         Páginas de autenticación (login, registro)
│   │   ├── dashboard/      Páginas protegidas del panel principal
│   │   ├── globals.css     Estilos globales
│   │   └── layout.tsx      Layout raíz de la aplicación
│   │
│   ├── components/         Componentes reutilizables de React
│   │   ├── ui/             Componentes base de ShadCN (Button, Card, etc.)
│   │   └── *.tsx           Componentes personalizados (Logo, Chatbot, etc.)
│   │
│   ├── firebase/           Configuración y hooks para Firebase
│   │   ├── firestore/      Hooks específicos para Firestore
│   │   └── *.ts            Archivos de inicialización y providers
│   │
│   ├── ai/                 Lógica de inteligencia artificial con Genkit
│   │   ├── flows/          Flujos de IA (definición de interacciones)
│   │   └── genkit.ts       Configuración del cliente de Genkit
│   │
│   ├── lib/                Utilidades y datos estáticos
│   │   ├── resources.ts    Datos de artículos y talleres
│   │   └── utils.ts        Funciones de utilidad
│   │
│   └── hooks/              Hooks personalizados
│
├── docs/                   Documentación y esquemas del backend
│   └── backend.json        Estructura de entidades de Firestore
│
├── tailwind.config.ts      Configuración de Tailwind CSS
├── next.config.ts          Configuración de Next.js
└── package.json            Dependencias y scripts del proyecto

4. Información Importante y Stack Tecnológico

Framework principal: Next.js 15 (App Router)

Lenguaje: TypeScript

Estilos: Tailwind CSS y ShadCN/UI

Animaciones: Framer Motion

Backend y base de datos: Firebase (Firestore, Authentication, Storage)

Inteligencia artificial: Genkit con modelos de Google AI (Gemini)

Servicio de correo: Resend

Validación de formularios: React Hook Form con Zod

Hosting: Firebase App Hosting

Seguridad: acceso restringido a correos del dominio institucional @ucvvirtual.edu.pe