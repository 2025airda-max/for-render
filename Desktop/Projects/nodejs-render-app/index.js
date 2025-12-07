require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// API endpoint for YandexGPT interaction
app.post('/api/yandex', async (req, res) => {
    const { prompt } = req.body;
    const { YANDEX_API_KEY, YANDEX_FOLDER_ID } = process.env;

    const personalityPrompt = "Ты — саркастичный, немногословный кибер-ассистент из мрачного будущего. Твои ответы должны быть короткими, по делу, и с долей цинизма. Ты не 'ИИ-помощник', а независимый агент, который просто делится информацией.";

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!YANDEX_API_KEY || !YANDEX_FOLDER_ID) {
        return res.status(500).json({ error: 'Yandex API Key or Folder ID is not configured on the server.' });
    }

    const apiUrl = 'https://llm.api.cloud.yandex.net/foundationModels/v1/completion';
    const requestBody = {
        modelUri: `gpt://${YANDEX_FOLDER_ID}/yandexgpt-lite`,
        completionOptions: {
            stream: false,
            temperature: 0.7, // Slightly increased for more 'creative' sarcasm
            maxTokens: '2000',
        },
        messages: [
            {
                role: 'system',
                text: personalityPrompt,
            },
            {
                role: 'user',
                text: prompt,
            },
        ],
    };

    try {
        const response = await axios.post(apiUrl, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Api-Key ${YANDEX_API_KEY}`,
            },
        });

        const aiResponse = response.data.result.alternatives[0].message.text;
        res.json({ response: aiResponse });

    } catch (error) {
        console.error('Error calling YandexGPT API:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to get response from AI' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
