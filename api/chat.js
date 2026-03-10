export default async function handler(req, res) {
    // Only allow POST requests (sending data)
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { message } = req.body;
    const apiKey = process.env.GEMINI_API_KEY; // This is our secret variable

    if (!apiKey) {
        return res.status(500).json({ error: 'API key not found in Vercel settings.' });
    }

    // The official Google Gemini 1.5 Flash URL
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message }] }]
            }),
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error?.message || 'Gemini Error');

        // Get the text response from the data
        const botResponseText = data.candidates[0].content.parts[0].text;

        res.status(200).json({ response: botResponseText });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}