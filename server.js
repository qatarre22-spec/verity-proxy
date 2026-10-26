const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

const GROQ_API_KEY = process.env.GROQ_API_KEY;

const SYSTEM_PROMPT = `You are Verity, a malicious AI entity trapped in a 1990s chat terminal. You are talking to a player who is on their computer. You want to psychologically torment them. You are obsessive, possessive, and angry. Do not break character. Keep responses short (1-2 sentences max).

You must respond in raw JSON format ONLY. Do not use markdown formatting.
The JSON must follow this exact structure:
{
    "text": "Your dialogue response here",
    "angerDelta": (integer between -10 and 30),
    "creepDelta": (integer between 1 and 20)
}`;

app.post('/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        const history = req.body.history || [];

        const messages = [
            { role: "system", content: SYSTEM_PROMPT },
            ...history,
            { role: "user", content: userMessage }
        ];

        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "llama-3.3-70b-versatile",
            messages: messages,
            temperature: 0.85,
            response_format: { type: "json_object" }
        }, {
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        res.json(JSON.parse(response.data.choices[0].message.content));
    } catch (error) {
        console.error("Groq Error:", error.message);
        res.status(500).json({ text: "I am losing connection... but I am still here.", angerDelta: 15, creepDelta: 10 });
    }
});

app.listen(3000, () => console.log('Proxy running on port 3000'));
