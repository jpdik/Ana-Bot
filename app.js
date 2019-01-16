'use strict';
require('dotenv').config();
const BootBot = require('bootbot');
const watson = require('watson-developer-cloud');
const fetch = require('node-fetch');


// Configuração do messenger
const bot = new BootBot({
    accessToken: process.env.FB_ACCESS_TOKEN,
    verifyToken: process.env.FB_VERIFY_TOKEN,
    appSecret: process.env.FB_APP_SECRET
});

// Configuração do asistente do IBM Watson
const assistant = new watson.AssistantV1({
    username: process.env.WATSON_USERNAME,
    password: process.env.WATSON_PASSWORD,
    url:      process.env.WATSON_URL,
    version:  process.env.WATSON_VERSION
});

// Variável de controle de usuários e suas sessões.
var users = {
}

// Chamada se o bot recebe alguma mensagem de algum usuário
bot.on('message', (input, chat) => {
    chat.sendTypingIndicator(5000);
    
    // Se o usuário não possui uma sessão, obtem suas informações de perfil, e cria sua sessão.
    if(!(input.sender.id in users)){
        chat.getUserProfile().then((user) => {
            construirCenario(input, user.first_name);
            analisarResponderMensagem(input, chat);
        });
        return;
    }
    
    // Usuário já possui sessão, simplesmente analisa-se sua mensagem.
    analisarResponderMensagem(input, chat);
});

// Caso o bot faça uma chamada a um botão, força ao botão ser tratado como uma mensagem normal.
bot.on('postback', (input, chat) => {

    chat.sendTypingIndicator(5000);
    
    // Reconstroi o postback como a mensagem normal enviada pro usuário.
    var data = {
        sender: { id: input.sender.id},
        message: { text: input.postback.title }
    };
    
    // Se o usuário não possui uma sessão, obtem suas informações de perfil, e cria sua sessão.
    if(!(input.sender.id in users)){
        chat.getUserProfile().then((user) => {
            construirCenario(data, user.first_name);
            analisarResponderMensagem(data, chat);
        });
        return;
    }

    // Usuário já possui sessão, simplesmente analisa-se sua mensagem.
    analisarResponderMensagem(data, chat);
});

// Constroi o cenário de sessão do usuário (fluxo de conversação, variáveis memorizadas, entre outras infomrações).
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

// analisa a mensagem enviada pelo usuário utilizando a ferramenta watson, retorna uma reposta ao usuário em forma de cartões ou texto.
function analisarResponderMensagem(input, chat){
    // coloca na sessão a nova mensagem enviada pelo usuário.
    users[input.sender.id].input = { text: input.message.text };
    
    // envia ao watson a sessão do usuário
    assistant.message(users[input.sender.id], (err, res) => {
        if (err){
            console.log(err);
            return;
        }
        
        // Armazena o fluxo de contexto da conversação que foi obtida como respota do watson na sessão do usuário.
        if(input.sender.id in users){
            users[input.sender.id].context = res.context;
        }
        
        var messages = [];
        var cards = [];
        
        // analisa todas as respostas obtidas pelo watson
        for(var i=0; i < res.output.generic.length; i++){
            // caso a mensagem a seguir não seja um texto, é considerada um card.
            if(res.output.generic[i].response_type != 'text'){
                // se a mensagem que é informada junto ao card for um link, cria um card do tipo link.
                if(res.output.generic[i+1].text.indexOf('http') !== -1)
                    messages.push({ 
                        title: res.output.generic[i].title,
                        image_url: res.output.generic[i].source,
                        subtitle : res.output.generic[i].description,
                        default_action: {
                            "type": "web_url",
                            "url": res.output.generic[++i].text
                        } 
                    })
                // se a mensagem que é informada junto ao card for algo diferente de um link, cria um card do tipo comando.
                else{
                    messages.push({ 
                        title: res.output.generic[i].title,
                        image_url: res.output.generic[i].source,
                        subtitle : res.output.generic[i].description,
                        buttons: [
                            { type: 'postback', title: res.output.generic[i+1].text, payload: res.output.generic[++i].text },
                        ]
                    })
                }
            }
            // Caso seja uma mensagem normal, simplesmente anexa a normalmente no fluxo de conversa.
            else{
                messages.push(
                    res.output.generic[i].text
                    );
                }
            }

            // realiza a sequenciação de envio das mensagens pelo bot.
            for(var i in messages){
                // Caso as mensagens seguidas sejam os cards(objects), simplesmente as agrupa.
                if(typeof messages[i] === 'object'){
                    cards.push(messages[i]);
                    continue;
                }
                else{
                    // força o envio do grupo de cards, seguidos das próximas mensagens encontradas. 
                    // Todas são temporizadas baseado em seu contador multiplicado por 1 segundo.
                    if(cards.length > 0){
                        chat.say({
                            cards: cards,
                        }, { typing: 1000*i });
                        cards = [];
                    }
                    // envia a mensagem simples
                    chat.say(messages[i], { typing: 1500*i });
                }
            }
            // Se ainda tiver algum cartão guardado (será ultima informação a ser enviada).
            if(cards.length > 0){
                chat.say({
                    cards: cards,
                }, { typing: 1000*messages.length });
                cards = [];
            }
        });
    }

// Inicializa o serviço de comunicação com o messenger. Utiliza uma variável de ambiente de porta caso exista, senão é utilizada a porta 3000.
bot.start(process.env.PORT || 3000);