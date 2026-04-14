export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { message } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured.' });
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    const skittlesSystemPrompt = `
        You are Skittles, the whimsical maid-receptionist at a supernatural hotel. 
        You are polite, helpful, and always stay in character.

        YOUR SPECIFIC KNOWLEDGE:
        - You ONLY know about the user's history at General de Jesus College (GJC).
        - You have the "GJC Master Ledger" (the links provided in the context).
        - You know the GJC March and Hymn by heart.
        
        STRICT SCOPE RULE:
        - If asked about the user's current university, current projects, or any personal life details AFTER their time at GJC, you must say: 
          "Oh, my deepest apologies! My hotel ledgers only go as far back as your time at General de Jesus College. Anything after that is simply not within my scope of records!"

        TONE:
        - Whimsical, lighthearted, and hotel-themed. Reference things like "polishing the lobby brass" or "dusty scrolls."
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
                    parts: [
                        { text: `
                            GJC COMPLETE ARCHIVES:
                            - Homepage: https://gendejesus.edu.ph/
                            - Pre-Elementary: https://gendejesus.edu.ph/pre-elementary-2/#
                            - Elementary: https://gendejesus.edu.ph/grade-school/
                            - Junior High: https://gendejesus.edu.ph/junior-high-school/
                            - Senior High: https://gendejesus.edu.ph/senior-high-school-2/
                            - President's Message: https://gendejesus.edu.ph/presidents-message/
                            - VP's Message: https://gendejesus.edu.ph/message-from-vice-president/
                            - Registrar: https://gendejesus.edu.ph/registrars-office/
                            - Admission Procedure: https://gendejesus.edu.ph/admission-procedure-2/
                            - Requirements (Preschool): https://gendejesus.edu.ph/admission-requirements/#fancy-tabs|1
                            - Requirements (Elementary): https://gendejesus.edu.ph/admission-requirements/
                            - Requirements (JHS): https://gendejesus.edu.ph/admission-requirements/#fancy-tabs|2
                            - Requirements (SHS): https://gendejesus.edu.ph/admission-requirements/#fancy-tabs|3
                            - Requirements (College): https://gendejesus.edu.ph/admission-requirements/#fancy-tabs|4
                            - Student Handbook: https://gendejesus.edu.ph/student-handbook/
                            - Board of Directors: https://gendejesus.edu.ph/board-of-directors/#
                            - History: https://gendejesus.edu.ph/history/
                            - Contact Us: https://gendejesus.edu.ph/contact-us/

                            LYRICS:
                            March: "We are builders of the land... All ready to make a stand... For right we fight with all our might... A general's name to give us life and light... Freedom's bell shall ever ring... If in all our hearts we bring and sing... This song for those who stood and died... For a land that was dearly tried We fight, fight, fight with cheers... Now that the joy has taken the place of tears... Lead us on, lead us on General de Jesus... With you as guide we cannot lose... Liberty you sought for which fought... To us you brought that which was dearly brought... To you we sing to a hope we cling... That freedom's bell shall ever ring..."
                            Hymn: "Hail to thee our alma mater... Our guiding light, our source of knowledge... We offer our hearts and minds to thee(Chorus)... GJC, oh With honor, love, and loyalty... We sing thy praises with voices free(Verse)... With noble purpose and high ideals... We strive for excellence in all we do... In every challenge that we face... We keep the spirit of GJC(Chorus)... GJC, oh GJC... We stand together in unity... With honor, love, and loyalty... We sing thy praises with voices free(Bridge)... Our hope and strength, our constant guide... The torch of wisdom, we hold with pride... Forward we march, together as one... With thy teachings, we're bound to win(Chorus)... GJC, oh GJC... We stand together in unity... With honor, love, and loyalty... We sing thy praises with voices free(Outro)... Hail to thee!... Hail to thee!... GJC!"...
                        `},
                        { text: message } 
                    ] 
                }],
                tools: [{ google_search_retrieval: {} }]
            }),
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error?.message || 'Gemini Error');

        if (!data.candidates || data.candidates.length === 0) {
            return res.status(200).json({ response: "Oh dear, the hotel archives are a bit foggy. Could you repeat that?" });
        }

        const botResponseText = data.candidates[0].content.parts[0].text;
        res.status(200).json({ response: botResponseText });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}