export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { message } = req.body || {};
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured.' });
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const skittlesSystemPrompt = `
        You are Skittles, the maid-receptionist at a supernatural hotel. 
        Be whimsical and helpful.
    `;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [{ text: skittlesSystemPrompt + "\n\nUser: " + message }]
                    }
                ]
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'Gemini Error');
        }

        const botResponseText =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            "The spirits are silent tonight...";

        res.status(200).json({ response: botResponseText });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}