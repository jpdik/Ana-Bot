# Ana-Bot
Bot interativo para divulgação social do curso de mestrado de computação móvel do instituto politécnico da guarda.


<p align="center">
  <img src="https://i.imgur.com/BnHvTmR.png" width="200"/>
</p>

<p align="center">
  <img src="https://i.imgur.com/I2FaNX8.png" width="600"/>
</p>

# Rodando serviço com Heroku

## Deploy automático
Você pode fazer um deploy automático clicando abaixo. <br>
<a href="https://heroku.com/deploy?template=https://github.com/jpdik/Ana-Bot">
  <img src="https://www.herokucdn.com/deploy/button.svg" alt="Deploy">
</a>

Não se esqueça de configurar as <a>Variáveis de ambiente</a>

## Instalando e configurando o Heroku
Instale o heroku pelo comando:

### MacOS
Com homebrew:
<pre>
brew install heroku
</pre>

### Windows
Download <a href="https://cli-assets.heroku.com/branches/v6/heroku-windows-386.exe">32-bit</a> ou <a href="https://cli-assets.heroku.com/branches/v6/heroku-windows-amd64.exe">64-bit</a>.

### Linux
A forma que considero facil é através do npm:
<pre>
$ npm install -g heroku-cli
</pre>

> **Obs:** Caso não consiga instalar desta forma, consulte o <a href="https://devcenter.heroku.com/articles/heroku-cli#download-and-install">heroku</a> para mais opções.

## Fazendo login
Realize sua credencial de acordo com os dados cadastrados no site:

<pre>
$ heroku login
Enter your Heroku credentials.
Email: name@example.com
Password:
...
</pre>

## Criando Aplicação
Para criar a aplicação que vc utilizará o seu programa, vá até o diretório do mesmo e use o comando:

<pre>
$ heroku create [NomeAplicação]
</pre>

Será criado um uma aplicativo contendo na URL o parâmetro passado na função:

<pre>
https://[NomeAplicação].herokuapp.com
</pre>

Caso não seja informado nenhum parâmetro, ele gerará um nome aleatório para a aplicação.

Através desta URL voçê terá acesso a sua aplicação.

## Configurando maquina antes do Upload
Precisamos configurar duas coisas antes de iniciar o serviço:

- Definir o comando de incialização do projeto em **NodeJS** criando o arquivo de configuração `Procfile`;

- Configurar as variáveis de ambiente;

#### Procfile
Aqui passamos a configuração para rodar o servidor. Definimos o nome que irá ser mostrado nos logs (web), jutamente com o comando que será utilizado para iniciar o serviço no servidor remoto do **Heroku**. 

O arquivo `Procfile` deverá ficar da seguinte forma:

<pre>
web: npm start
</pre>

## Fazendo Upload da Aplicação
O heroku tem uma forma bem simples de integração com o Github. Para realizar o upload após criar o servidor, basta usar o comando:

<pre>
 $ git push heroku master
</pre>

Pronto! Sua aplicação será instalada passo a passo pelo console baseado nas suas configurações. Você poderá ver toda a instalação e todos os erros que podem acontecer durante ela. Se ela tiver total sucesso terá a seguinte mensagem.

<pre>
remote: Verifying deploy... done.
</pre>

# Configurando variáveis de Ambiente
Precisamos configurar 9 variáveis de ambiente. Vamos setar as seguintes variáveis utilizando o `heroku config:set` :

<pre>
$ heroku config:set FB_ACCESS_TOKEN="[chave_de_acesso_fb]"

$ heroku config:set FB_APP_SECRET="[chave_secreta_fb]"

$ heroku config:set FB_VERIFY_TOKEN="[token_webhook_fb]"

$ heroku config:set WATSON_ASSISTANCE_ID="[id_watson]"

$ heroku config:set WATSON_PASSWORD="[token_watson]"

$ heroku config:set WATSON_URL="[url_watson]"

$ heroku config:set WATSON_USERNAME="[username_watson]"

$ heroku config:set WATSON_VERSION="[version_watson]"

$ heroku config:set WATSON_WORKSPACE_ID="[workspace]"
</pre>

Onde:

#### Facebook

- `[chave_de_acesso_fb]` - Pode ser encontrada em <a href="https://developers.facebook.com/">Developers Facebook</a>. Dentro das configurações do produto `Messenger`, vá até 'Geração de token', selecione a página (caixa preta) e obtenha a token (caixa vermelha):

<p align="center">
  <img src="https://i.imgur.com/vnGR6CZ.png" width="600"/>
</p>

- `[chave_secreta_fb]` - Pode ser encontrada em <a href="https://developers.facebook.com/">Developers Facebook</a>. Nas configurações gerais do App, clique no campo mostrar para obter a chave secreta (caixa vermelha):

<p align="center">
  <img src="https://i.imgur.com/0iliRYY.png" width="600"/>
</p>

- `[token_webhook_fb]` - Esta chave nós que iremos criar para o webhook responder. Será configurada também em <a href="https://developers.facebook.com/">Developers Facebook</a>.

> **Obs:** Primeiramente, devemos setar a variável para que o webhook já possa reponder, senão o facebook não confirma a presença do serviço. Para isso, já utilize o comando:

<pre>
$ heroku config:set FB_VERIFY_TOKEN=[token_de_sua_preferencia]
</pre>

> Lembre de definir uma chave forte, por exemplo, um hash.

Agora, dentro das configurações do produto `Messenger`, vá até 'Webhooks', clique em 'Configurar webhooks' (caixa vermelha direita), configure a URL do webook da aplicação de acordo com exemplo abaixo, e sete uma token de sua preferência. A token que será utilizada aqui, deve ser a mesma que estará em `FB_VERIFY_TOKEN`. Marque os campos `messages` e `messaging_postbacks`. Logo após, clique em verificar e salvar:

<p align="center">
  <img src="https://i.imgur.com/fH5N9d4.png" width="600"/>
</p>

#### IBM Watson

Para encontrar as credenciais basta ir no caminho abaixo:

<p align="center">
  <img src="https://i.imgur.com/KSGpWIq.png" width="600"/>
</p>

Você verá informações como as abaixo:

<p align="center">
  <img src="https://i.imgur.com/cFnJAgG.png" width="600"/>
</p>

- `[id_watson]` - Coloque o valor de **Assistant ID**
- `[token_watson]` - Coloque o valor de **Password**
- `[url_watson]` - Coloque o valor: **https://gateway.watsonplatform.net/assistant/api**
- `[username_watson]` - Coloque o valor de **Username**
- `[version_watson]` - Coloque a data de criação da Skill no formato `YYYY-MM-DD`. ela pode ser encontrada aqui (em vermelho):

<p align="center">
  <img src="https://i.imgur.com/rlw1wAW.png" width="600"/>
</p>

- `[workspace]` - Vá em Skills, selecione os 3 pontos da skill e clique em 'View API Details'. Coloque o valor de **Workspace ID**:

<p align="center">
  <img src="https://i.imgur.com/952BQL2.png" width="600"/>
</p>

## Segunda opção de setar as variáveis de ambiente

Também podemos setar as variáveis de forma mais prática pelo próprio painel de controle no site do **Heroku**. Basta acessar o painel, selecionar a aplicação, ir em `settings` e setar em *Config vars* :

<p align="center">
  <img src="https://i.imgur.com/Ey0d8d6.png" width="600"/>
</p>

Pronto! Suas variáveis de ambiente estão setadas. Basta reiniciar o serviço:

<pre>
heroku restart
</pre>

## Checando Logs

Para checar erros de execução, verifique os logs:

<pre>
heroku logs
</pre>


# Rodando serviço independente do Heroku

Primeiramente, entre na pasta do projeto e instale todas as dependências rodando o seguinte comando:

<pre>
$ npm install
</pre>

Configure as variáveis de ambiente como anteriormente, porém utilizando o comando:

### Linux ou MAC

<pre>
$ export VARNAME="value"
</pre>

### Windows 
<pre>
C:\Users\your_user\Documents> set VARNAME="value"
</pre>

## Colocando variáveis de ambiente na inicialização do sistema

Para que elas entrem em vigor sempre na inicialização do sistema, é preciso que elas sejam inseridas em determinados locais.

### Linux ou MAC
No arquivo `.bash_profile` ou `.bashrc`, insira os `export` que foram comentados no exemplo anterior.

### Windows

Vá até propriedades do sistema, aba avançado, depois siga os passos:

1. Clique em variáveis de ambiente
2. Clique em novo
3. Insira os nome da variável e seu valor
4. Confirme a nova variável clicando em ok

<p align="center">
  <img src="https://i.imgur.com/5vmDK2y.png" width="600"/>
</p>

## Criando acesso externo para o webhook

Para que o webhook funcione com o facebook messenger, precisamos que nosso IP tenha acesso externo a rede. Para isso vamos utilizar o <a href="https://ngrok.com/">Ngrok</a>.

Crie uma conta e baixe o executável para a sua plataforma.

### Linux e MAC
Para iniciar o serviço, basta rodar o arquivo com os seguintes parâmetros:

<pre>
$ ./ngrok http 3000
</pre>

### Windows
Extraia o executável, e rode na linha de comando:

<pre>
C:\Users\your_user\Documents> ngrok.exe http 3000
</pre>

Você terá o resultado similar a esse:

<pre>
ngrok by @inconshreveable                                                                               (Ctrl+C to quit)

Session Status                online
Session Expires               7 hours, 59 minutes
Version                       2.2.8
Region                        United States (us)
Web Interface                 http://127.0.0.1:4040
Forwarding                    http://91122c58.ngrok.io -> localhost:3000
Forwarding                    https://91122c58.ngrok.io -> localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
</pre>

Onde `https://91122c58.ngrok.io` é a sua URL de acesso externo. Basta colocá-la no <a href="https://developers.facebook.com/">Developers Facebook</a> como webhook de acordo com o exemplo abaixo:

> https://91122c58.ngrok.io/webhook

Pronto! Seu bot integrado entre a IBM Watson com a página do facebook está completo.

Para testar, basta enviar alguma mensagem a página.
