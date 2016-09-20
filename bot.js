//help
//import the discord.js module
const Discord = require('discord.js');

//create instance of a Discord Client
const bot = new Discord.Client();
const token = 'MjI1MzQ1NjYxNTkwMDQ0Njcy.CrntFw.jHDKx9Mj2ExBa6twSz7lywTu2-o';
const prefix = 'fuzzy ';
const botId = '225345661590044672';

/* list of owners that can invoke owner-only commands
 */
 const ownerId = [
 	"133352797776248832", //andrew
 	"134090963395149824" //fuzzy
 ];

/* list of people to ignore (usually other bots)
 */
 const ignoreList = [
 	"168850640972283905", //flora bot
 	"225345661590044672"  //itself
 ];

bot.on('ready', () => {

	console.log('I am ready!');
 });

bot.on('message', message =>{
	//scope variables////////////////
	var msg = message.content;
	var suffix = message.content.substring(message.content.indexOf(" ")+1);
	var msgChannel = message.channel;
	/////////////////////////////////

	if(ignoreList.indexOf(message.author.id) != -1) return; //self-ignore: ignores any text bot says so it doesn't potentially respond to itself

	/* .ping
	 * Checks to see if the bot if alive by replying 'pong'
	 */
	 if(msg === prefix+"ping"){
	 	msgChannel.sendMessage("pong");
		return;
	 }

	/* .uptime
	 * Checks how long the bot has been operational
	 */
	 if(msg === prefix+"uptime"){
		try{
			let time = process.uptime();
			let hours = Math.floor(time/3600);
			time = time - hours*3600;
			let minutes = Math.floor(time/60);
			let seconds = Math.floor(time - minutes * 60);
			msgChannel.sendMessage("`Uptime: "+hours+" hours, "+minutes+" minutes, "+seconds+" seconds`");
		}
		catch(err){
			msgChannel.sendMessage("`"+err+"`");
		}
	 }

	/* .restart
	 * Restarts the bot with any code changes
	 */
 	 if(msg === prefix+"restart" && ownerId.indexOf(message.author.id) != -1){
		msgChannel.sendMessage("`Restarting...`").then(() => {
		process.exit(1);});
	 }

	/* .delete
	 * Deletes specified number of messages from channel
	 */
	 if(msg.startsWith(prefix+"delete")){
		try{
			let hasParams = message.mentions.users.size > 0 || message.content.substring(prefix.length + 7).length != 0; //7 represents length of 'delete' and space
			if(hasParams){
				if(message.mentions.users.size > 0){
					let usrID = message.mentions.users.first().id;
					let messageCount = parseInt(message.content.substring(prefix.length+7+usrID.length+4)) +1;
					message.channel.fetchMessages({limit:messageCount}).then(messages=>{
						messages.forEach(function(entry){
							if(entry.author.id == usrID) entry.delete();
						});
					});
				}
				else{
					let messageCount = parseInt(message.content.substring(prefix.length+7)) +1;
					message.channel.fetchMessages({limit:messageCount}).then(messages=>message.channel.bulkDelete(messages));
				}
			}
			else{
				let usageInfo = [
				"**Usage info:**",
				"`"+prefix+"delete [@user] X`",
				"*@user* (optional) - Target mentioned user",
				"*X* - Delete from the last amount of messages"
				];
				msgChannel.sendMessage(usageInfo);
				return;
			}
		}
		catch(err){
			msgChannel.sendMessage("`"+err+"`");
		}
	 }

	/* .setname
	 * Changes the username of the bot (limited to 2 requests/hr)
	 * Only useable by anyone set as ownerId (for obvious reasons)
	 */
	 if(msg.startsWith(prefix+"setname") && ownerId.indexOf(message.author.id) != -1){
		try{
			let str = prefix+"setname";
			bot.user.setUsername(msg.substring(str.length+1));
		}
		catch(err){
			msgChannel.sendMessage("`"+err+"`");
		}
	 }

	/* .setstatus
	 * Changes the 'currently playing' status/game of the bot
	 * Only useable by ownerId (for obvious reasons)
	 */
	 if(msg.startsWith(prefix+"setstatus") && ownerId.indexOf(message.author.id) != -1){
	 	try{
	 		let str = prefix+"setstatus";
	 		bot.user.setStatus("online", msg.substring(str.length+1));
	 	}
	 	catch(err){
	 		msgChannel.sendMessage("`"+err+"`");
	 	}
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

    /* .kick
     * Kicks a single tagged user from server if message author has kick permissions
     */
     if(msg.startsWith(prefix+"kick")){
     	let guildUser = message.guild.member(message.author); //creates a guild user of message author
     	try{
	     	if(guildUser.permissions.hasPermission("KICK_MEMBERS") && message.mentions.users.size === 1){
	     		let reason = msg.substring(msg.indexOf("-reason")+8);
	     		let user = message.guild.member(message.mentions.users.first());
	     		user.kick();
	     		if(reason.length != 0){
	     			user.sendMessage("You were kicked from **" + message.guild.name + "** for the following reason: \n" + "```"+reason+"```");
	     		}
	     		msgChannel.sendMessage("Kicked <@" + user.id + ">");
	     	}
	     	else{
	     		let usageInfo = [
	     		"**kick**: Kicks the tagged user (limit 1 tag per command) from the server",
	     		"`"+prefix+"kick @user [-reason ...]`",
	     		"`-reason ...` (optional) : Messages the kicked user the reason why they were kicked",
	     		"`Example) "+prefix+"kick @user -reason Verbal abuse`"
	     		];
	     		msgChannel.sendMessage(usageInfo);
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
			let usageInfo = [
				"**Info:** Gets a single tagged user's profile information.",
				"`"+prefix+"info @user [-pm]`",
				"`-pm` (optional) : Messages the user info privately in a direct message",
			];
			msgChannel.sendMessage(usageInfo);
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

	//legacy command left in for luls
	if(msg === 'fuzzy') {
		var id = "134090963395149824";
		var textArray = [
			"is a tsun",
			"is a gremlin",
			"is bae",
			"is haramBAE #neverforget",
			"is pretty cute..i suppose",
			"loves <@130784194925297664>",
			"loves <@147447799573774336>",
			"loves <@91725497318244352>",
			"hates <@133352797776248832> :frowning:",
			"can't speel",
			"is sleeping",
			"is a dorito chip",
			"is currently zzzz",
			"derp",
			"is a hipster",
			"is a dank meme",
			"has imp ears",
			"hnnnnggg",
			"java >> python"
		];
		msgChannel.sendMessage("<@"+id+"> "+textArray[Math.floor(Math.random()*textArray.length)]);
		return;
	}
 });

bot.login(token);
