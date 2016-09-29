'use strict';

require('dotenv').config();

const server = require('restify').createServer();
server.listen(process.env.port || process.env.PORT || 3978, '::', () =>
   console.log('%s listening to %s', server.name, server.url)
);

const builder = require('botbuilder');

const connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

server.post('/api/messages', connector.listen());

const bot = new builder.UniversalBot(connector);

bot.dialog('/',
    new builder
    .IntentDialog({ recognizers: [new builder.LuisRecognizer(process.env.LUIS_APP_MODEL)] })
    .matches('builtin.intent.communication.send_text', [
        (session, args, next) => {
            let message = builder.EntityRecognizer.findEntity(args.entities, 'builtin.communication.message');
            let contact_name = builder.EntityRecognizer.findEntity(args.entities, 'builtin.communication.contact_name');
            session.dialogData.info = { message: message && message.entity, contact_name: contact_name && contact_name.entity };

            if (!session.dialogData.info.contact_name)
                builder.Prompts.text(session, "Who do you want to message");
            else
                next();
        },
        (session, args, next) => {
            if (!session.dialogData.info.contact_name)
                session.dialogData.info.contact_name = args.response;

            if (!session.dialogData.info.message)
                builder.Prompts.text(session, `What do you want to tell ${session.dialogData.info.contact_name}`);
            else
                next();
        },
        (session, args, next) => {
            if (!session.dialogData.info.message)
                session.dialogData.info.message = args.response;

            builder.Prompts.choice(session, `Do you want to send the message "${session.dialogData.info.message}" to "${session.dialogData.info.contact_name}"?`, ["Yes", "No"]);
        },
        (session, args, next) => {
            if (args.response.entity === "Yes") {
                session.send("Message sent.");
            } else {
                session.send("Message not sent.");
            }
        }
    ])
    .onDefault(
        (session) => {
            session.send("I am a very simple bot. Try asking me to send a message.");
        }
    )
);