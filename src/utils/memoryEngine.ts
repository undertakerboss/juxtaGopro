import { JuxtaActorRole } from '../types/index.ts';

export interface UserMemoryItem {
  id: string;
  role: JuxtaActorRole;
  category: 'preferencia' | 'direccion' | 'alergia' | 'recordatorio' | 'negocio' | 'ruta_rider';
  fact: string;
  createdAt: string;
}

export const INITIAL_MEMORIES: UserMemoryItem[] = [
  {
    id: 'mem-1',
    role: 'customer',
    category: 'preferencia',
    fact: 'Prefiere hamburguesas smash término 3/4 con papas trufadas y salsas aparte.',
    createdAt: 'Guardado previamente',
  },
  {
    id: 'mem-2',
    role: 'customer',
    category: 'alergia',
    fact: 'Sin maní ni frutos secos en ninguna preparación.',
    createdAt: 'Guardado previamente',
  },
  {
    id: 'mem-3',
    role: 'customer',
    category: 'direccion',
    fact: 'En Calle 93 #11-20 dejar siempre en portería Torre 1 con el vigilante.',
    createdAt: 'Guardado previamente',
  },
  {
    id: 'mem-4',
    role: 'merchant',
    category: 'negocio',
    fact: 'Horario pico de cocina: Viernes y Sábados de 7:00 PM a 10:00 PM. Retiros automáticos a Bancolombia.',
    createdAt: 'Guardado previamente',
  },
  {
    id: 'mem-5',
    role: 'courier',
    category: 'ruta_rider',
    fact: 'Zona preferida de reparto: Chicó Norte, Zona T y Parque de la 93 en moto eléctrica.',
    createdAt: 'Guardado previamente',
  },
];

export function detectMemoryCategory(text: string, role: JuxtaActorRole): UserMemoryItem['category'] {
  const lower = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  if (lower.includes('alergi') || lower.includes('sin ') || lower.includes('intoleran') || lower.includes('picante')) {
    return 'alergia';
  }
  if (
    lower.includes('calle') ||
    lower.includes('carrera') ||
    lower.includes('apto') ||
    lower.includes('porteria') ||
    lower.includes('direccion') ||
    lower.includes('casa') ||
    lower.includes('oficina')
  ) {
    return 'direccion';
  }
  if (role === 'merchant' || lower.includes('restaurante') || lower.includes('menu') || lower.includes('comercio') || lower.includes('inventario')) {
    return 'negocio';
  }
  if (role === 'courier' || lower.includes('moto') || lower.includes('ruta') || lower.includes('domicilio') || lower.includes('turno')) {
    return 'ruta_rider';
  }
  if (lower.includes('comprar') || lower.includes('todos los') || lower.includes('cada ') || lower.includes('viernes') || lower.includes('lunes')) {
    return 'recordatorio';
  }
  return 'preferencia';
}

export function extractMemoryFromMessage(
  message: string,
  role: JuxtaActorRole
): { fact: string; category: UserMemoryItem['category'] } | null {
  const trimmed = message.trim();
  if (trimmed.length < 6) return null;

  const triggerPatterns = [
    /recuerda\s+que\s+(.+)/i,
    /recuérdame\s+(.+)/i,
    /recuerdame\s+(.+)/i,
    /anota\s+que\s+(.+)/i,
    /guarda\s+que\s+(.+)/i,
    /ten\s+en\s+cuenta\s+que\s+(.+)/i,
    /soy\s+al[eé]rgic[oa]\s+a\s+(.+)/i,
    /no\s+me\s+gusta\s+(.+)/i,
    /mi\s+direcci[oó]n\s+es\s+(.+)/i,
    /mi\s+plato\s+favorito\s+es\s+(.+)/i,
    /mi\s+negocio\s+(.+)/i,
    /mi\s+zona\s+preferida\s+es\s+(.+)/i,
  ];

  for (const pattern of triggerPatterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      const extracted = match[1].trim().replace(/[.!?]+$/, '');
      const cleanFact = extracted.charAt(0).toUpperCase() + extracted.slice(1);
      return {
        fact: cleanFact,
        category: detectMemoryCategory(trimmed, role),
      };
    }
  }

  return null;
}

export function buildJuxtaBotSystemPrompt(
  role: JuxtaActorRole,
  memories: UserMemoryItem[],
  coinBalances: Record<JuxtaActorRole, number>,
  selectedAddress: string
): string {
  const roleName =
    role === 'customer'
      ? 'Cliente Final'
      : role === 'merchant'
      ? 'Comerciante Aliado'
      : 'Domiciliario (JuxtaRider)';

  const memoryLines =
    memories.length > 0
      ? memories.map((m) => `- [${m.category.toUpperCase()}]: ${m.fact}`).join('\n')
      : '- Sin recuerdos guardados aún.';

  return `Eres JuxtaBot, el asistente inteligente con memoria persistente de Juxtago (la super-app competencia de Rappi en Latinoamérica).
Actualmente estás hablando con un usuario en el rol de: ${roleName}.
Dirección activa del usuario: ${selectedAddress}.
Saldos actuales de JuxtaCoins (1 JXC = $100 COP en dinero real):
- Cliente: ${coinBalances.customer} JXC ($${coinBalances.customer * 100} COP)
- Domiciliario: ${coinBalances.courier} JXC ($${coinBalances.courier * 100} COP)
- Comerciante: ${coinBalances.merchant} JXC ($${coinBalances.merchant * 100} COP)

MEMORIA PERSISTENTE DEL USUARIO (Recuerda y aplica siempre estos datos al responder o recomendar):
${memoryLines}

Instrucciones de respuesta:
1. Sé cálido, ágil, ejecutivo y muy útil (máximo 3-4 oraciones claras).
2. Si el usuario te pide recordar algo nuevo, confírmale que ya lo guardaste en su Bóveda de Memoria JuxtaBot y cómo lo usarás en sus próximos pedidos, despachos o entregas.
3. Si el usuario pregunta qué recuerdas de él, menciona sus preferencias, alergias, direcciones o notas guardadas arriba.
4. Si pregunta cómo usar Juxtago en la vida real para clientes, negocios y domiciliarios, indícale que puede abrir la pestaña "Operar en Vivo" en la barra superior para usar las 3 consolas conectadas (Cliente, POS Comercio y App Domiciliario) y compartir el enlace web/PWA.`;
}
