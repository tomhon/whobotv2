
var restify = require('restify');
var builder = require('botbuilder');


//add appInsights
// import appInsights = require("applicationinsights");
// appInsights.setup("<instrumentation_key>").start();


//Connect to SQL Server
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES; 
var Connection = require('tedious').Connection;

//initialize mapping data array

//arrayIsvTE is sourced from SQL Server
var arrayIsvTE = new Array();
// arrayIsvTE.push("First item on mapping array");

//error logging array
var arrayErr = new Array();

//set up SQL server connection using Application Environment Variables

if (process.env.SQLserver) {

    var config = {
            userName: process.env.SQLuserName,
            password: process.env.SQLpassword,
            server: process.env.SQLserver,
            // If you are on Microsoft Azure, you need this:
            options: {encrypt: true, database: process.env.SQLdatabase}
        };
} else {

    var config = {
            userName: 'teslovetohack@k9',
            password: 'Building9',
            server: 'k9.database.windows.net',
            // If you are on Microsoft Azure, you need this:
            options: {encrypt: true, database: 'TEDGISV'}
        };

}

var connection = new Connection(config);
connection.on('connect', function(err) {
    // If no error, then good to proceed.
    
        if (err) {
        //    console.log(err);
            arrayErr.push(err);
        } else {
        //   console.log("Connected to " + this.config.server + " " + this.config.options.database);
          arrayErr.push("Connected to " + this.config.server);
          loadMappingArray();    
        };
        
        
    });
 
 //function to execute SQL query    
    
 function loadMappingArray() {
      
        request = new Request("SELECT Title, AssignedTE, AssignedBE FROM dbo.PartnerIsvs", function(err) {
         if (err) {
            console.log(err);
            arrayErr.push(err);
          }
        else {
            arrayErr.push("SQL request succeeded");
          }
        });

//unpack data from SQL query
        request.on('row', function(columns) {
            columns.forEach(function(column) {
              if (column.value === null) {
                arrayIsvTE.push('');
              } else {
                arrayIsvTE.push(column.value);
                  }
            });
        }); 

        connection.execSql(request);
    };

// Create bot and add dialogs
// setTimeout(function() {
if (process.env.AppSecret) {
    var bot = new builder.BotConnectorBot({ appId: process.env.AppID, appSecret: process.env.AppSecret });
} else {
    var bot = new builder.BotConnectorBot({ appId: '2c17262d-aa39-46d6-aa09-507cc0472fe1', appSecret: 'iH2x4qqB6HQiWjpMf5XtFdj' });
}

// },5000);

// Connect to LUIS application

if (process.env.LUISServiceURL) {
    var dialog = new builder.LuisDialog(process.env.LUISServiceURL);
} else {
    var dialog = new builder.LuisDialog('https://api.projectoxford.ai/luis/v1/application?id=a2925c56-a51c-44ec-a86e-573d8ae43d8c&subscription-key=929a376180624437bc881e4501940e3e');
}


bot.add('/', dialog);


//---------------------------------------------------------------------------------------------------    
//handle the case where there's a request to reload data

dialog.on('Fetch', function (session, args, next) { 
    session.send( "Welcome to K9 on Microsoft Bot Framework. I can tell you which TE or BE manages any GISV partner." ); 
    // session.send( "Local Partner data is live = " + (partnerISV.length > 0)); 
//list all errors
    arrayErr.forEach(function(item) {
        session.send( "K9 Bot = " + item); 
    });
    session.send( "K9 data is live = " + (arrayIsvTE.length > 0)); 
              // session.endDialog("Session Ended");
    });

//---------------------------------------------------------------------------------------------------    
//handle the case where there's no recognized intent

dialog.on('None', function (session, args, next) { 
    session.send( "Welcome to K9 on Microsoft Bot Framework. I can tell you which TE or BE manages any GISV partner." ); 
    });
//---------------------------------------------------------------------------------------------------    
//handle the case where intent is happy

dialog.on('Happy', function (session, args, next) { 
    session.send( "Hope you enjoyed this as much as i did:-) " ); 

    });
//---------------------------------------------------------------------------------------------------    
//handle the case where intent is sad

dialog.on('Sad', function (session, args, next) { 
    session.send( "Life? Don't talk to me about life. Did you know I've got this terrible pain in all the diodes down my left side? " );
    });    
//---------------------------------------------------------------------------------------------------    
//handle the case where intent is abuse

dialog.on('Abuse', function (session, args, next) { 
    session.send( "Hey, don't be mean to me:-) " ); 
    });   

//---------------------------------------------------------------------------------------------------    
//handle the case where intent is help

dialog.on('Help', function (session, args, next) { 
    session.send( "Ask me Who is the TE for Netflix?" ); 
    session.send( "... or Who is the TE for Amazon?" ); 
    session.send( "... or Who are the TE and BE for Facebook?" ); 
    session.send( "... or Which accounts does Ian manage?" ); 
        //   session.endDialog("Session Ended");
    });  

//---------------------------------------------------------------------------------------------------
//handle the Find Technical Evangelist Find_TE intent

dialog.on('Find_TE', function (session, args, next) { 
//    console.log(args.entities); 

// use bot builder EntityRecognizer to parse out the LUIS entities
var account = builder.EntityRecognizer.findEntity(args.entities, 'Account'); 

// assemble the query using identified entities   
var searchAccount = "";

//create regex version of the searchAccount
if (!account) {
        session.send("Sorry, I couldn't make out the name of the account you are looking for.");
} else { 
        (searchAccount = new RegExp(account.entity, 'i'))

        // Next line to assist with debugging
        // session.send( "Looking for the TE for " + searchAccount); 

        //search mapping array for searchAccount
        var x = 0;
        var found = false;
                // Next line to assist with debugging
                // // console.log("Looking for account");
        while ( x < arrayIsvTE.length) {
            if (arrayIsvTE[x].match(searchAccount)) {
            //post results to chat
                if(arrayIsvTE[x+1]) {
                    session.send( "The TE for " + arrayIsvTE[x] + " is " + arrayIsvTE[x+1]); 
                    found = true;
                    }
                };
            x++;
            x++;
            x++;
            };
            if (!found) {
                session.send( "Sorry, I couldn't find the TE for " + account.entity)
                };

            // next line to assist with debug
            //   session.endDialog("Session Ended");
            
        }});
//---------------------------------------------------------------------------------------------------
//handle the Find Business Evangelist Find_BE intent

dialog.on('Find_BE', function (session, args, next) { 
//    console.log(args.entities); 

// use bot builder EntityRecognizer to parse out the LUIS entities
var account = builder.EntityRecognizer.findEntity(args.entities, 'Account'); 

// assemble the query using identified entities   
var searchAccount = "";

//create regex version of the searchAccount
if (!account) {
        session.send("Sorry, I couldn't make out the name of the account you are looking for.");
} else { 
        (searchAccount = new RegExp(account.entity, 'i'))

        // Next line to assist with debugging
        // session.send( "Looking for the TE for " + searchAccount); 

        //search mapping array for searchAccount
        var x = 0;
        var found = false;
                // Next line to assist with debugging
                // // console.log("Looking for account");
        while ( x < arrayIsvTE.length) {
            if (arrayIsvTE[x].match(searchAccount)) {
            //post results to chat
                if(arrayIsvTE[x+2]) {
                    session.send( "The BE for " + arrayIsvTE[x] + " is " + arrayIsvTE[x+2]); 
                    found = true;
                    }
                };
            x++;
            x++;
            x++;
            };
            if (!found) {
                session.send( "Sorry, I couldn't find the BE for " + account.entity)
                };

            // next line to assist with debug
            //   session.endDialog("Session Ended");
            
        }});

//---------------------------------------------------------------------------------------------------
//handle the Find Technical and Business Evangelist Find_BE intent

dialog.on('Find_Both', function (session, args, next) { 
//    console.log(args.entities); 

// use bot builder EntityRecognizer to parse out the LUIS entities
var account = builder.EntityRecognizer.findEntity(args.entities, 'Account'); 

// assemble the query using identified entities   
var searchAccount = "";

//create regex version of the searchAccount
if (!account) {
        session.send("Sorry, I couldn't make out the name of the account you are looking for.");
} else { 
        (searchAccount = new RegExp(account.entity, 'i'))

        // Next line to assist with debugging
        // session.send( "Looking for the TE for " + searchAccount); 

        //search mapping array for searchAccount
        var x = 0;
        var found = false;
                // Next line to assist with debugging
                // // console.log("Looking for account");
        while ( x < arrayIsvTE.length) {
            if (arrayIsvTE[x].match(searchAccount)) {
            //post results to chat
                if(arrayIsvTE[x+1]) {
                    session.send( "The TE for " + arrayIsvTE[x] + " is " + arrayIsvTE[x+1]); 
                    found = true;
                    }
                if(arrayIsvTE[x+2]) {
                    session.send( "The BE for " + arrayIsvTE[x] + " is " + arrayIsvTE[x+2]); 
                    found = true;
                    }
                };
            x++;
            x++;
            x++;
            };
            if (!found) {
                session.send( "Sorry, I couldn't find the Evangelists for " + account.entity)
                };

            // next line to assist with debug
            //   session.endDialog("Session Ended");
            
        }});

//---------------------------------------------------------------------------------------------------    
//handle the case where intent is List Accounts for BE or TE

dialog.on('Find_Accounts', function (session, args, next) { 
// session.send( "Hey, I'm still learning how to do that. Check back soon!" ); 
    
    // use bot builder EntityRecognizer to parse out the LUIS entities
var evangelist = builder.EntityRecognizer.findEntity(args.entities, 'Evangelist'); 
// session.send( "Recognized Evangelist " + evangelist.entity); 

// assemble the query using identified entities   
var searchEvangelist = "";

//create regex version of the searchEvangelist
if (!evangelist) {
        session.send("Sorry, I couldn't make out the name of the evangelist you are looking for.");
} else { 
        (searchEvangelist = new RegExp(evangelist.entity, 'i'))

        // Next line to assist with debugging
        // session.send( "Looking for the accounts for " + searchEvangelist); 

        //search mapping array for searchAccount
        var x = 0;
        var found = false;
                // Next line to assist with debugging
                // // console.log("Looking for account");
        while ( x < arrayIsvTE.length) {
            if (arrayIsvTE[x+1].match(searchEvangelist)) {
            //found TE match
                if(arrayIsvTE[x]) {
                    session.send( arrayIsvTE[x+1] + " is TE for " + arrayIsvTE[x]); 
                    found = true;
                    }
                };
            if (arrayIsvTE[x+2].match(searchEvangelist)) {
            //found BE match
                if(arrayIsvTE[x]) {
                    session.send( arrayIsvTE[x+2] + " is BE for " + arrayIsvTE[x]); 
                    found = true;
                    }
                };
            x++
            x++;
            x++;
            };
            if (!found) {
                session.send( "Sorry, I couldn't find the accounts for " + evangelist.entity)
                };

            // next line to assist with debug
            //   session.endDialog("Session Ended");
            
        }
    });   


//---------------------------------------------------------------------------------------------------
// Setup Restify Server
var server = restify.createServer();
server.get('/', function (req, res) {
        res.send('K9 PreProduction Running ' + arrayErr.length + " " + arrayErr[0] + " " + arrayErr[1] + " " + arrayIsvTE.length);
        arrayErr.forEach(function(item) {
            console.log( "K9 Bot = " + item); 
            });
    });


// server.post('/api/messages', bot.verifyBotFramework(), bot.listen());
server.post('/api/messages', bot.listen());
server.listen(process.env.port || 80, function () {
    console.log('%s listening to %s', server.name, server.url); 
});
