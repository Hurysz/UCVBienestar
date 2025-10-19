export type Resource = {
  id: string;
  title: string;
  description: string;
  authors?: string[];
  publicationInfo?: string;
  category: 'articulo' | 'taller' | 'herramienta';
  content: string;
  imageId: string;
  url: string;
};

export const resources: Resource[] = [
    {
        "id": "res-1",
        "title": "Atención a la salud mental en el Sistema Nacional de Salud: una mirada interniveles al Plan de Acción 2025-2027.",
        "description": "Revisión del Plan de Acción en Salud Mental 2025-2027 en España, destacando la necesidad de reforzar recursos en atención primaria.",
        "authors": ["Bárbara Marco-Gómez", "José Luis de la Fuente Madero", "Clara Severo-Sánchez", "Alba Gállego-Royo", "Candela Pérez-Álvarez", "Inés Sebastián-Sánchez"],
        "publicationInfo": "Elsevier España, S.L.U. (Revista Atención Primaria)",
        "category": "articulo",
        "content": "Este texto ofrece una revisión interniveles (atención primaria y especializada) del Plan de Acción en Salud Mental 2025-2027 aprobado en España. Se valoran positivamente las líneas estratégicas orientadas a modelos comunitarios y centrados en la dignidad, pero se señala la falta de un refuerzo más explícito de recursos, tiempos y formación para que los equipos de atención primaria asuman su papel clave de forma efectiva.",
        "imageId": "resource-1",
        "url": "https://www.scopus.com/pages/publications/105008522463?origin=resultslist"
    },
    {
        "id": "res-2",
        "title": "Efectos de los cambios de temperatura secundarios al cambio climático en la salud humana.",
        "description": "Análisis de cómo el cambio climático y el calor extremo impactan la salud física y mental, proponiendo estrategias desde la atención primaria.",
        "authors": ["María Cristina Almécija Pérez", "Marta Gómez Morillo", "Carlos Llano Gómez", "Nima Peyman-Fard Shafi-Tabatabaei"],
        "publicationInfo": "Elsevier España, S.L.U. (Revista Atención Primaria)",
        "category": "articulo",
        "content": "El cambio climático intensifica el calor extremo, aumentando la mortalidad y morbilidad, afectando especialmente a grupos vulnerables y agravando enfermedades cardiovasculares, renales y mentales. El estudio propone estrategias integrales, equitativas y transformadoras desde la atención primaria para identificar vulnerabilidades, educar y exigir justicia climática, ya que la adaptación puede reducir hasta el 80% de la mortalidad relacionada con el calor.",
        "imageId": "resource-2",
        "url": "https://www.scopus.com/pages/publications/105017332961?origin=resultslist"
    },
    {
        "id": "res-3",
        "title": "Experiences of Epistemic Injustice in the Spanish Psychiatric System: A Qualitative Analysis from the Perspective of Mental Health Activists",
        "description": "Estudio cualitativo sobre cómo los pacientes del sistema psiquiátrico español sienten que no se les escucha ni se les involucra en su tratamiento.",
        "authors": ["Juan Brea-Iglesias", "David Alonso González", "Andrés Arias Astray"],
        "publicationInfo": "European Public & Social Innovation Review",
        "category": "articulo",
        "content": "Este estudio cualitativo con pacientes y activistas del sistema psiquiátrico español identifica ejemplos de injusticia testimonial y hermenéutica. Los participantes reportaron no sentirse escuchados, carecer de participación en las decisiones de su tratamiento y enfrentar barreras para la participación social. Se concluye la necesidad urgente de involucrar a los pacientes en las decisiones de su cuidado y promover su inclusión social.",
        "imageId": "resource-3",
        "url": "https://www.scopus.com/pages/publications/105015402602?origin=resultslist"
    },
    {
        "id": "res-4",
        "title": "Understanding postmigration stress in forcibly displaced people in Austria",
        "description": "Protocolo de un estudio en Austria para entender el estrés post-migración y su impacto en la salud mental de personas desplazadas.",
        "authors": ["Rojan Amini-Nejad", "Urs M. Nater", "Ricarda Mewes"],
        "publicationInfo": "Informa UK Limited (European Journal of Psychotraumatology)",
        "category": "articulo",
        "content": "Este estudio investiga el impacto del estrés post-migración en la salud mental de adultos de habla árabe y farsi que viven en Austria, mediante un diseño de evaluación ambulatoria de 14 días. Los participantes completarán cuestionarios diarios y entregarán muestras de saliva para medir cortisol y alfa-amilasa. Los resultados podrían guiar intervenciones escalables basadas en teléfonos móviles para esta población desatendida.",
        "imageId": "resource-4",
        "url": "https://www.scopus.com/pages/publications/105017936056?origin=resultslist"
    },
    {
        "id": "res-5",
        "title": "Associations between low food security and subjective memory complaints among Latino adults.",
        "description": "Investigación que vincula la inseguridad alimentaria con problemas de memoria, mediados por la ansiedad y la depresión en adultos latinos.",
        "authors": ["Joseph Saenz", "Laura Tanner"],
        "publicationInfo": "BMC Public Health (Springer Nature)",
        "category": "articulo",
        "content": "El estudio analizó datos de 2,481 pacientes latinos y encontró que la baja seguridad alimentaria se relaciona con mayores quejas de memoria subjetiva. Esta asociación desaparece al ajustar por ansiedad y depresión, lo que sugiere que la mala salud mental podría mediar la relación entre ambas variables.",
        "imageId": "resource-5",
        "url": "https://www.scopus.com/pages/publications/105002034660?origin=resultslist"
    },
    {
        "id": "res-6",
        "title": "Mental health and catastrophic health expenditures in conflict-affected regions of Colombia.",
        "description": "Estudio en Colombia que muestra cómo los problemas de salud mental aumentan los gastos de bolsillo en salud en zonas de conflicto.",
        "authors": ["Sebastian Leon-Giraldo", "Nicolas Jater-Maldonado", "Javier Garcia-Estevez", "Oscar Bernal"],
        "publicationInfo": "International Journal for Equity in Health (Springer Nature)",
        "category": "articulo",
        "content": "Este estudio analiza los gastos catastróficos de salud (CHE) y de bolsillo (OOP) en Meta, Colombia, antes y durante la COVID-19. Las personas con tendencia a trastornos mentales (SRQ+) presentan mayores probabilidades de incurrir en gastos OOP y marginalmente mayores en CHE. Se subraya la necesidad de salvaguardas financieras y programas integrales de salud mental para comunidades marginadas.",
        "imageId": "resource-6",
        "url": "https://www.scopus.com/pages/publications/105005806175?origin=resultslist"
    }
];
