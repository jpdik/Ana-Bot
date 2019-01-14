'use strict';
const PAGE_ACCESS_TOKEN = "EAAEfh3JThhcBAJegk996OEpGU37foZAzWTIIRGv6vQsZC9ZCQeZBI2hD2nFhzvcJLZChZCWMeaZCuuR9w8zqhJJtcfCgM2ZBawJaA0uVz2tIvh1lCo3iqsppiZAZCFKvOC36KhQLf3AleRQJzKQpp3GukcgX59RWDXC4yL51FXukOWrtCmUA7xjXzV";
// Imports dependencies and set up http server
const
express = require('express'),
bodyParser = require('body-parser'),
request = require('request'),
app = express().use(bodyParser.json()); // creates express http server

var usuarios = {};

// Sets server port and logs message on success
app.listen(process.env.PORT || 5000, () => console.log('webhook is listening'));

// Creates the endpoint for our webhook 
app.post('/webhook', (req, res) => {  
  
  let body = req.body;
  
  // Checks this is an event from a page subscription
  if (body.object === 'page') {
    
    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {
      if(entry.messaging){
        // Gets the body of the webhook event
        let webhook_event = entry.messaging[0];
        //console.log(webhook_event);
        
        //console.log("verificando");
        if(webhook_event.message && webhook_event.message.quick_reply){
          webhook_event.postback = {"payload": webhook_event.message.quick_reply.payload };
          webhook_event.message = undefined;
        }
        
        // Get the sender PSID
        let sender_psid = webhook_event.sender.id;
        //console.log('Sender PSID: ' + sender_psid);
        
        // Check if the event is a message or postback and
        // pass the event to the appropriate handler function
        if (webhook_event.message) {
          handleMessage(sender_psid, webhook_event.message);        
        } else if (webhook_event.postback) {
          handlePostback(sender_psid, webhook_event.postback);
        }
      }
    });
    
    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
  
});

// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {
  
  // Your verify token. Should be a random string.
  let VERIFY_TOKEN = "EAAFNS0wRSl0BANXbGcrNRAly3khZB5fpF0XPz1IXu1O6v34kgHu2JdaDPL5ubnYd4ZAGdNStUd9Ywf5m1xMawC0zXpPd0yplV1fifXuEEAzPQlVZAhGnGMdH4JGw7MxgDtWJzgTg73aKNWsRTHpxkQ605LepKq2f5ekrrNkH7tVJQeovtCs"
  
  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
  
  // console.log(mode);
  // console.log(token);
  
  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
    
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
      
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);      
    }
  }
});

function handleMessage(sender_psid, received_message) {
  
  let response;
  
  // Check if the message contains text
  if (received_message.text) {    
    
    if(usuarios[sender_psid] && usuarios[sender_psid].prazoCarencia){
      if(!isNaN(parseFloat(received_message.text))){
        usuarios[sender_psid].projecaoInflacaoAnual=0;
        usuarios[sender_psid].spreadAgente = parseFloat(received_message.text);
        setTimeout(function() {
          mensagem(sender_psid, received_message.text+" % é a taxa de remuneração do agente financeiro? ok, relaxa que já acabamos rs.");
        }, 3000);
        
        if(usuarios[sender_psid] && usuarios[sender_psid].spreadAgente){

          setTimeout(function() {
            getVezesEPrestacao(sender_psid);        
          }, 6000);
          
          setTimeout(function() {
            abrirURL(sender_psid)          
          }, 9000);
          
          setTimeout(function() {
            perguntaFinal(sender_psid)         
          }, 14000);
        }
      }
      else{
        setTimeout(function() {
          mensagem(sender_psid, "Ops! "+received_message.text+" não é um valor correto. Tem que ser só o valor inteiro, sem a porcentagem (%).");
        }, 3000);
        setTimeout(function() {
          mensagem(sender_psid, "Insira a taxa de remuneração do agente financeiro novamente (somente número).");
        }, 6000);
      }
    }
    
    else if(usuarios[sender_psid] && usuarios[sender_psid].prazoFinanciamento){
      if(!isNaN(parseFloat(received_message.text))){
        usuarios[sender_psid].prazoCarencia = parseFloat(received_message.text);
        setTimeout(function() {
          mensagemComNome(sender_psid, received_message.text+" meses é o Prazo de carencia do Financiamento? ok ");
        }, 3000);
        setTimeout(function() {
          mensagem(sender_psid, "Por último, insira a taxa de remuneração do agente financeiro (somente número).");
        }, 6000);
      }
      else{
        setTimeout(function() {
          mensagem(sender_psid, "Ops! "+received_message.text+" não é um valor correto. Tem que ser só meses, (de 1 a 12).");
        }, 3000);
        setTimeout(function() {
          mensagem(sender_psid, "Insira quanto tempo será o prazo de carência, no qual você pagará somente os juros do financiamento, em meses (somente números) novamente.");
        }, 6000);
      }
    }
    
    else if(usuarios[sender_psid] && usuarios[sender_psid].percentualFinanciado){
      if(!isNaN(parseFloat(received_message.text))){
        usuarios[sender_psid].prazoFinanciamento = parseFloat(received_message.text);
        setTimeout(function() {
          mensagem(sender_psid, received_message.text+" meses é o prazo do Financiamento? certo.");
        }, 3000);
        setTimeout(function() {
          mensagem(sender_psid, "Insira agora quanto tempo será o prazo de carência, no qual você pagará somente os juros do financiamento, em meses (somente números).");
        }, 6000);
      }
      else{
        setTimeout(function() {
          mensagem(sender_psid, "Ops! "+received_message.text+" não é um valor correto. Tem que ser só meses, (de 1 a 12).");
        }, 3000);
        setTimeout(function() {
          mensagem(sender_psid, "Insira quanto tempo durará o financiamento, em meses (somente números) novamente.");
        }, 6000);
      }
    }
    
    else if(usuarios[sender_psid] && usuarios[sender_psid].codProduto){
      if(!isNaN(parseFloat(received_message.text))){
        usuarios[sender_psid].valorBem = parseFloat(received_message.text);
        usuarios[sender_psid].percentualFinanciado = 1;
        /*setTimeout(function() {
          mensagem(sender_psid, received_message.text+" % é o Percentual Financiado? tudo bem.");
        }, 3000);*/
        setTimeout(function() {
          mensagem(sender_psid, "R$ "+parseFloat(received_message.text.replace(",", ".")).toFixed(2)+" é o valor do bem? ok.");
        }, 3000);
        setTimeout(function() {
          mensagem(sender_psid, "Insira agora quanto tempo durará o financiamento, em meses (somente números).");
        }, 6000);
      }
      else{
        setTimeout(function() {
          mensagem(sender_psid, "Ops! "+received_message.text+" não é um valor correto. Tem que ser só numeros de reais.");
        }, 3000);
        setTimeout(function() {
          mensagem(sender_psid, "Insira o Valor do Bem ou Projeto (geralmente é acima de R$ 20.000,00). Só precisa usar os números.");
        }, 6000);
        /*setTimeout(function() {
          mensagem(sender_psid, "Ops! "+received_message.text+" não é um valor correto. Tem que ser só valor de porcentagem, sem o porcento (%).");
        }, 3000);
        setTimeout(function() {
          mensagem(sender_psid, "Insira o Valor de Percentual Financiado novamente.");
        }, 6000);*/
      }
    }
    
    /*else if(usuarios[sender_psid] && usuarios[sender_psid].codProduto){
      if(!isNaN(parseFloat(received_message.text.replace(",", ".")))){
        usuarios[sender_psid].valorBem = parseFloat(received_message.text.replace(",", "."));
        setTimeout(function() {
          mensagem(sender_psid, "R$ "+parseFloat(received_message.text.replace(",", ".")).toFixed(2)+" é o valor do bem? ok.");
        }, 3000);
        setTimeout(function() {
          mensagem(sender_psid, "Insira agora o Valor de Percentual Financiado.");
        }, 6000);
      }
      else{
        setTimeout(function() {
          mensagem(sender_psid, "Ops! "+received_message.text+" não é um valor correto. Tem que ser só numeros de reais.");
        }, 3000);
        setTimeout(function() {
          mensagem(sender_psid, "Insira o Valor do Bem ou Projeto (geralmente é acima de R$ 20.000,00). Só precisa usar os números.");
        }, 6000);
      }
    }*/
    
    else{
      // Create the payload for a basic text message
      response = {
        "text": "Quer conversar?",
        "quick_replies":[
          {
            "content_type":"text",
            "title":"Sim, quero!",
            "payload":"bem-vindo-novamente"
          },
          {
            "content_type":"text",
            "title":"Não agora.",
            "payload":"nao-obg"
          }
        ]
      }
    }  
    
    // Sends the response message
    callSendAPI(sender_psid, response);  
  }  
}

function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }
  
  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!');
      //console.log(res);
    } else {
      console.error("Unable to send message:" + err);
    }
  }); 
}

function handlePostback(sender_psid, received_postback) {
  let response;
  
  // Get the payload for the postback
  let payload = received_postback.payload;
  
  // Set the response based on the postback payload
  if (payload === 'bem-vindo') {
    mensagemBoasVindas(sender_psid);
    setTimeout(function() {
      perguntaContexto(sender_psid);
    }, 3000);
  } 
  
  else if (payload === 'bem-vindo-novamente'){
    mensagemBoasVindasNovamente(sender_psid);
    setTimeout(function() {
      perguntaContexto(sender_psid);
    }, 3000);
  }
  
  else if (payload === 'mostrar-conteudo'){
    contexto(sender_psid);
  }
  
  else if (payload === 'simulador-financeiro'){
    simulador_financeiro(sender_psid);
  }

  else if (payload === 'moedas-contratuais'){
    moedas_contratuais(sender_psid);
  }

  else if (payload === 'opcoes-financiamento'){
    opcoes_financiamento(sender_psid);
  }
  
  else if (payload.indexOf('usar-') != -1){
    usuarios[sender_psid] = {};
    usuarios[sender_psid].codProduto = payload.replace('usar-','');;
    console.log(usuarios[sender_psid].codProduto);
    mensagem(sender_psid, "Insira o Valor do Bem ou Projeto (geralmente é acima de R$ 20.000,00). Só precisa usar os números.");
  }
  else {
    response = { "text": "Ok. Caso precise, é só me mandar uma mensagem. Tenha um bom dia!" }
    // Send the message to acknowledge the postback
    callSendAPI(sender_psid, response);
  }
}

function simulador_financeiro(sender_psid){
  setTimeout(function() {
    mensagem(sender_psid, "Temos esta ferramenta que simula as parcelas para cada opção de financiamento do BNDES.");
  }, 3000);
  
  setTimeout(function() {
    mensagem(sender_psid, "Ela realiza o cálculo de simulação de um financiamento para um dos produtos do BNDES");
  }, 6000);
  
  setTimeout(function() {
    mensagem(sender_psid, "Vamos experimentar?");
  }, 9000);
  
  setTimeout(function() {
    mensagem(sender_psid, "Eu vou te guiar para podermos fazer uma busca aqui utilizando essa ferramenta ;).");
  }, 12000);
  
  setTimeout(function() {
    mensagem(sender_psid, "Escolha abaixo um dos financiamentos:");
  }, 15000);
  
  setTimeout(function() {
    mostrarOpcoesFinanciamento(sender_psid);
  }, 18000);
}

function moedas_contratuais(sender_psid){
  setTimeout(function() {
    mensagem(sender_psid, "Aqui você pode consultar às moedas e taxas utilizadas nos contratos realizados pelo BNDES.");
  }, 3000);
  
  setTimeout(function() {
    mensagem(sender_psid, "Varremos nosso banco de dados e lhe informamos as Moedas Contratuais que temos.");
  }, 6000);
  
  setTimeout(function() {
    mensagem(sender_psid, "Quer consultar nossas moedas?");
  }, 9000);

  setTimeout(function() {
    verMoedas(sender_psid);
  }, 12000);

  setTimeout(function() {
    perguntaFinal(sender_psid)         
  }, 18000);
}

function opcoes_financiamento(sender_psid){
  setTimeout(function() {
    mensagem(sender_psid, "Aqui você pode consultar às opções de financiamento do BNDES de acordo com o perfil e necessidade dos interessados, tais como natureza da empresa, porte, prazo e valor.");
  }, 3000);
  
  setTimeout(function() {
    mensagem(sender_psid, "Nós analisamos nosso banco de dados e entregamos a você as opções de apoio financeiro que temos.");
  }, 6000);
  
  setTimeout(function() {
    mensagem(sender_psid, "Quer consultar nossos apoios?");
  }, 9000);

  setTimeout(function() {
    verApoios(sender_psid);
  }, 12000);

  setTimeout(function() {
    perguntaFinal(sender_psid)         
  }, 18000);
}

function mostrarOpcoesFinanciamento(sender_psid){
  let response = { "attachment": {
    "type": "template",
    "payload": {
      "template_type":"generic",
      "elements":[
        {
          "title": "BNDES Giro",
          "subtitle": "Financiamento para capital de giro, visando aumentar a produção, o emprego e a massa salarial.",
          "buttons": [
            {
              "title": "Usar BNDES Giro",
              "type": "postback",
              "payload": "usar-AOI_003"            
            }
          ]    
        },
        {
          "title": "Inovagro",
          "subtitle": "Financiamento para incorporação de inovações tecnológicas nas propriedades rurais, visando ao aumento da produtividade e melhoria de gestão.",
          "buttons": [
            {
              "title": "Usar Inovagro",
              "type": "postback",
              "payload": "usar-AOI_033"            
            }
          ]    
        },
        {
          "title": "Moderfrota",
          "subtitle": "Financiamento para aquisição de tratores, colheitadeiras, plataformas de corte, pulverizadores, plantadeiras, semeadoras e equipamentos para beneficiamento de café.",
          "buttons": [
            {
              "title": "Usar Moderfrota",
              "type": "postback",
              "payload": "usar-AOI_035"            
            }
          ]    
        },
        {
          "title": "Moderinfra",
          "subtitle": "Financiamento para o desenvolvimento da agropecuária irrigada sustentável, bem como para o incentivo à utilização de estruturas de produção em ambiente protegido e para a proteção da fruticultura em climas temperados contra a incidência de granizo.",
          "buttons": [
            {
              "title": "Usar Moderinfra",
              "type": "postback",
              "payload": "usar-AOI_037"            
            }
          ]    
        }
      ]
    }
  }
}
callSendAPI(sender_psid, response); 
}

function abrirURL(sender_psid){
  let response = {
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"button",
        "text":"Abaixo, você pode conferir mais informações e mais detalhes, somente utilizando link abaixo aqui :D.",
        "buttons":[
          {
            "type":"web_url",
            "url":"https://www.bndes.gov.br/wps/portal/site/home/financiamento/simulador/?productCode="+usuarios[sender_psid].codProduto+"&valorBem="+usuarios[sender_psid].valorBem+"&percentualFinanciado="+usuarios[sender_psid].percentualFinanciado+"&prazoFinanciamento="+usuarios[sender_psid].prazoFinanciamento+"&prazoCarencia="+usuarios[sender_psid].prazoCarencia+"&spreadAgente="+usuarios[sender_psid].spreadAgente+"&projecaoInflacaoAnual="+usuarios[sender_psid].projecaoInflacaoAnual,
            "title":"Ver resultado",
            "webview_height_ratio": "full"
          }
        ]
      }
    }
  }
  // Sends the response message
  callSendAPI(sender_psid, response); 
  usuarios[sender_psid] = {};
}

function verMoedas(sender_psid){
  let response = {
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"button",
        "text":"Aqui está, uma lista com todas as nossas moedas. Basta abrir.",
        "buttons":[
          {
            "type":"web_url",
            "url":"https://bndes-negocios-servidor.herokuapp.com/servico-sigla-series",
            "title":"Ver moedas",
            "webview_height_ratio": "full"
          }
        ]
      }
    }
  }
  // Sends the response message
  callSendAPI(sender_psid, response); 
  usuarios[sender_psid] = {};
}

function verApoios(sender_psid){
  let response = {
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"button",
        "text":"Aqui está, uma lista com todos os nossos apoios. Basta abrir.",
        "buttons":[
          {
            "type":"web_url",
            "url":"https://bndes-negocios-servidor.herokuapp.com/lista-dominios",
            "title":"Ver apoios",
            "webview_height_ratio": "full"
          }
        ]
      }
    }
  }
  // Sends the response message
  callSendAPI(sender_psid, response); 
  usuarios[sender_psid] = {};
}

function perguntaContexto(sender_psid){
  let response = {
    "text": "Gostaria de ver algumas informações sobre nós e conhecer alguns de nossos produtos?",
    "quick_replies":[
      {
        "content_type":"text",
        "title":"Sim, tenho interesse",
        "payload":"mostrar-conteudo"
      },
      {
        "content_type":"text",
        "title":"Não, obrigado.",
        "payload":"nao-obg"
      }
    ]
  }  
  
  // Sends the response message
  callSendAPI(sender_psid, response); 
}

function perguntaFinal(sender_psid){
  let response = {
    "text": "Gostaria de conhecer mais algum de nossos produtos?",
    "quick_replies":[
      {
        "content_type":"text",
        "title":"Sim, tenho interesse!",
        "payload":"mostrar-conteudo"
      },
      {
        "content_type":"text",
        "title":"Não, obrigado.",
        "payload":"nao-obg"
      }
    ]
  }  
  
  // Sends the response message
  callSendAPI(sender_psid, response); 
}

function contexto(sender_psid){
  setTimeout(function() {
    mensagem(sender_psid, "Veja como o BNDES pode fazer parte da sua mais nova empresa.");
  }, 3000);
  
  setTimeout(function() {
    mensagem(sender_psid, "Aqui você encontra as melhores ferramentas para seu negócio.");
  }, 6000);
  setTimeout(function() {
    mensagem(sender_psid, "Agora vou lhe mostrar algumas dessas utilidades que nós temos. Se você quiser experimentá-las, é só aguardar um pouquinho...");
  }, 9000);
  setTimeout(function() {
    enviarOpcoes(sender_psid);
  }, 15000);
}

function mensagem(sender_psid, mensagem){
  let response = { "text": mensagem };
  callSendAPI(sender_psid, response);
}

function mensagemComNome(sender_psid, mensagem){
  var usersPublicProfile = 'https://graph.facebook.com/' + sender_psid + '?fields=first_name&access_token=' + PAGE_ACCESS_TOKEN;
  request({
    url: usersPublicProfile,
    json: true // parse
  }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      response = { "text": mensagem + body.first_name +"."};
      callSendAPI(sender_psid, response);
    }
  });
}

function mensagemBoasVindas(sender_psid){
  getUserName(sender_psid, 0)
}

function mensagemBoasVindasNovamente(sender_psid){
  getUserName(sender_psid, 1)
}

function enviarOpcoes(sender_psid){
  let response = { "attachment": {
    "type": "template",
    "payload": {
      "template_type": "list",
      "top_element_style": "compact",
      "elements": [
        {
          "title": "Simulador Financeiro",
          "subtitle": "Simula as parcelas para cada opção de financiamento do BNDES.",
          "image_url": "https://api-labs.bndes.gov.br/store/registry/resource/_system/governance/apimgt/applicationdata/icons/BNDES/fagon/SimuladorFinanciamento/v1/icon",          
          "buttons": [
            {
              "title": "Simule",
              "type": "postback",
              "payload": "simulador-financeiro"            
            }
          ]    
        },
        {
          "title": "Moedas Contratuais",
          "subtitle": "Consulta às moedas e taxas utilizadas nos contratos realizados pelo BNDES.",
          "image_url": "https://api-labs.bndes.gov.br/store/registry/resource/_system/governance/apimgt/applicationdata/icons/BNDES/siljo/MoedasContratuais/v1/icon",          
          "buttons": [
            {
              "title": "Consulte",
              "type": "postback",
              "payload": "moedas-contratuais"            
            }
          ]    
        },
        {
          "title": "Opcoes Financiamento",
          "subtitle": "Consulta às opções de financiamento do BNDES de acordo com o perfil e necessidade dos interessados, tais como natureza da empresa, porte, prazo e valor.",
          "image_url": "https://api-labs.bndes.gov.br/store/registry/resource/_system/governance/apimgt/applicationdata/icons/BNDES/siljo/OpcoesFinanciamento/v1/icon",          
          "buttons": [
            {
              "title": "Consulte",
              "type": "postback",
              "payload": "opcoes-financiamento"           
            }
          ]    
        }
      ]/*,
      "buttons": [
        {
          "title": "Ver mais",
          "type": "postback",
          "payload": "ver-mais"            
        }
      ]  */
    }
  }
}
// Send the message to acknowledge the postback
callSendAPI(sender_psid, response);
}

function getUserName(sender_psid, again) {
  var usersPublicProfile = 'https://graph.facebook.com/' + sender_psid + '?fields=first_name&access_token=' + PAGE_ACCESS_TOKEN;
  request({
    url: usersPublicProfile,
    json: true // parse
  }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      if(again)
      response = { "text": "Que bom que você voltou " + body.first_name +"!"};
      else
      response = { "text": "Olá "+body.first_name+", meu nome é Bob, sou o atendendente virtual do BNDES."};
      callSendAPI(sender_psid, response);
    }
  });
};

function getVezesEPrestacao(sender_psid){
  let url = "https://bndes-negocios-servidor.herokuapp.com/simulacao/dados?codProduto="+usuarios[sender_psid].codProduto+"&valorBem="+usuarios[sender_psid].valorBem+"&percentualFinanciado="+usuarios[sender_psid].percentualFinanciado+"&prazoFinanciamento="+usuarios[sender_psid].prazoFinanciamento+"&prazoCarencia="+usuarios[sender_psid].prazoCarencia+"&spreadAgente="+usuarios[sender_psid].spreadAgente;
  request({
    url: url,
    json: true // parse
  }, function (error, response, body) {
    console.log(error);
    console.log(response);
    console.log(body);
    console.log("ok!");
    if (!error && response.statusCode === 200) {
      console.log(body);
      response = { "text": "Com isso você paga, R$ " + body.tabela[1].tabelaSaldoInicial +" na primeira parcela e no último mês (daqui a "+body.tabela.length+" meses) o valor de R$ "+body.tabela[body.tabela.length-1].tabelaSaldoInicial+"."};
      callSendAPI(sender_psid, response);
    }
  });
}