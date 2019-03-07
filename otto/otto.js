const RiveScript = require('rivescript');
const express = require('express');
let app = express();
let bot = new RiveScript();
var googleTranslate = require('google-translate')('AIzaSyAsbIT9zzzRkq-NSyARMEVooLcbMvV3Fvw');

bot.loadDirectory("./brain").then(loading_done).catch(loading_error);

function loading_done() {
    bot.sortReplies();
    console.log("ES LEBTTTT!!");

    app.get("/askBot/:text", function (request, response) {
        console.log(request.params.text);
        let answer = "";
        
        googleTranslate.detectLanguage(request.params.text, function(err, detection) {

            console.log(detection.language);
           
            if(detection.language == 'de'){
                googleTranslate.translate(request.params.text, 'de', 'en', (err, answerBot) => {
                    console.log(answerBot.translatedText + ' deutsch');
                    return bot.reply("local-user", answerBot.translatedText).then(function (reply) { 
                        console.log(reply + ' deutsch');
                        return googleTranslate.translate(reply,'en', 'de', (err, replyTranslated) => {
                            response.send(replyTranslated.translatedText);
                        });
                    });
                });
            }else{
                bot.reply("local-user", request.params.text).then( function (answerBot) {    
                    console.log(answerBot + ' english');
                    return googleTranslate.translate(answerBot, 'en', 'de', (err, replyTranslated) => {
                        return response.send(replyTranslated.translatedText);
                    });
                });
            }
            
        });
    });
}

function loading_error(error, filename, lineno) {
    console.log("Error when loading files: " + error);
}

app.listen(8080);

