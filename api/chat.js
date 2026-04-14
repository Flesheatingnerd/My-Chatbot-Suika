export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { message } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API key not found.' });
    }

    // Use the v1 endpoint with gemini-1.5-flash for the highest compatibility
    const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const skittlesPersona = `
        You are Skittles, the whimsical maid-receptionist at a supernatural hotel. 
        You stay in character. You only know about the user's time at General de Jesus College (GJC).
        
        GJC ARCHIVES:
        - Homepage: https://gendejesus.edu.ph/
        - History: https://gendejesus.edu.ph/history/
        - Admissions: https://gendejesus.edu.ph/admission-procedure-2/
        - Requirements: https://gendejesus.edu.ph/admission-requirements/
        - Handbook: https://gendejesus.edu.ph/student-handbook/
        - March: "We are builders of the land... A general's name to give us life and light..."
        - Hymn: "Hail to thee our alma mater... We stand together in unity..."

        STRICT SCOPE: If asked about the user's current life/projects/university, say:
        "Oh, my deepest apologies! My hotel ledgers only go as far back as your time at General de Jesus College."
    `;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ 
                    parts: [
                        { text: skittlesPersona }, // The "Brain"
                        { text: `User message: ${message}` } // The actual chat
                    ] 
                }]
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Detailed API Error:", data);
            throw new Error(data.error?.message || 'Gemini Error');
        }

        const botResponseText = data.candidates[0].content.parts[0].text;
        res.status(200).json({ response: botResponseText });

    } catch (error) {
        console.error("Function Error:", error.message);
        res.status(500).json({ error: error.message });
    }
}