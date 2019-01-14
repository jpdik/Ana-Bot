require('dotenv').config();
const watson = require('watson-developer-cloud');

const assistant = new watson.AssistantV1({
  username: process.env.WATSON_USERNAME,
  password: process.env.WATSON_PASSWORD,
  url:      process.env.WATSON_URL,
  version:  process.env.WATSON_VERSION
});

var payload = {
    workspace_id: process.env.WATSON_WORKSPACE_ID,
    context: {},
    input: { text: 'tudo bem?' }
  };

assistant.message(payload, trataResposta);

function trataResposta(err, res){
    if (err){
        console.log(err);
        return;
    }

    if(res.output.text.length > 0){
        console.log(res.output.text);
    }
}