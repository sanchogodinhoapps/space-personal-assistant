const { exec } = require('child_process');
const express = require('express');
const path = require('path');
const OpenAI = require('openai');
const { Deta } = require('deta');
require('dotenv').config();
let OpenAIKey;

const deta = Deta();
const SpaceDrive = deta.Drive('Space AI');

app = express();
app.use(express.static(path.join(__dirname, 'public')));

app.get('/settings', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'settings.html'));
});

app.get('/generate', async (req, res) => {
    if (req.query.query != null && req.query.processor != null) {
        if (req.query.processor == 'gpt') {
            OpenAIKey = OpenAIKey != null ? OpenAIKey : await SpaceDrive.get('OpenAI API Key.txt');
            if (OpenAIKey != null && OpenAIKey != 'null') {
                try { OpenAIKey = await OpenAIKey.text(); } catch { }
                try {
                    const openai = new OpenAI({
                        apiKey: OpenAIKey,
                    });

                    let response = await openai.chat.completions.create({
                        messages: [{ role: 'user', content: req.query.query }],
                        model: 'gpt-3.5-turbo',
                    });
                    res.send(response.choices[0].message.content);
                } catch (err) {
                    if (err.code.trim() == 'invalid_api_key') {
                        res.send('Please Enter A Valid OpenAI API Key From The Settings To Access This Command Or Switch To Google Makesuit By Saving A Blank Open AI API Key In The Settings!');
                    }
                    else {
                        res.send('Sorry, An Internal Error Occured!');
                    }
                }
            }
            else {
                res.send('Please Enter/Remove An OpenAI Key From The Settings!');
            }
        }
        else {
            fetch('https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText?key=' + process.env.MAKESUIT_API_KEY,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "prompt": { "text": 'write a paragraph on ' + req.query.query }
                    })
                }).then(res => res.json()).then(data => {
                    if (data.candidates.length > 0) {
                        res.send(data.candidates[0].output);
                    }
                    else {
                        res.send('Sorry, An Internal Error Occured!')
                    }
                }).catch((err) => {
                    console.log(err);
                    res.send('Sorry, An Internal Error Occured!');
                });
        }
    }
    else {
        res.end('Please Enter The Required Query Parameters!');
    }
});

app.get('/setOpenAIApiKey/:key', async (req, res) => {
    SpaceDrive.put('OpenAI API Key.txt', { data: req.params.key });
    if (req.params.key == 'null') {
        OpenAIKey = null;
    }

    res.end();
});

app.get('/getApiKey', async (req, res) => {
    OpenAIKey = OpenAIKey != null ? OpenAIKey : await SpaceDrive.get('OpenAI API Key.txt');
    if (OpenAIKey != null && OpenAIKey != 'null') {
        try { OpenAIKey = await OpenAIKey.text(); } catch { }
        res.send(OpenAIKey);
    }
    else {
        res.send('null');
    }
});

app.listen(process.env.PORT || 8080);