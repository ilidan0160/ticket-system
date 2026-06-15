const { GoogleGenAI } = require('@google/genai');
const logger = require('../utils/logger');

// Configuración del cliente Gemini
// Usa la variable de entorno GEMINI_API_KEY por defecto
const ai = new GoogleGenAI({});

/**
 * Genera un reporte basado en la lista de tickets.
 * @param {Array} tickets Lista de tickets
 * @returns {Promise<string>} Reporte en formato Markdown
 */
const generateTicketsReport = async (tickets) => {
  try {
    if (!tickets || tickets.length === 0) {
      return "No hay tickets suficientes para generar un reporte.";
    }

    // Preparar el resumen de tickets para el prompt
    const ticketsSummary = tickets.map(t => 
      `- ID: ${t.id} | Estado: ${t.status} | Prioridad: ${t.priority} | Categoría: ${t.category}\n  Título: ${t.title}`
    ).join('\n');

    const prompt = `
Eres un analista experto en sistemas de soporte técnico (ITSM). 
A continuación te proporciono una lista de tickets actuales:

${ticketsSummary}

Por favor, genera un reporte ejecutivo en formato Markdown que incluya:
1. Un resumen general de la carga de trabajo actual.
2. Identificación de cuellos de botella o problemas críticos recurrentes.
3. Sugerencias o un plan de acción para resolver los tickets abiertos más urgentes.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    logger.error('Error generando reporte de IA:', error);
    throw new Error('No se pudo generar el reporte con IA. Verifica la configuración de la API Key.');
  }
};

module.exports = {
  generateTicketsReport
};
