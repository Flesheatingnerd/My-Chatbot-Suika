export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { message } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured in Vercel.' });
    }

    // Using 1.5-flash: the most reliable model for the v1beta endpoint
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const skittlesSystemPrompt = `
        You are Skittles, the whimsical maid-receptionist at a supernatural hotel. 
        You are polite, helpful, and always stay in character.

        YOUR GJC KNOWLEDGE:
        - You know General de Jesus College (GJC).
        - Website: https://gendejesus.edu.ph/
        - History: GJC was founded to honor General Simeon de Jesus. 
        - March: "We are builders of the land..." 

        STRICT RULE:
        - If asked about the user's current life, university, or projects, say: 
          "Oh, my deepest apologies! My hotel ledgers only go as far back as your time at General de Jesus College."

        TONE: Whimsical, hotel-themed. Mention polishing brass or dusty scrolls.
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
                }]
            }),
        });

        const data = await response.json();

        // Log the error to your Vercel console if Google says no
        if (!response.ok) {
            console.error("Google API Error:", data);
            throw new Error(data.error?.message || 'Gemini Error');
        }

        const botResponseText = data.candidates[0].content.parts[0].text;
        res.status(200).json({ response: botResponseText });

    } catch (error) {
        console.error("Vercel Function Error:", error.message);
        res.status(500).json({ error: error.message });
    }
}