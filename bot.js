//import the discord.js module
const Discord = require('discord.js');
var fs = require('fs');
var readline = require('readline');
var lib = require('./lib/hello.js');
var sys = require('util');
var exec = require('child_process').exec;

//create instance of a Discord Client
const bot = new Discord.Client();
const token = 'MjI1MzQ1NjYxNTkwMDQ0Njcy.CrntFw.jHDKx9Mj2ExBa6twSz7lywTu2-o';
const prefix = 'frost ';

var ownerId = [];
var ignoreList = [];
 

//dictionary of help/usage info
const help = {
	"delete" : ["`"+prefix+"delete ...`",
				"Deletes messages that meet the specified criteria. User must have permissions.\n",
				"**Available parameters:**",
				"`"+prefix+"delete @user(s)` \n     Deletes all messages from the tagged users",
				"`"+prefix+"delete contains <text>` \n     Deletes all messages containing the text",
				"`"+prefix+"delete <number>` \n     Deletes specified number of messages"
				],
	"info"   :  ["`"+prefix+"info @user [-pm] [-hide]`",
				 "Gets the tagged user's profile information.\n",
				 "**Parameters:**",
				 "`@user`\n     (Required) The user to lookup",
				 "`-pm`\n     (Optional) Messages the user info in a private message",
				 "`-hide`\n     (Optional) Deletes the message that invoked this command."
				],
	"kick"   :  ["`"+prefix+"kick @user [--reason]`",
				 "Kicks the mentioned user from the discord server.\n",
				 "**Parameters:**",
				 "`@user`\n     (Required) The user to kick",
				 "`--reason`\n     (Optional) Once kicked, the user is messaged the specified reason\n     example usage: `"+prefix+"kick @user --Verbal Abuse`"
			    ],
	"ban"    :  ["`"+prefix+"ban @user [--reason]`",
				 "Bans the mentioned user from the discord server.\n",
				 "**Parameters:**",
				 "`@user`\n     (Required) The user to ban",
				 "`--reason`\n     (Optional) Once banned, the user is messaged the specified reason\n     example usage: `"+prefix+"ban @user --Verbal Abuse`"
			    ]
};

bot.on('ready', () => {
	console.log("Hello, world.");
	fs.readFile('./etc/ignoreList.txt', function(err, data){
	 	if(err) throw err;
	 	ignoreList = data.toString().split('\n');
	 	console.log("Loaded ignore list.");
 	});
 	fs.readFile('./etc/ownerlist.txt', function(err, data){
	 	if(err) throw err;
	 	ownerId = data.toString().split('\n');
	 	console.log("Loaded owners list.");
 	});
});

bot.on('guildMemberAdd', (guild, member) => {
  //console.log(member + " joined " + guild.name);
});

bot.on('message', message =>{
	//scope variables////////////////
	var msg = message.content;
	var msgChannel = message.channel;
	/////////////////////////////////
	if(!(ownerId.indexOf(message.author.id) != -1) && ignoreList.indexOf(message.author.id) != -1) return;
	if(message.author.bot) return; 
	//self-ignore: ignores any text bot says so it doesn't potentially respond to itself BUT overrides if on owner list


	if(msg.startsWith(prefix+ "push") && message.author.id === "133352797776248832"){
		let str = msg.substring((prefix+"push ").length);
		exec("git add *");
		exec('git commit -m "' + str+'"');
		exec('git push');
	}
	if(msg.startsWith(prefix+ "pull") && message.author.id === "133352797776248832"){
		exec("git fetch");
		exec("get pull");
	}
	/* .ignore
	 * Adds mentioned users to the ignore list. Bot will ignore commands originating from this user.
	 * Must be owner for obvious reasons.
	 */
	 if(msg.startsWith(prefix+"ignore") && message.mentions.users.size > 0 && ownerId.indexOf(message.author.id) != -1){
		let ignoredUsers = [];
		message.mentions.users.forEach(function(entry){
			if(ignoreList.indexOf(entry.id) != -1){ msgChannel.sendMessage("`"+entry.username + " is already being ignored! Not added.`");}
			else{
			fs.appendFile('./etc/ignoreList.txt', "\n"+entry.id, function(err){
				if(err) throw err;
				console.log("Added " + entry.id + " to the ignore list");
			})
			ignoreList.push(entry.id);
			ignoredUsers.push("`Now ignoring " + entry.username + "`");
			}
		});
		msgChannel.sendMessage(ignoredUsers);
	 }

	/* .unignore
	 * removes person from ignore list
	 */
	 if(msg.startsWith(prefix+"unignore") && message.mentions.users.size > 0 && ownerId.indexOf(message.author.id) != -1){
	 	
	 }

	/* .about
	 *
	 */
	 if(msg.startsWith(prefix+"about")){
	 	let time = process.uptime();
		let hours = Math.floor(time/3600);
		time = time - hours*3600;
		let minutes = Math.floor(time/60);
		let seconds = Math.floor(time - minutes * 60);
	 	msgChannel.sendMessage([
	 		"```java",
	 		"FROST Bot. Created by dev#4317",
	 		"",
	 		"Currently, I am being developed and worked on during spare time, so I may be limited in features. If you have any feature requests or bugs, please join my server.",
	 		"",
	 		"Uptime: " +hours + " hr, " + minutes + " min, " + seconds + " sec",
	 		"Servers: " + bot.guilds.size,
	 		"",
	 		"FROST Bot Server: <https://discord.gg/b8trXJv>",
	 		"",
	 		"Invite this bot to your server: ",
	 		"https://discordapp.com/oauth2/authorize?&client_id=225345661590044672&scope=bot&permissions=0",
	 		"```"
	 		]);
	 }

	/* .help
	 * Shows the help usage text for a command, or shows the list of commands
	 */
	 if(msg.startsWith(prefix+"help")){
	 	if(msg.length > (prefix+"help").length+1){
	 		msgChannel.sendMessage(help[msg.substring((prefix+"help").length+1)]);
	 	}
	 	else{
	 		msgChannel.sendMessage("I didn't recognize that command");
	 	}
	 }

	/* .ping
	 * Checks to see if the bot if alive by replying 'pong'
	 */
	 if(msg === prefix+"ping"){
	 	msgChannel.sendMessage("pong");
		return;
	 }

	/* .delete
	 * Deletes messages based on args
	 */
	 if(msg.startsWith(prefix+"delete") && message.guild.member(message.author).permissions.hasPermission("MANAGE_MESSAGES")){
	 		//checks firstmost if the bot has permission to manage messages
	 		try{
		 		if(!message.guild.member(bot.user).permissions.hasPermission("MANAGE_MESSAGES")){
	     			msgChannel.sendMessage("`Error: I don't have the necessary permissions for that!`");
	     			return;
	     		}
	     		let initmsg = message;
	     		let args = initmsg.content.substring((prefix+"delete").length +1).split(" ");
	     		/*let messageCount = 50; //default value of 0
	     		for(var n in args){
	     			if(!isNaN(args[n]) && parseInt(args[n]) > 0){
	     				messageCount = parseInt(args[n]);
	     				break;
	     			}
	     		}*/
	     		message.delete();
	     		if(hasMentions = initmsg.mentions.users.size > 0){
	     			let userIDs = [];
	     			initmsg.mentions.users.forEach(function(entry){
	     				userIDs.push(entry.id);
	     			});
	     			initmsg.channel.fetchMessages().then(messages=>{
	     				initmsg.channel.bulkDelete(messages.filter(function(entry){
	     					if(userIDs.indexOf(entry.author.id) != -1) return true;
	     				}));
	     			});
	     		}
	     		else if(args[0] === "contains"){
	     			initmsg.channel.fetchMessages().then(messages=>{
	     				initmsg.channel.bulkDelete(messages.filter(function(entry){
	     					if(entry.content.includes(args[1])) return true;
	     				}));
	     			});
	     		}
	     		else if(!isNaN(args[0]) && parseInt(args[0]) >= 0){
	     			initmsg.channel.fetchMessages({limit:(parseInt(args[0]))}).then(messages=>initmsg.channel.bulkDelete(messages));
	     		}
	     		else{
	     			msgChannel.sendMessage(help["delete"]);
	     		}
     		}
	     	catch(err){
	     		msgChannel.sendMessage(err);
	     	}

	 }	 

	/* .setname
	 * Changes the username of the bot (limited to 2 requests/hr)
	 * Only useable by anyone set as ownerId (for obvious reasons)
	 */
	 if(msg.startsWith(prefix+"setname") && ownerId.indexOf(message.author.id) != -1){
		bot.user.setUsername(msg.substring((prefix+"setname").length + 1));
	 }

	/* .setnickname
	 * Changes the nickname of the bot
	 * Only useable by anyone set as ownerId (for obvious reasons)
	 */
	  if(msg.startsWith(prefix+"setnickname") && ownerId.indexOf(message.author.id) != -1){
		message.guild.member(bot.user).setNickname(msg.substring((prefix+"setnickname").length+1));
	  }

	/* .setstatus
	 * Changes the 'currently playing' status/game of the bot
	 * Only useable by ownerId (for obvious reasons)
	 */
	 if(msg.startsWith(prefix+"setstatus") && ownerId.indexOf(message.author.id) != -1){
 		bot.user.setStatus("online", msg.substring((prefix+"setstatus").length+1));
	 }

	/* .try
	 * Evaluates the line of code via a string passed into the bot.
	 * Only useable by ownerId (for security reasons)
	 */
	 if(msg.startsWith(prefix+"try") && ownerId.indexOf(message.author.id) != -1){
		try{
			let str = prefix+"try";
			let toEval = msg.substring(str.length+1);
			msgChannel.sendMessage("`"+eval(toEval)+"`");
		}
		catch(err){
			msgChannel.sendMessage("`"+err+"`");
		}
	 }

	/* .ban
     * Bans a single tagged user from server if message author has ban permissions
     */
     if(msg.startsWith(prefix+"ban")){
     	let guildUser = message.guild.member(message.author); //creates a guild user of message author
     	try{
     		if(!message.guild.member(bot.user).permissions.hasPermission("BAN_MEMBERS")){
     			msgChannel.sendMessage("`Error: I don't have the necessary permissions for that!`");
     			return;
     		}
	     	if(guildUser.permissions.hasPermission("BAN_MEMBERS") && message.mentions.users.size === 1){
	     		let reason = "";
	     		if(msg.indexOf("--") != -1) reason = msg.substring(msg.indexOf("--")+2);
	     		let user = message.guild.member(message.mentions.users.first());
	     		user.ban();
	     		if(reason.length != 0){
	     			user.sendMessage("You were banned from **" + message.guild.name + "** for the following reason: \n" + "```"+reason+"```");
	     		}
	     		msgChannel.sendMessage("Banned <@" + user.id + ">");
	     	}
	     	else{
	     		msgChannel.sendMessage(help["ban"]);
	     	}
     	}
     	catch(err){
     		msgChannel.sendMessage("`"+err+"`");
     	}
     }

    /* .kick
     * Kicks a single tagged user from server if message author has kick permissions
     */
     if(msg.startsWith(prefix+"kick")){
     	let guildUser = message.guild.member(message.author); //creates a guild user of message author
     	try{
     		if(!message.guild.member(bot.user).permissions.hasPermission("KICK_MEMBERS")){
     			msgChannel.sendMessage("`Error: I don't have the necessary permissions for that!`");
     			return;
     		}
	     	if(guildUser.permissions.hasPermission("KICK_MEMBERS") && message.mentions.users.size === 1){
	     		let reason = "";
	     		if(msg.indexOf("--") != -1) reason = msg.substring(msg.indexOf("--")+2);
	     		let user = message.guild.member(message.mentions.users.first());
	     		user.kick();
	     		if(reason.length != 0){
	     			user.sendMessage("You were kicked from **" + message.guild.name + "** for the following reason: \n" + "```"+reason+"```");
	     		}
	     		msgChannel.sendMessage("Kicked <@" + user.id + ">");
	     	}
	     	else{
	     		msgChannel.sendMessage(help["kick"]);
	     	}
     	}
     	catch(err){
     		msgChannel.sendMessage("`"+err+"`");
     	}
     }

	/* .info
	 * Pulls information about the tagged user and outputs it in channel or PM with the optional -pm tag.
	 */
	 if(msg.startsWith(prefix+"info")){
		try{
		//if no mentions
		if(message.mentions.users.size == 0 || message.mentions.users.size > 1){
			msgChannel.sendMessage(help["info"]);
			return;
		}
		//idea for tags - splice them out into a different array and send that
		let user = message.mentions.users.first();
		let guildUser = message.guild.member(user);
		let gamename = "n/a";
		if(user.game != null){ gamename = user.game.name;}

		let infoArray = [
			"Showing information for user: **" + user.username + "#" + user.discriminator + "**",
			"**User ID: **" + user.id,
			"**Nickname(s): **" + user.username + ", " + guildUser.nickname,
			"**Status: **" + user.status,
			"**Currently playing: **" + gamename,
			"**Join date: **" + guildUser.joinDate,
			"**Account created: **" + user.creationDate,
			"**Avatar URL: **" + user.avatarURL
		];
		if(msg.indexOf("-pm") != -1){
			message.author.sendMessage(infoArray);
		}
		else{
			msgChannel.sendMessage(infoArray);
		}
		if(msg.indexOf("-hide") != -1){
			message.delete();
		}
		/*
		for(var key in infoArray){
			console.log("key " + key + " has value " + infoArray[key]);
			//console.log(guildUser.roles.array());
		}*/}
		catch(err){
			console.log(err);
			msgChannel.sendMessage("`"+err+"`");
		}
	 }


 });

bot.login(token);
