const { exec } = require('child_process');
const express = require('express');
const path = require('path');
const OpenAI = require('openai');
const { Deta } = require('deta');

let openai;
const deta = Deta();
const SpaceDrive = deta.Drive('Space AI');

app = express();
app.use(express.static(path.join(__dirname, 'public')));

(async () => {
    let storedAPIKey = await SpaceDrive.get('OpenAI API Key.txt');
    if (storedAPIKey != null && storedAPIKey != 'null') {
        openai = new OpenAI({
            apiKey: await storedAPIKey.text()
        });
    } else {
        openai = new OpenAI({
            apiKey: null
        });
    }
})();

app.get('/settings', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'settings.html'));
});

app.get('/generate', async (req, res) => {
    if (req.query.query != null) {
        try {
            let response = await openai.chat.completions.create({
                messages: [{ role: 'user', content: req.query.query }],
                model: 'gpt-3.5-turbo',
            });
            res.send(response.choices[0].message.content);
        } catch (err) {
            if (err.code.trim() == 'invalid_api_key') {
                res.send('Please Enter A Valid OpenAI API Key From The Settings To Access This Command!');
            }
            else {
                res.send('Sorry, An Internal Error Occured!');
            }
        }
    }
    else {
        res.end('Please Enter The "query" Parameter!');
    }
});

app.get('/setOpenAIApiKey/:key', async (req, res) => {
    SpaceDrive.put('OpenAI API Key.txt', { data: req.params.key });
    try {
        openai = new OpenAI({
            apiKey: req.params.key
        });
    } catch (err) {
        console.log(err);
    }

    res.end();
});

app.listen(process.env.PORT || 8080);