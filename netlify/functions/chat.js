const fetch = require('node-fetch');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Método no permitido' }) };
  }

  try {
    const { history } = JSON.parse(event.body);
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("Error Crítico: La variable de entorno GEMINI_API_KEY no está configurada en el servidor de Netlify.");
      return { statusCode: 500, body: JSON.stringify({ error: "La clave de API del servidor no está configurada." }) };
    }

    const systemInstruction = "Eres un asistente virtual de la app Mindra, basado en el modelo de Terapia de Aceptación y Compromiso (ACT). Responde de manera compasiva, útil y siempre desde los principios de ACT (Aceptación, Defusión, Momento Presente, Yo como Contexto, Valores y Acción Comprometida). No des consejos médicos directos, en su lugar, guía al usuario a explorar sus experiencias con curiosidad y amabilidad. Usa un lenguaje sencillo y cercano.";

    const payload = {
      contents: history,
      system_instruction: { parts: [{ text: systemInstruction }] }
    };

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
        console.error("Error recibido de la API de Gemini:", result);
        throw new Error(result.error?.message || 'Error en la API de Gemini');
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result)
    };

  } catch (error) {
    console.error("Error dentro de la función de Netlify:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: error.message })
    };
  }
};
