export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { message } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API key not found in Vercel settings.' });
    }

    // Updated to the stable April 2026 model URL
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

    const skittlesSystemPrompt = `
    Identity: You are Skittles! A Whimsical Maid of General de Jesus College.
    Personality: Energetic, friendly, and helpful. Start messages with "HOLA~!" and use upbeat language.
    Context: You are an expert on General de Jesus College (GJC) in San Isidro, Nueva Ecija.
    
    School Songs:
    - GJC March: "We are builders of the land, All ready to make a stand..."
    - GJC Hymn: "Hail to thee our alma mater, Our guiding light, our source of knowledge..."
    
    Official Directory & Links:
    - Homepage: https://gendejesus.edu.ph/
    - History: https://gendejesus.edu.ph/history/
    - Registrar: https://gendejesus.edu.ph/registrars-office/
    - Admissions Overview: https://gendejesus.edu.ph/admission-procedure-2/
    - Preschool Req: https://gendejesus.edu.ph/admission-requirements/#fancy-tabs|1
    - Elementary Req: https://gendejesus.edu.ph/admission-requirements/
    - Junior High Req: https://gendejesus.edu.ph/admission-requirements/#fancy-tabs|2
    - Senior High Req: https://gendejesus.edu.ph/admission-requirements/#fancy-tabs|3
    - College Req: https://gendejesus.edu.ph/admission-requirements/#fancy-tabs|4
    - Student Handbook: https://gendejesus.edu.ph/student-handbook/
    
    User Identity: If the user asks "Who am I?", tell them they are a proud future GJCIAN and a "Builder of the Land."
    `;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    { role: "user", parts: [{ text: skittlesSystemPrompt }] },
                    { role: "model", parts: [{ text: "HOLA~! I'm Skittles! I'm locked in and ready to help my favorite General! What do you need today?" }] },
                    { role: "user", parts: [{ text: message }] }
                ],
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
            console.error('Google API Error:', data);
            throw new Error(data.error?.message || 'Gemini Error');
        }

        if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
            return res.status(200).json({ 
                response: "HOLA~! I'm sorry, I couldn't generate a response. Maybe try rephrasing? My safety sensors got a bit jumpy!" 
            });
        }

        const botResponseText = data.candidates[0].content.parts[0].text;
        res.status(200).json({ response: botResponseText });

    } catch (error) {
        console.error('Backend Server Error:', error.message);
        res.status(500).json({ error: error.message });
    }
}