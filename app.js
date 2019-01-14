'use strict';
require('dotenv').config();
const BootBot = require('bootbot');
const watson = require('watson-developer-cloud');
const fetch = require('node-fetch');

const bot = new BootBot({
    accessToken: process.env.FB_ACCESS_TOKEN,
    verifyToken: process.env.FB_VERIFY_TOKEN,
    appSecret: process.env.FB_APP_SECRET
});

const assistant = new watson.AssistantV1({
    username: process.env.WATSON_USERNAME,
    password: process.env.WATSON_PASSWORD,
    url:      process.env.WATSON_URL,
    version:  process.env.WATSON_VERSION
});

var users = {
}

bot.on('message', (input, chat) => {
    chat.sendTypingIndicator(5000);
    
    if(!(input.sender.id in users)){
        chat.getUserProfile().then((user) => {
            construirCenario(input, user.first_name);
            analisarResponderMensagem(input, chat);
        });
        return;
    }
    
    analisarResponderMensagem(input, chat);
});

bot.start(process.env.PORT || 3000);

function construirCenario(input, username){
    var payload = {
        workspace_id: process.env.WATSON_WORKSPACE_ID,
        session_id: input.sender.id,
        context: { usern: username },
        input: { text: input.message.text }
    };
    
    users[input.sender.id] = payload;
    
    return payload;
}

function analisarResponderMensagem(input, chat){
    users[input.sender.id].input = { text: input.message.text };
    
    assistant.message(users[input.sender.id], (err, res) => {
        if (err){
            console.log(err);
            return;
        }
        
        if(input.sender.id in users){
            users[input.sender.id].context = res.context;
        }
        
        console.log(res.output.generic);
          
        if(res.output.generic.length > 0){
            chat.say({
                cards: [
                    { 
                        title: res.output.generic[0].title,
                        image_url: res.output.generic[0].source,
                        subtitle : res.output.generic[0].description,
                        default_action: {
                            "type": "web_url",
                            "url": res.output.text[0]
                        } 
                    }
                ],
            });
        }
        else if(res.output.text.length > 0){
            chat.say(res.output.text);
        }      
    });
}