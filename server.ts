import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import {
  extractMemoryFromMessage,
  buildJuxtaBotSystemPrompt,
  detectMemoryCategory,
} from './src/utils/memoryEngine.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // POST /api/juxtabot/chat
  app.post('/api/juxtabot/chat', async (req, res) => {
    const {
      message = '',
      role = 'customer',
      memories = [],
      coinBalances = { customer: 315, courier: 540, merchant: 2380 },
      selectedAddress = 'Calle 93 #11-20, Bogotá',
    } = req.body || {};

    const deterministicExtracted = extractMemoryFromMessage(message, role);

    const systemInstruction = buildJuxtaBotSystemPrompt(
      role,
      memories,
      coinBalances,
      selectedAddress
    );

    const ai = getGeminiClient();

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: message,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                reply: {
                  type: Type.STRING,
                  description: 'Respuesta cálida y útil de JuxtaBot en español.',
                },
                newMemoryFact: {
                  type: Type.STRING,
                  description:
                    'Si el usuario compartió un dato personal, alergia, preferencia, dirección, regla de negocio o ruta que deba recordarse, escríbelo aquí en una oración corta. Si no hay dato nuevo que guardar, deja cadena vacía "".',
                },
              },
              required: ['reply', 'newMemoryFact'],
            },
          },
        });

        const rawText = (response.text ?? '{}').trim();
        const parsed = JSON.parse(rawText);

        const factToSave =
          deterministicExtracted?.fact ||
          (parsed.newMemoryFact && parsed.newMemoryFact.trim().length > 3
            ? parsed.newMemoryFact.trim()
            : null);

        const extractedMemory = factToSave
          ? {
              fact: factToSave,
              category:
                deterministicExtracted?.category || detectMemoryCategory(factToSave, role),
            }
          : null;

        return res.json({
          reply:
            parsed.reply ||
            '¡Listo! He actualizado tu información en tu Bóveda de Memoria de JuxtaBot.',
          extractedMemory,
          source: 'gemini-3.8-flash',
        });
      } catch (err: any) {
        const errMessage = err?.message || String(err);
        // Smart memory-aware response when quota or API error occurs
        const roleMemories = memories.filter((m: any) => !m.role || m.role === role);
        let fallbackReply = '';

        if (deterministicExtracted) {
          fallbackReply = `¡Anotado en tu Bóveda de Memoria JuxtaBot! Recordaré siempre: "${deterministicExtracted.fact}" (${deterministicExtracted.category}) para aplicarlo automáticamente en tus próximos pedidos y entregas.`;
        } else if (message.toLowerCase().includes('recuerda') || message.toLowerCase().includes('sabes de mi') || message.toLowerCase().includes('qué sabes') || message.toLowerCase().includes('que sabes')) {
          const listStr = roleMemories.map((m: any) => `• ${m.fact}`).join('\n');
          fallbackReply = `Esto es lo que tengo guardado en tu Bóveda de Memoria JuxtaBot:\n${listStr || 'Aún no tienes recuerdos extra.'}\n\nAdemás tienes ${coinBalances[role] || 0} JuxtaCoins listos para canjear por dinero real.`;
        } else if (message.toLowerCase().includes('realidad') || message.toLowerCase().includes('negocio') || message.toLowerCase().includes('domiciliario')) {
          fallbackReply = `Para operar Juxtago en la vida real con Clientes, Negocios y Domiciliarios, abre la pestaña "Operar en Vivo" arriba: ahí tienes las 3 consolas conectadas en tiempo real (App Cliente, POS Comercio y App Domiciliario) y el enlace listo para compartir.`;
        } else {
          const firstMem = roleMemories[0]?.fact
            ? ` Teniendo en cuenta que "${roleMemories[0].fact}",`
            : '';
          fallbackReply = `¡Hola! Soy JuxtaBot.${firstMem} puedo ayudarte a pedir en base a tus gustos, recordar alergias o direcciones en tu Bóveda de Memoria, o gestionar tus ${coinBalances[role] || 0} JuxtaCoins ($${(coinBalances[role] || 0) * 100} COP).`;
        }

        return res.json({
          reply: fallbackReply,
          extractedMemory: deterministicExtracted,
          apiNotice: errMessage.includes('429') || errMessage.includes('quota')
            ? 'Modo Memoria Local Activo (Límite de cuota Gemini API alcanzado temporalmente)'
            : undefined,
        });
      }
    }

    // If no API key is configured, provide memory-aware assistant response
    const roleMemories = memories.filter((m: any) => !m.role || m.role === role);
    let reply = '';
    if (deterministicExtracted) {
      reply = `¡Guardado en tu Bóveda de Memoria JuxtaBot! A partir de ahora recordaré: "${deterministicExtracted.fact}" (${deterministicExtracted.category}).`;
    } else {
      const firstMem = roleMemories[0]?.fact
        ? ` Recuerdo de tu perfil: "${roleMemories[0].fact}".`
        : '';
      reply = `¡Hola! Soy JuxtaBot.${firstMem} Dime "Recuerda que..." para guardar cualquier preferencia, dirección, horario de tu negocio o ruta de domiciliario.`;
    }

    return res.json({
      reply,
      extractedMemory: deterministicExtracted,
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Juxtago Full-Stack Server running on http://localhost:${PORT}`);
  });
}

startServer();
