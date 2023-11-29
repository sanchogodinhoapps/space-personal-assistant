const express = require('express');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config();

app = express();
app.use(require('cookie-parser')());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/ai', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'ai.html'));
});

app.get('/settings', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'settings.html'));
});

app.get('/generate', async (req, res) => {
    if (req.query.query != null) {
        if (req.cookies.ChatGPT_API_Key != null) {
            try {
                const openai = new OpenAI({
                    apiKey: req.cookies.ChatGPT_API_Key,
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
            fetch('https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText?key=' + process.env.MAKESUIT_API_KEY,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "prompt": { "text": 'You are Space AI, a voice assistant that answers your commands created by Sancho Godinho at SG Apps. You can only answer in text and not markdown. Write a paragraph on ' + req.query.query }
                    })
                }).then(res => res.json()).then(data => {
                    if (data.candidates.length > 0) {
                        res.send(data.candidates[0].output);
                    }
                    else {
                        res.send('Sorry, An Internal Error Occured!');
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

app.get('/setChatGPT_API_Key', async (req, res) => {
    if (req.query.key != null && req.query.key.trim() != '') {
        res.cookie('ChatGPT_API_Key', req.query.key, { maxAge: 900000, httpOnly: true });
    }
    else {
        res.clearCookie('ChatGPT_API_Key');
    }
    res.end();
});

app.get('/getChatGPT_API_Key', async (req, res) => {
    res.send(req.cookies.ChatGPT_API_Key != null ? req.cookies.ChatGPT_API_Key : '');
});

app.listen(process.env.PORT || 8080);