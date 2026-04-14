export default async function handler(req, res) {
    // 1. Only allow POST requests (sending data)
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { message } = req.body;
    const apiKey = process.env.GEMINI_API_KEY; // This must match your Vercel Environment Variable name

    // 2. Security Check: Ensure the API key exists
    if (!apiKey) {
        return res.status(500).json({ error: 'API key not found in Vercel settings.' });
    }

    // 3. The Correct Stable URL (using /v1/ for Gemini 2.5 Flash)
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ text: message }] 
                }],
                // Added safety settings to prevent unnecessary blocking
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                ]
            }),
        });

        const data = await response.json();

        // 4. Handle Google API Errors (like invalid keys or wrong URLs)
        if (!response.ok) {
            console.error('Google API Error:', data);
            throw new Error(data.error?.message || 'Gemini Error');
        }

        // 5. Safety Check: Ensure the AI actually returned a response
        // This prevents the "candidates[0] is undefined" crash
        if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
            return res.status(200).json({ 
                response: "I'm sorry, I couldn't generate a response. It might have been filtered by safety settings." 
            });
        }

        // 6. Extract the text safely
        const botResponseText = data.candidates[0].content.parts[0].text;

        // 7. Send the successful response back to your chatbot.js
        res.status(200).json({ response: botResponseText });

    } catch (error) {
        // Log the error to your Vercel Dashboard so you can see it
        console.error('Backend Server Error:', error.message);
        res.status(500).json({ error: error.message });
    }
}