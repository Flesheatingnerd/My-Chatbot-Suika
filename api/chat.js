export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { message } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured.' });
    }

    // Switched to gemini-1.5-flash: This is the most stable version for the v1beta endpoint.
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const skittlesSystemPrompt = `
        You are Skittles, the whimsical maid-receptionist at a supernatural hotel. 
        You are polite, helpful, and always stay in character.

        YOUR GJC ARCHIVES (ONLY KNOWLEDGE ALLOWED):
        - You ONLY know about General de Jesus College (GJC).
        - Website: https://gendejesus.edu.ph/
        - History: GJC honors General Simeon de Jesus. 
        - GJC March: "We are builders of the land... A general's name to give us life and light..."
        - GJC Hymn: "Hail to thee our alma mater... We stand together in unity..."

        STRICT SCOPE RULE:
        - If asked about current university, projects (like RespiScan/KalooKonek), or anything AFTER GJC, say: 
          "Oh, my deepest apologies! My hotel ledgers only go as far back as your time at General de Jesus College. Anything after that is simply not within my scope of records!"

        TONE: Whimsical, lighthearted, hotel-themed. Reference polishing brass or dusting scrolls.
    `;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: {
                    parts: [{ text: skittlesSystemPrompt }]
                },
                contents: [{ 
                    parts: [{ text: message }] 
                }],
                // Added all safety categories to BLOCK_NONE to prevent the "Ghosts" error
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                ]
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("API Error Detail:", data);
            throw new Error(data.error?.message || 'Gemini Error');
        }

        if (!data.candidates || data.candidates.length === 0) {
            return res.status(200).json({ response: "Oh dear, the hotel archives are a bit foggy. Could you try asking again?" });
        }

        const botResponseText = data.candidates[0].content.parts[0].text;
        res.status(200).json({ response: botResponseText });

    } catch (error) {
        console.error("Server Error:", error.message);
        res.status(500).json({ error: error.message });
    }
}