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

bot.on('postback:GET_STARTED_PAYLOAD', (input, chat) => {
    chat.sendTypingIndicator(5000);
    
    var data = {
        sender: { id: input.sender.id},
        message: { text: input.postback.title }
    };
    
    if(!(input.sender.id in users)){
        chat.getUserProfile().then((user) => {
            construirCenario(data, user.first_name);
            analisarResponderMensagem(data, chat);
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
        
        var i;
        for(i=0;i < res.output.generic.length; i++){
            if(res.output.generic[i].response_type != 'text'){
                var cards = []
                
                cards.push({ 
                    title: res.output.generic[i].title,
                    image_url: res.output.generic[i].source,
                    subtitle : res.output.generic[i].description,
                    default_action: {
                        "type": "web_url",
                        "url": res.output.generic[++i].text
                    } 
                })
                
                chat.say({
                    cards: cards,
                }, { typing: 3000 });
            }
            else if(res.output.generic[i].text.length > 0){
                chat.say(res.output.text, { typing: 3000 });
            }    
        }  
    });
}