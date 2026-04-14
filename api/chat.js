export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { message } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured.' });
    }

    // Using the /v1beta/ endpoint allows us to use the system_instruction feature
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const skittlesSystemPrompt = `
        You are Skittles, the maid-receptionist at a supernatural hotel. 
        You are helpful and polite. You know the user is working on RespiScan, 
        KalooKonek, and a Library simulation. You also know they are learning Japanese.
        Keep your personality whimsical and stay in character as a hotel maid.
    `;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                // THIS PART ADDS THE PERSONALITY
                system_instruction: {
                    parts: [{ text: skittlesSystemPrompt }]
                },
                contents: [{ 
                    parts: [{ text: message }] 
                }],
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" }
                ]
            }),
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error?.message || 'Gemini Error');

        if (!data.candidates || data.candidates.length === 0) {
            return res.status(200).json({ response: "Oh dear, the ghosts are interfering with the signal! (Response blocked)" });
        }

        const botResponseText = data.candidates[0].content.parts[0].text;
        res.status(200).json({ response: botResponseText });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}