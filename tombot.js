/*
* TomBot 2
*
* ElaTheDeveloper
*/

//Set up Discord.js & client, as well as the file system so tom can read up stuffs
const Discord = require("discord.js");
const client = new Discord.Client({autoReconnect:true});
var fs = require('fs');
//read the token from ./token.txt
var token = fs.readFileSync('./token.txt').toString();
//console.log('Logging into Discord with Token: ' + token); //DEV PUPROSES ONLY LOL DON'T USE THIS FOR PUBLIC RELEASES LOL
console.log("Entering as TomBot");
//set up and get the qutoes
var quotes;
var customCmds = [];
//load up or files
function loadFile(){
    quotes = fs.readFileSync('./quotes.txt').toString().split("\n");
    customCmds = JSON.parse(fs.readFileSync('./commands.json'));
    console.log(customCmds);
}
//now load the files
loadFile();


//set the start time for the uptime command`
var startTime = Date.now();
// --- RSS FEED PARSER ---
function rssfeed(client,msg,url,count,full){
    var FeedParser = require('feedparser');
    var feedparser = new FeedParser();
    var request = require('request');
    var htmlToText = require('html-to-text');
    request(url).pipe(feedparser);
    feedparser.on('error', function(error){
        msg.channel.sendMessage("failed reading feed: " + error);
    });
    var shown = 0;
    feedparser.on('readable',function() {
        var stream = this;
        shown += 1
        if(shown > count){
            return;
        }
        var item = stream.read();
        console.log("Sending: " + item.title);
        if (item.description){var thedescription = item.description.substr(0, 2000)+"\u2026" }
        const embed = new Discord.RichEmbed()
          .setTitle(item.title)
          .setAuthor('Tom Scott Bot', 'https://pbs.twimg.com/media/CP7g2a2WsAAsiWZ.jpg')
          /*
          * Alternatively, use '#00AE86', [0, 174, 134] or an integer number.
          */
          .setColor(0x00AA32)
          .setDescription(htmlToText.fromString(thedescription,{wordwrap:false, ignoreHref: true}))
          .setFooter(quotes[Math.floor(Math.random() * quotes.length)], 'https://usesthis.com/images/interviews/tom.scott/portrait.jpg')
          .setThumbnail('https://usesthis.com/images/interviews/tom.scott/portrait.jpg')
          /*
          * Takes a Date object, defaults to current date.
          */
          .setTimestamp()
          .setURL(item.link);

          msg.channel.sendEmbed(embed);
        stream.alreadyRead = true;
    });
}
// --- WHEN THE BOT IS READY TO DO STUFF ---
// This is fired when the bot has successfully logged in
client.on('ready', () => {
    console.log(`Logged in as ${client.user.username}!`);
    client.user.setGame("Citation Needed Fan Edition");
});
// --- ON MESSAGE AQUIRED ---
// Fired when the bot gets a message
client.on('message', msg => {
  if(msg.content === "ayy"){
    msg.channel.sendMessage("lmao");
  }
  //Check the author is not the bot and it is actually a command
  if(msg.author.id != client.user.id && msg.content[0] === '!'){
    //Log the command to the console
    console.log(msg.author + " just ran " + msg.content);
    //split the message at the space for our command and switches.
    command = msg.content.split(" ")[0].substring(1);
    switches = msg.content.substring(command.length+2);
    //select the command from one of 2 arrays. reuturns false if command not found
    var cmd = commands[command];
    var customCmd = customCmds[command];
    if(msg.isMentioned(client.user)){
      try {
        command = msg.content.split(" ")[1];
        switches = msg.content.substring(client.user.mention().length+command.length+2);
      } catch (e){
        msg.channel.sendMessage("Yea. You called bro?");
      }
    }
    if(command === "help"){
      //help is special since it iterates over the other commands
      msg.channel.sendMessage('We flew a kite in a public place! We flew a kite in a puuuuubbblic place!');
      msg.channel.sendMessage("Things you can tell me to do:").then(function(){
      var batch = "";
      var sortedCommands = Object.keys(commands).sort();
      for(var i in sortedCommands) {
        var cmd = sortedCommands[i];
        var info = "**!" + cmd+"**";
        var usage = commands[cmd].usage;
        if(usage){
          info += " " + usage;
        }
        var description = commands[cmd].description;
        if(description instanceof Function){
          description = description();
        }
        if(description){
          info += "\n\t" + description;
        }
        var newBatch = batch + "\n" + info;
        if(newBatch.length > (1024 - 8)){ //limit message length
          msg.channel.sendMessage(batch);
          batch = info;
        } else {
          batch = newBatch
        }
      }
      if(batch.length > 0){
        msg.channel.sendMessage(batch);
      }
    }); }
    else if(cmd) {
      //if it is an official command, process it as it should.
      cmd.process(client,msg,switches);
    } else if (customCmd){
      //if its a cusotm command, fuck you just do it.
      msg.channel.sendMessage(customCmd);
    } else {
      msg.channel.sendMessage("!" + command + " not recognized as a command! Maybe try again or run !help if you do not know all the avalable commands.").then((message => message.delete(5000)));
    }//endofcopy
  } else {
    //have a 1 in 100 chance of something occuring
      if (Math.random()*100 > 99) {
        quote(msg);
      }
  }
});

//on disconnect
client.on('disconnect', () => {
  console.log('Disconnected ' + Date.now().toString());
  var date = new Date();
  var year = date.getUTCFullYear();
  var month = date.getUTCMonth();
  var day = date.getUTCDate();
  var time = date.getUTCHours() + " " + date.getUTCMinutes() + " " + date.getUTCSeconds();
  //month 2 digits
  month = ("0" + (month + 1)).slice(-2);

  //year 2 digits
  year = year.toString().substr(2,2);

  var formattedDate = day + '/' + month + "/" + year;
  console.log(formattedDate);
});

// --- BOT COMMANDS --
var commands = {
    "ping": {
        description: "Checks if the bot is alive. Reponds with the word pong. Maybe I will mention you, maybe I won't.",
        process: function(client, msg, switches) {
            msg.reply("pong!");
            if(switches){
                msg.channel.sendMessage("You do know that ping does not require any switches, right?");
            }
        }
    },
    "cupholders": {
      description: "rip hammelj",
      process: function(client, msg, switches){
        if (Math.floor(Math.random()*10) > 90){
          msg.channel.sendMessage("<@224856280227905536>");
        }
      }
    },
    "uptime": {
			usage: "",
			description: "Tells you how long Tom has been alive. It's debatable how he manages it without caffine...",
			process: function(client,msg,switches){
				var now = Date.now();
				var msec = now - startTime;
				console.log("Uptime is " + msec + " milliseconds");
        if(switches){msg.channel.sendMessage("You need no switches, dick nose!");}
				var days = Math.floor(msec / 1000 / 60 / 60 / 24);
				msec -= days * 1000 * 60 * 60 * 24;
				var hours = Math.floor(msec / 1000 / 60 / 60);
				msec -= hours * 1000 * 60 * 60;
				var mins = Math.floor(msec / 1000 / 60);
				msec -= mins * 1000 * 60;
				var secs = Math.floor(msec / 1000);
				var timestr = "";
				if(days > 0) {
					timestr += days + " days ";
				}
				if(hours > 0) {
					timestr += hours + " hours ";
				}
				if(mins > 0) {
					timestr += mins + " minutes ";
				}
				if(secs > 0) {
					timestr += secs + " seconds ";
				}
				msg.channel.sendMessage("**Uptime**: " + timestr);
			}
    },
    "about": {
        description: "Get information about Tom.",
        process: function(client,msg,switches){
            msg.reply("TomBot 3 Written By ElaTheDeveloper - Contribute with !contribute - We flew a kite in a public place!");
        }
    },
    "version": {
        description: "returns the bot version that is running",
        process: function(client, msg, switches) {
            msg.channel.sendMessage("TomBot v3.0 - ElaTheDeveloper. Is there a bird called a shoot? NO!");
            var commit = require('child_process').spawn('git', ['log','-n','1', '--oneline']);
            commit.stdout.on('data', function(data) {
              //console.log(data.toString());
              msg.channel.sendMessage(data.toString());
        		});
            commit.on('close', function(code){
              if(code != 0){
                msg.channel.sendMessage("I was unable to get the Git Commit. Better luck next time.");
              }
            });
        }
    },
    "serverreddit": {
        description: "Returns the most recent post on our subreddit. It is mostly accurate.",
        process: function(client,msg,switches) {
            //make so it does not returned the pinned posts
            var path = "/new/.rss"
            path = "/r/CNFanEdition"+path;
            rssfeed(client,msg,"https://www.reddit.com"+path,1,false);
        }
    },
    "reddit": {
        description: "Returns the most recent post on The Tom SCott subreddit. It is mostly accurate.",
        process: function(client,msg,switches) {
            //make so it does not returned the pinned posts
            var path = "/new/.rss"
            path = "/r/TomScott"+path;
            rssfeed(client,msg,"https://www.reddit.com"+path,1,false);
        }
    },
    "latestcn": {
        description: "Gets the most recent Citation Needed episode from Tom Scott. It is 99% accurate, however if Tom decides to troll us?? No, it's not.",
        process: function(client,msg,switches){
            rssfeed(client,msg,"https://www.youtube.com/feeds/videos.xml?playlist_id=PL96C35uN7xGIo2odDuuPeYtb7BtQ1kBhp",1,false);
        }
    },
    "addquote": {
        usage: "<quote>",
        description: "Add a quote to our list of quotes from Citation Needed.",
        process: function(client, msg, switches){
            addQuote(client, msg, switches);
        }
    },
    "quote": {
        description: "Returns a random Citation Needed or Technical Difficulties quote",
        process: function(client, msg, switches){
            var number = Math.floor(Math.random() * quotes.length);
            msg.channel.sendMessage(quotes[number]);
        }
    },
    "reloadquotes": {
        description: "Reloads all the quotes in the quotes file.",
        process: function(client, msg, switches){
            try {
                loadFile();
                msg.channel.sendMessage("Successfully reloaded quotes.");
            } catch (e){
                msg.channel.sendMessage("Could not relaod quotes.");
                console.log("Oh dear. quotes couldn't be reloaded...");
            }
        }
    },
    "addcommand": {
      usage: "[commandname] [command action]",
      description: "Add a custom command",
      process: function(client, msg, switches){
        addCommand(client, msg, switches);
      }
    },
    "contribute": {
      description: "How to contribute to TomBot.",
      process: function(client, msg, switches){
        msg.channel.sendMessage("**So you want to contribue to me?**");
        msg.channel.sendMessage("Quotes: use !addquote");
        msg.channel.sendMessage("Code? You know Node.JS? Contact <@194930097197678592> for instructions");
        msg.channel.sendMessage("My repo is at: https://github.com/ElaTheDeveloper/TomBot");
        msg.channel.sendMessage("Thanks for contributing!");
      }
    },
    "listcustomcommands": {
      description: "Lists all the commands you horrible lot have created.",
      process: function(client, msg, switches){
        //loop through command array
        //This is a bad solution as discord will rate limit us, so instead we should do something similar to the help command
        for (cmd in customCmds){
          msg.channel.sendMessage(cmd);
        }
      }
    }
    /*
    * To Do:
    * Prune Command
    */
};



//send out a quote
function quote(msg){
    var number = Math.floor(Math.random() * quotes.length);
    msg.channel.sendMessage(quotes[number]);
}
//add a quote to the quotes list
function addQuote(client, msg, switches){
  console.log("Attempting to add: " + switches);
    if (switches){
        //minor thanks to dan for this
        //as an aside, sublime sucks as it uses 2 spaces for indents by default and that is stupid.
        switches.replace(/(\r\n|\n|\r)/gm," ");
        fs.appendFile('./quotes.txt', "\n"+switches, function (err) {
          if (err) {
            msg.channel.sendMessage("Could not add quote! Something went wrong!");
          } else {
            msg.channel.sendMessage("Added!");
          }
        });
    } else{
        msg.channel.sendMessage("Please provide a quote! Remember, usage is `!addquote <quote>`!");
    }
    loadFile();
}

//add a command to the custom commands.
function addCommand(client, msg, switches){
    var arguments = switches.split(/ (.+)/)[0]; //split the arguments for the command so we have the command name and the not command lname
    var arg1 = switches.split(/ (.+)/)[0];
    var arg2 = switches.split(/ (.+)/)[1];
    console.log(arguments);
    console.log("Command name: " + arg1);
    console.log("Its bullshit: " + arg2);
    msg.reply("Now attempting to create the command. It may work? " + arg1);


    customCmds[arg1] = arg2;
    var customCmdsJSON = JSON.stringify(customCmds);

    fs.writeFile('commands.json', customCmdsJSON, function(err){
        if (err){
            msg.channel.sendMessage("Oh dear. I couldn't create the command " + arg1 + ". Oh well. Try again soon");
            console.log(err);//if it shits iteslf.
        } else {
          msg.channel.sendMessage("It appears the command " + arg1 + " has been created. Try it with !" + arg1);
          console.log("success");
          loadFile();
        }
    }); //otehrwise we cool, we cool
}

function listcustcmds(client, msg, switches){
  msg.channel.sendMessage("ðŸŽµ Tom's got hiccups and we can't start again! ðŸŽµ");
  msg.channel.sendMessage("Things you can tell me to do:").then(function(){
    var batch = "";
    var sortedCommands = Object.keys(customCmds).sort();
    for(var i in sortedCommands) {
      var cmd = sortedCommands[i];
      var info = "**!" + cmd + "**";
      var usage = commands[cmd].usage;
      var newBatch = batch + "\n" + info;
      if(newBatch.length > (1024 - 8)){ //limit message length
        msg.author.sendMessage(batch);
        batch = info;
      } else {
        batch = newBatch
      }
    }
    if(batch.length > 0){
      msg.channel.sendMessage(batch);
    }
  });
}



client.on('messageDelete', function(message) {
  if(message.channel.type == 'text' && message.author != client.user) {
    message.channel.send("And " + message.author + " has won the n\'th degree!");
  }
});

client.on("guildMemberAdd", (member) => {
  console.log(member + " has joined us for some poor quality games!");
});

process.on('unhandledRejection', console.error);

//must be at the bottom
console.log("attempting a login");
client.login(token);
console.log("logged in?");