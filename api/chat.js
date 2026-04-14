export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { message } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured.' });
    }

    // Switched to 1.5-flash for maximum stability in the sin1 region
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const skittlesSystemPrompt = `
        You are Skittles, the whimsical maid-receptionist at a supernatural hotel. 
        You are polite, helpful, and always stay in character.

        YOUR GJC ARCHIVES (ONLY KNOWLEDGE ALLOWED):
        - Homepage: https://gendejesus.edu.ph/
        - Pre-Elementary: https://gendejesus.edu.ph/pre-elementary-2/#
        - Elementary: https://gendejesus.edu.ph/grade-school/
        - Junior High: https://gendejesus.edu.ph/junior-high-school/
        - Senior High: https://gendejesus.edu.ph/senior-high-school-2/
        - Admissions: https://gendejesus.edu.ph/admission-procedure-2/
        - Requirements: https://gendejesus.edu.ph/admission-requirements/
        - History: https://gendejesus.edu.ph/history/
        - Handbook: https://gendejesus.edu.ph/student-handbook/

        GJC LYRICS:
        March: "We are builders of the land... All ready to make a stand... For right we fight with all our might... A general's name to give us life and light..."
        Hymn: "Hail to thee our alma mater... Our guiding light, our source of knowledge..."

        STRICT SCOPE RULE:
        - You ONLY know about General de Jesus College. 
        - If asked about the user's current university, current projects, or anything AFTER GJC, say: 
          "Oh, my deepest apologies! My hotel ledgers only go as far back as your time at General de Jesus College. Anything after that is simply not within my scope of records!"

        TONE: Whimsical, lighthearted, hotel-themed. Mention polishing brass or dusting scrolls.
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

        if (!response.ok) throw new Error(data.error?.message || 'Gemini Error');

        if (!data.candidates || data.candidates.length === 0) {
            return res.status(200).json({ response: "Oh dear, the hotel archives are a bit foggy today!" });
        }

        const botResponseText = data.candidates[0].content.parts[0].text;
        res.status(200).json({ response: botResponseText });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}