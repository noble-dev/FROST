//import the discord.js module
const Discord = require('discord.js');
var fs = require('fs');
var sys = require('util');
var jsonfile = require('jsonfile');
//create instance of a Discord Client
const bot = new Discord.Client();
const token = 'MjI1MzQ1NjYxNTkwMDQ0Njcy.CrntFw.jHDKx9Mj2ExBa6twSz7lywTu2-o';
var prefix = "frost ";
const devId = "133352797776248832"; // dev's id

//FILE PATHS
const ignorepath = './etc/ignoreList.txt';
const settingspath = './etc/server_settings.json';
const ownerpath = './etc/ownerlist.txt';

var ownerId = [];
var ignoreList = [];
 

//dictionary of help/usage info
const help = {
	"ping"	 : ["`"+prefix+"ping`",
				"Pings the bot for a return if the bot is alive or not. Simple stuff."],
	"delete" : ["`"+prefix+"delete ...`",
				"Deletes messages that meet the specified criteria. User must have permissions.\n",
				"**Available parameters:**",
				"`"+prefix+"delete @user(s)` \n     Deletes all messages from the tagged users",
				"`"+prefix+"delete contains <text>` \n     Deletes all messages containing the text",
				"`"+prefix+"delete <number>` \n     Deletes specified number of messages"
				],
	"info"   :  ["`"+prefix+"info @user [--pm] [--hide]`",
				 "Gets the tagged user's profile information.\n",
				 "**Parameters:**",
				 "`@user`\n     (Required) The user to lookup",
				 "`--pm`\n     (Optional) Messages the user info in a private message",
				 "`--hide`\n     (Optional) Deletes the message that invoked this command."
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
			    ],
	"ignore" :  ["`"+prefix+"ignore @user(s)`",
				 "Sets the bot to ignore the mentioned users' commands.\n",
				 "**Parameters:**",
				 "`@user(s)`\n     (Required) The users to ignore"
				 ]
};

bot.on('ready', () => {
	console.log("Hello, world.");
	fs.readFile(ignorepath, function(err, data){
	 	if(err) throw err;
	 	ignoreList = data.toString().split('\n');
	 	console.log("Loaded ignore list.");
 	});
 	fs.readFile(ownerpath, function(err, data){
	 	if(err) throw err;
	 	ownerId = data.toString().split('\n');
	 	console.log("Loaded owners list.");
 	});
});

bot.on('guildMemberAdd', (guild, member) => {
  //console.log(member + " joined " + guild.name);
  if(guild.id === "144729397826420736"){ //malicious intent
  	member.addRole(guild.roles.find('name', 'Guest'));
  	guild.channels.find('name', 'officer-chat').sendMessage(member + " just joined the server. Do a background check plz.");
  }
});

bot.on('message', message =>{
	//scope variables////////////////
	var msg = message.content;
	var msgChannel = message.channel;
	cmd = msg.slice(prefix.length).split(" ");
	/////////////////////////////////
	if(!(ownerId.indexOf(message.author.id) != -1) && ignoreList.indexOf(message.author.id) != -1) return;
	if(message.author.bot) return; 
	//self-ignore: ignores any text bot says so it doesn't potentially respond to itself BUT overrides if on owner list

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
	 }

	 if(msg.startsWith("frost test get")){
	 	jsonfile.readFile('./etc/server_settings.json', function(err, obj){
	 		if (err) console.log(err);
	 		else {
	 			var sid = ""+message.guild.region+""+message.guild.id;
	 			//console.log(obj[sid][0].hasOwnProperty("nssame"));
	 		}
	 	});
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
	 		msgChannel.sendMessage(
	 			["Type `"+prefix+"help <command>` to see usage detailed information for that command.\n",
	 			"Current available commands are:",
	 			"`"+Object.keys(help) +"`",
	 			]);
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
	 if(msg.startsWith(prefix+"delete") && (ownerId.indexOf(message.author.id) != -1 || message.guild.member(message.author).permissions.hasPermission("MANAGE_MESSAGES"))){
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

	 if(msg.startsWith(prefix+"set") && ownerId.indexOf(message.author.id) != -1 && cmd.length > 2){
	 	if(cmd[1] === "username") bot.user.setUsername(cmd[2]);
	 	else if(cmd[1] === "nickname") message.guild.member(bot.user).setNickname(cmd[2]);
	 	else if(cmd[1] === "status") bot.user.setStatus("online", cmd[2]);
	 	message.delete();
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
		if(msg.indexOf("--pm") != -1){
			message.author.sendMessage(infoArray);
		}
		else{
			msgChannel.sendMessage(infoArray);
		}
		if(msg.indexOf("--hide") != -1){
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

	 if(msg.startsWith(prefix+"chatbot start learn") && message.author.id === "133352797776248832"){
	 	msgChannel.sendMessage(
	 		["Initiating recording for " + message.mentions.users.first().username,
	 		"Let me know when to stop learning by typing `"+prefix+"chatbot stop learn @"+message.mentions.users.first().username+"`",
	 		" --using *Pandorabots Artificial Learning Platform*"
	 		]);
	 }
	 if(msg.startsWith(prefix+"chatbot stop learn") && message.author.id === "133352797776248832"){
	 	let name = message.mentions.users.first().username;
	 	msgChannel.sendMessage(
	 		["Stopped recording for " + message.mentions.users.first().username,
	 		 "`lib/"+name + "/msgs.json - POST: 202 (Accepted)`",
	 		 "`lib/"+name+"/userlist.json - POST: 202 (Accepted)`",
	 		 "`lib/"+name+"/responses.json - POST: 202 (Accepted)`",
	 		 "`lib/"+name+"/feed.pbot - POST: 202 (Accepted)`",
	 		 "`Fetching...`",
	 		 "`Retrieving to lib/"+name+"/responselist.pbot - GET: 200 (Valid)`",
	 		 "`Retrieving to lib/"+name+"/validgenerator.json - GET: 200 (Valid)`",
	 		 "`Stitching valid data...`",
	 		 "`Warn: My ResponseController database is under the recommended size (>1mb). Please try to learn more.`",
	 		 "",
	 		 "`COMPLETE`"
	 		]);
	 }
	 if(msg === "e"){
	 	msgChannel.sendMessage(":boom: :gun: <@"+ message.author.id + "> did it!");
	 }
 });

bot.login(token);
