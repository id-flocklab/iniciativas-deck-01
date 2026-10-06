// Contenido del deck. Cada slide = { type, theme, ...datos }.
// Texto entre *asteriscos* = Newsreader Light Italic (el acento en cursiva).
// themes: deck (violeta) · i1 (magenta) · i2 (naranja) · i3 (verde)
// types: cover · section · list · cards · steps · clients · quote · gantt · closing

const I1 = 'INICIATIVA 01 · MEDIMOS TIEMPOS DE CICLO DE TAREAS REPETITIVAS CON COMPUTER VISION';
const I2 = 'INICIATIVA 02 · GENERAMOS ESCENARIOS DE CAPACITACIÓN INMERSIVA CON IA Y UNREAL ENGINE';
const I3 = 'INICIATIVA 03 · CONVERTIMOS EL TRABAJO REAL EN CAPACITACIÓN CON VIDEO E IA MULTIMODAL';

window.SLIDES = [
  // ───────────── INTRO ─────────────
  {
    type: 'cover', theme: 'deck',
    kicker: '*I+D · Flock Labs 2026*',
    title: 'Iniciativas de Investigación y Desarrollo',
    foot: 'Aprobación de iniciativas',
  },
  {
    type: 'list', theme: 'deck', gap: 24,
    kicker: 'ÍNDICE',
    title: 'Las 3 iniciativas *que exploramos*',
    subtitle: 'Resumen de las iniciativas de I+D presentadas en esta charla.',
    section: 'Agenda de la presentación',
    items: [
      'Control de eficiencia en tareas repetitivas con Computer Vision',
      'Capacitación inmersiva con IA y Unreal Engine',
      'Capacitación desde el trabajo: video real + IA multimodal',
    ],
  },

  // ───────────── INICIATIVA 01 ─────────────
  {
    type: 'section', theme: 'i1', logo: 'logo-i1.png', logoBox: [1424, 375, 353, 330],
    kicker: '*I+D · Iniciativa 01*',
    title: 'Control de eficiencia en *tareas repetitivas*',
    foot: 'COMPUTER VISION · AUTOMATIZACIÓN · MEDICIÓN DE TIEMPOS',
  },
  {
    type: 'quote', theme: 'i1',
    kicker: I1,
    title: 'El problema *que vemos hoy*',
    subtitle: 'Medición automática de tiempos de ciclo con Computer Vision.',
    text: 'En la industria, medir tiempos de ejecución de tareas repetitivas requiere *observación manual*. Con Computer Vision es posible automatizar esa medición y obtener datos continuos y objetivos *para optimizar procesos productivos*.',
  },
  {
    type: 'clients', theme: 'i1',
    kicker: I1,
    title: 'Quién necesita *esta solución*',
    subtitle: 'Sponsors con interés confirmado y verticales con demanda real.',
    logos: [['arrebeef.png', 'Arrebeef'], ['sewtech.png', 'Sewtech Argentina'], ['boehringer.png', 'Boehringer Ingelheim'], ['coardel.png', 'Coardel']],
    items: [
      'Arrebeef, Sewtech, Boehringer y Coardel mostraron interés en la solución.',
      'Cualquier cliente de industria con operarios y planificación de objetivos podría interesarse en la solución. Es transversal a muchas industrias: manufactura, alimentos, retail, etc.',
    ],
  },
  {
    type: 'steps', theme: 'i1', cols: 2,
    kicker: I1,
    title: 'Lo que vamos *a aprender*',
    subtitle: 'Cuatro focos de conocimiento que quedan como capacidad de Flock.',
    items: [
      ['Action recognition', 'Detectar en video el inicio y el fin de cada tarea, sin intervención del operario.'],
      ['Fine tuning de modelos', 'Adaptar modelos existentes a cada planta y tipo de tarea con pocos datos etiquetados.'],
      ['Pipeline de video productivo', 'Llevar la medición de una prueba puntual a una línea corriendo todos los días.'],
      ['Precisión demostrable', 'Cuánto error tolera el cliente y cómo lo probamos contra medición manual.'],
    ],
  },
  {
    type: 'gantt', theme: 'i1',
    kicker: I1,
    title: 'Planificación *de la iniciativa*',
    subtitle: '2 meses · Complejidad media.',
    months: ['MES 1', 'MES 2'],
    // [etapa, semana inicio, duración en semanas, opacidad, destacada]
    rows: [
      ['Hipótesis del problema', 0, 1, 0.6],
      ['Investigación y arquitectura', 1, 2, 0.8],
      ['Implementación del PoC', 2, 3, 1, true],
      ['Validación vs. ground truth', 5, 2, 0.8],
      ['Insights y transferencia', 7, 1, 0.6],
    ],
    bandsLabel: 'Participación del cliente',
    bands: [
      { from: 1, len: 2, label: 'Entra el cliente', text: 'Nos entrega material de video' },
      { from: 5, len: 2, label: 'Vuelve el cliente', text: 'Prueba la solución en planta' },
    ],
  },
  {
    type: 'steps', theme: 'i1', cols: 2,
    kicker: I1,
    title: 'Cómo llegamos *al resultado*',
    subtitle: 'Roadmap hacia la validación de la POC.',
    items: [
      ['Recolección de datos', 'Obtener videos representativos de tareas repetitivas en entornos industriales reales. Alternativa: grabaciones controladas o datos sintéticos.'],
      ['Desarrollo del modelo de CV', 'Entrenar un modelo capaz de identificar inicio y fin de cada ciclo, medir duración y detectar variaciones entre ciclos.'],
      ['Validación contra ground truth', 'Comparar las mediciones automáticas con mediciones manuales para evaluar precisión y calibrar el modelo.'],
      ['POC y presentación a sponsors', 'Entregar una prueba de concepto funcional a Arrebeef y Sewtech, demostrando viabilidad técnica y valor comercial.'],
    ],
  },
  {
    type: 'steps', theme: 'i1', cols: 2,
    kicker: I1,
    title: 'Por qué nuestra *solución es mejor*',
    subtitle: 'Cuatro diferencias concretas frente a Invisible AI, i-5O, Retrocausal y Optifye.ai.',
    items: [
      ['Apuntamos a PyMEs', 'Los competidores venden a manufactura grande. Nosotros nacemos desde empresas medianas y regionales.'],
      ['El valor está en el fine tuning', 'Ajustamos el modelo a cada planta y damos visibilidad completa sobre las métricas de su operación.'],
      ['Observabilidad de la precisión', 'El cliente ve cuánto error tiene la medición. Las soluciones del mercado son una caja negra.'],
      ['Sin hardware propietario', 'Trabajamos sobre las cámaras que el cliente ya tiene instaladas, sin dispositivos ni setup especial.'],
    ],
  },
  {
    type: 'steps', theme: 'i1', cols: 2,
    kicker: I1,
    title: 'Impacto en *el negocio*',
    subtitle: 'Cuatro frentes donde esta iniciativa genera valor para Flock y sus clientes.',
    items: [
      ['Mejores tiempos productivos', 'Valor directo para empresas de industrias distintas: manufactura, alimentos, retail y más.'],
      ['Capacidad propia del equipo de I+D', 'Conocimiento instalado en action recognition y fine tuning de modelos, reutilizable en otros proyectos.'],
      ['Decisiones basadas en datos reales', 'Incentivamos decisiones con métricas conectadas con la operación, no con estimaciones teóricas.'],
      ['Escalabilidad del sistema', 'Base para seguir creciendo con otros sistemas de visión aplicados a la misma industria.'],
    ],
  },

  // ───────────── INICIATIVA 02 ─────────────
  {
    type: 'section', theme: 'i2', logo: 'logo-i2.png', logoBox: [1424, 375, 362, 338.5],
    kicker: '*I+D · Iniciativa 02*',
    title: 'Capacitación *inmersiva con IA*',
    foot: 'EXPERIENCIAS INMERSIVAS · PRODUCTO · UNREAL ENGINE',
  },
  {
    type: 'quote', theme: 'i2',
    kicker: I2,
    title: 'La oportunidad *que detectamos*',
    subtitle: 'Desarrollar experiencias de VR lleva meses; con IA generativa, semanas.',
    text: 'Desarrollar VR hoy es un proceso *largo y costoso* para cualquier empresa. Con IA generativa podemos crear experiencias inmersivas para industria —assets 3D y escenarios— *en pocas semanas*.',
  },
  {
    type: 'clients', theme: 'i2',
    kicker: I2,
    title: 'Quién se *beneficia*',
    subtitle: 'Clientes con interés manifestado y el universo que abre Trainly.',
    logos: [['syngenta.png', 'Syngenta'], ['tecpetrol.png', 'Tecpetrol'], ['vista.png', 'Vista Energy'], ['aeropuertos.png', 'Aeropuertos Argentina']],
    items: [
      'Syngenta, Tecpetrol, Vista Energy y Aeropuertos Argentina manifestaron interés en experiencias de VR.',
      'Integrarla luego con Trainly nos abre además todo el universo de clientes usuarios de la plataforma.',
    ],
  },
  {
    type: 'steps', theme: 'i2', cols: 2,
    kicker: I2,
    title: 'Lo que vamos *a aprender*',
    subtitle: 'Cuatro focos técnicos para recrear escenarios con IA generativa.',
    items: [
      ['Benchmark de modelos 3D generativos', 'Comparar Meshy, Tripo, Hyper3D y Sloyd: qué calidad de malla y textura sirve para un escenario industrial.'],
      ['Fotogrametría y visión 3D', 'Otras técnicas para recrear instalaciones reales a partir de fotos y video de planta.'],
      ['MCPs sobre software de modelado', 'Conectar agentes a Blender y Unreal para generar y organizar escenas sin trabajo manual.'],
      ['Tiempo real de producción', 'Cuánto se comprime el desarrollo de una experiencia completa frente al flujo tradicional.'],
    ],
  },
  {
    type: 'gantt', theme: 'i2',
    kicker: I2,
    title: 'Plan de investigación *de 2 a 4 meses*',
    subtitle: '2 a 4 meses · Complejidad alta.',
    note: '📌 El timeline mostrado es el escenario mínimo (2 meses). Según el caso de uso seleccionado y la complejidad del escenario a construir, la iniciativa puede extenderse hasta 4 meses. La definición del caso de uso depende de una decisión de Industrias 4.0.',
    months: ['MES 1', 'MES 2-4'],
    rows: [
      ['Hipótesis y smoke test', 0, 1, 0.6],
      ['Investigación y arquitectura', 1, 2, 0.8],
      ['Implementación del MVP', 2, 3, 1, true],
      ['Validación', 5, 2, 0.8],
      ['Insights y transferencia', 7, 1, 0.6],
    ],
  },
  {
    type: 'steps', theme: 'i2', cols: 2,
    kicker: I2,
    title: 'Cómo llegamos *al MVP*',
    subtitle: 'Hacia un escenario industrial inmersivo funcional.',
    items: [
      ['Investigación de herramientas', 'Evaluar Meshy, Tripo AI, Hyper3D, Sloyd, Kaedim y WorldEngen para generación de assets 3D, texturas y escenas.'],
      ['Integración con Unreal Engine', 'Validar si Unreal MCP permite orquestar escenas desde un agente de IA y probar el pipeline de generación y organización automática.'],
      ['MVP de seguridad industrial', 'Construir una capacitación de identificación de riesgos en instalación petrolera y medir automatización vs. retrabajo manual.'],
      ['Validación y métricas', 'Evaluar calidad de assets, coherencia visual, tiempos de producción vs. método tradicional y viabilidad de integración en Trainly.'],
    ],
  },
  {
    type: 'cards', theme: 'i2',
    kicker: I2,
    title: 'Por qué nuestra *solución es mejor*',
    subtitle: 'Por qué Flock está en la mejor posición para desarrollar esta solución.',
    items: [
      { t: 'Expertise en industrias', d: 'El equipo de Industrias 4.0 ya opera en el dominio: conocemos los procesos, los riesgos y el lenguaje del cliente industrial.' },
      { t: 'Aceleración con IA', d: 'Comprimimos tiempos de desarrollo con agentes y generación automática de assets, reduciendo semanas de trabajo manual a días.' },
      { t: 'Base de usuarios de Trainly', d: 'Un grupo de usuarios activos ya prueba la plataforma: canal directo para validar, iterar y escalar desde el día uno.' },
      { t: 'Orientada al aprendizaje', d: 'Al ser una solución de capacitación, escala a múltiples industrias, procedimientos y niveles de complejidad.' },
      { t: 'Puerta de entrada a VR/AR', d: 'Esta iniciativa abre el camino al desarrollo de soluciones de realidad virtual y aumentada: una capacidad nueva para Flock.' },
      { t: 'De necesidad interna a producto', d: 'Nace de productos propios (Trainly): menor riesgo de construir algo desalineado del uso real.' },
    ],
  },
  {
    type: 'cards', theme: 'i2',
    kicker: I2,
    title: 'Impacto *en el negocio*',
    subtitle: 'Oportunidades de producto, eficiencia y nuevos mercados.',
    section: '¿Dónde genera valor?',
    items: [
      'Reducción de tiempos de producción de simulaciones de capacitación.',
      'Experiencias Inmersivas: escenarios y demos más rápidos con menos esfuerzo.',
      'Demos ágiles para oportunidades comerciales y preventa.',
      'Trainly: prácticas inmersivas y evaluación integrada como feature.',
      'Reutilización de assets y componentes 3D entre proyectos.',
      'Producto: explorar integraciones y habilitar nuevos productos.',
      'Entrenamiento práctico en oil & gas, manufactura y seguridad.',
      'Comercial: demos configurables para responder más rápido.',
    ],
  },

  // ───────────── INICIATIVA 03 ─────────────
  {
    type: 'section', theme: 'i3', logo: 'logo-i3.png', logoBox: [1424, 375, 362, 338.5],
    kicker: '*I+D · Iniciativa 03*',
    title: 'Learning basado en video: *multimodal en Trainly*',
    foot: 'AGENTES · PRODUCTO',
  },
  {
    type: 'quote', theme: 'i3',
    kicker: I3,
    title: 'La oportunidad *que detectamos*',
    subtitle: 'Convertir una ejecución real en capacitación hoy exige un proceso manual.',
    text: 'El conocimiento operativo crítico queda concentrado en pocas personas. Observar una tarea, documentarla, redactar el procedimiento y editar materiales consume tiempo y *se desactualiza con facilidad*. La hipótesis es que video y audio reales, IA multimodal y validación experta pueden generar *un borrador estructurado de curso* con menos esfuerzo.',
  },
  {
    type: 'list', theme: 'i3', gap: 24,
    kicker: I3,
    title: 'Quién se *beneficia*',
    subtitle: 'Organizaciones y usuarios que necesitan transformar conocimiento operativo en capacitación.',
    section: 'Principales beneficiarios',
    items: [
      { t: 'Empresas de oil & gas', d: 'Documentar tareas operativas, de mantenimiento y seguridad.', tag: 'Industria' },
      { t: 'Usuarios de Trainly', d: 'Crear y consumir capacitaciones a partir del trabajo real.', tag: 'Producto' },
      { t: 'Industrias con saber operativo', d: 'Llevar el conocimiento de sus empleados a capacitaciones concretas.', tag: 'Industria' },
      { t: 'Capacitación, Operaciones y Seguridad', d: 'Revisar, aprobar y publicar procedimientos.', tag: 'Equipos' },
    ],
  },
  {
    type: 'steps', theme: 'i3', gap: 24,
    kicker: I3,
    title: 'Lo que vamos *a aprender*',
    items: [
      ['Modelos multimodales en learning', 'Cómo los modelos de video, texto y audio pueden transformar contenido estático en experiencias de aprendizaje interactivas y adaptativas.'],
      ['Captura desde dispositivos AR', 'Capacidades y límites de dispositivos AR para capturar contexto operativo: qué sensores aprovechamos y qué calidad de datos obtenemos.'],
      ['Pipeline de video educativo', 'Flujo end-to-end: captura del escenario operativo, procesamiento multimodal, generación de secuencias didácticas y entrega personalizada.'],
      ['Integración con plataformas LMS', 'Cómo conectar la generación de contenido con Trainly y otros LMS manteniendo trazabilidad del progreso y métricas de aprendizaje.'],
      ['Eficacia del video como formato', 'Medir retención, engagement y aplicabilidad frente a formatos tradicionales: ¿el video generado automáticamente es igual de efectivo?'],
    ],
  },
  {
    type: 'gantt', theme: 'i3',
    kicker: I3,
    title: 'Plan de investigación *de 1,5 meses*',
    subtitle: '1 a 2 meses · Complejidad baja.',
    months: ['MES 1', 'MES 2'],
    rows: [
      ['Hipótesis del problema', 0, 1, 0.6],
      ['Investigación', 1, 1, 0.8],
      ['Implementación del PoC', 2, 2, 1, true],
      ['Validación', 4, 1, 0.8],
      ['Insights y transferencia', 5, 1, 0.6],
    ],
  },
  {
    type: 'steps', theme: 'i3', cols: 2,
    kicker: I3,
    title: 'Cómo llegamos *al piloto*',
    subtitle: 'Un procedimiento corto, secuencial y observable como primer alcance.',
    items: [
      ['Acordar procedimiento y umbrales', 'Definir antes de ejecutar las métricas de calidad, tiempo, edición, utilidad y repetibilidad.'],
      ['Capturar la tarea real', 'El experto graba con celular o cámara POV mientras realiza y explica la tarea, sin interferir con la ejecución.'],
      ['Generar, revisar y publicar', 'La IA identifica pasos, herramientas, riesgos y controles; un experto corrige y aprueba el borrador en Trainly.'],
      ['Repetir y decidir', 'Probar el pipeline en un segundo procedimiento y decidir si integrar, optimizar, acotar o descartar.'],
    ],
  },
  {
    type: 'cards', theme: 'i3',
    kicker: I3,
    title: 'Por qué nuestra *solución es mejor*',
    subtitle: 'Learning basado en video · Ventajas competitivas clave.',
    items: [
      { t: 'Conocimiento de oil & gas', d: 'Entendemos los procesos operativos y podemos diseñar aplicativos específicos para cada vertical industrial.' },
      { t: 'Casos de uso como motor', d: 'Capacidad de capitalizar casos que impacten en industrias y se conviertan en motor de conocimiento interno.' },
      { t: 'Integración con Trainly', d: 'Una plataforma validada por usuarios: no partimos de cero, nos montamos sobre una base activa y feedback real.' },
      { t: 'Experiencia en AR', d: 'Potenciamos el conocimiento de producto en tecnologías exploratorias como realidad aumentada, que enriquecen la propuesta.' },
    ],
  },
  {
    type: 'cards', theme: 'i3',
    kicker: I3,
    title: 'Impacto en *el negocio*',
    subtitle: 'Valor potencial para la operación y para Trainly.',
    section: '¿Dónde genera valor?',
    items: [
      'Reducir el tiempo de convertir conocimiento operativo en capacitación.',
      'Reducir el costo de creación y actualización de capacitaciones.',
      'Preservar saberes que hoy dependen de pocas personas.',
      'Acelerar el onboarding y las actualizaciones ante cambios de proceso.',
      'Mejorar la consistencia de los procedimientos.',
      'Mejorar la trazabilidad y la revisión experta.',
      'Demostrar impacto con métricas del piloto antes de escalar.',
      'Trainly: crear contenido desde el trabajo real.',
    ],
  },

  // ───────────── CIERRE ─────────────
  {
    type: 'cards', theme: 'deck',
    kicker: 'RESUMEN',
    title: 'Qué buscamos *aprender*',
    subtitle: 'Cómo estas investigaciones buscan enriquecer y elevar las capacidades de Flock.',
    section: 'Aprendizajes y valor para la empresa',
    items: [
      'Convertir ejecuciones reales en datos operativos objetivos con Computer Vision.',
      'Reducir el esfuerzo de crear experiencias de capacitación con IA.',
      'Preservar conocimiento operativo con video, IA multimodal y validación experta.',
      'Entender hardware y modelos necesarios para detectar problemas en campo.',
      'Construir capacidades reutilizables en Computer Vision e IA multimodal.',
      'Enriquecer Trainly con nuevas formas de crear y consumir capacitación.',
      'Abrir soluciones para industria y agro con oportunidades comerciales.',
      'Usar POCs y métricas para decidir dónde escalar, optimizar, acotar o descartar.',
    ],
  },
  {
    type: 'closing', theme: 'deck',
    kicker: '*Iniciativas de investigación*',
    title: 'I+D · Flock Labs · 2026',
  },
];
