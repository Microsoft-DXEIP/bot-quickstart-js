'use strict';

require('dotenv').config();

const server = require('restify').createServer();
server.listen(process.env.port || process.env.PORT || 3978, '::', () =>
   console.log('%s listening to %s', server.name, server.url)
);

const botbuilder = require('botbuilder');

const connector = new botbuilder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

server.post('/api/messages', connector.listen());

const bot = new botbuilder.UniversalBot(connector);

bot.dialog('/',
    (session) => {
        console.log("received", session.message.text);
        session.send("MESSAGE FROM BOT TO USER");
    }
);
