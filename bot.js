//import the discord.js module
const Discord = require('discord.js');
var fs = require('fs');
var sys = require('util');
var jsonfile = require('jsonfile');


//// GLOBAL VARIABLES /////
const bot = new Discord.Client();
const token = 'MjI1MzQ1NjYxNTkwMDQ0Njcy.CrntFw.jHDKx9Mj2ExBa6twSz7lywTu2-o';
var prefix = "!";
const devId = "133352797776248832"; // dev's id
const adminrole = "Bot Admin";

//FILE PATHS
const ignorepath = './etc/ignoreList.txt';
const settingspath = './etc/server_settings.json';
const ownerpath = './etc/ownerlist.txt';

/////////////////////////////

//dont touch these - they are initialized from the code. edit thru text file
var ownerId = [];
var ignoreList = [];


bot.on('ready', () => {
	console.log("Hello, world.");
	fs.readFile('./etc/ownerlist.txt', function(err, data){
	 	if(err) throw err;
	 	ownerId = data.toString().split('\n');
	 	console.log("Loaded owners list.");
 	});
 	//setInterval(function(){ console.log("Hello"); }, 3000);

});

bot.on('guildMemberAdd', (guild, member) => {
	jsonfile.readFile(settingspath, function(err, obj){
		if(err) throw err;
		if(obj[guild.id][0].hasOwnProperty('defaultrole') && obj[guild.id][0].defaultrolestatus === "enabled") 
			member.addRole(guild.roles.find('name', obj[guild.id][0].defaultrole));
		if(obj[guild.id][0].hasOwnProperty('greetmsg') && obj[guild.id][0].greetmsgstatus === "enabled") {
			let greet = obj[guild.id][0].greetmsg;
			if(greet.includes("@user")) greet = greet.replace("@user", "<@"+member.id+">");
			guild.channels.find('name', obj[guild.id][0].greetch).sendMessage(greet);
		}
		if(obj[guild.id][0].hasOwnProperty('greetpm') && obj[guild.id][0].greetpmstatus === "enabled") 
			member.sendMessage(obj[guild.id][0].greetpm);
		if(obj[guild.id][0].hasOwnProperty('logchannel') && obj[guild.id][0].logchannelstatus === "enabled"){
			guild.channels.find('name', obj[guild.id][0].logchannel).sendMessage(":white_check_mark: <@"+member.id+"> has joined the server.");
		}
	});
});

bot.on('guildMemberRemove', (guild, member) => {
	jsonfile.readFile(settingspath, function(err, obj){
		if(err) throw err;
		if(obj[guild.id][0].hasOwnProperty('logchannel') && obj[guild.id][0].logchannelstatus === "enabled"){
			guild.channels.find('name', obj[guild.id][0].logchannel).sendMessage(":x: <@"+member.id+"> has left the server.")
		}
	})
});

bot.on('guildCreate', (guild)=>{
	jsonfile.readFile(settingspath, function(err, obj){
		if(err) console.log(err);
		obj[guild.id] = [];
		obj[guild.id].push({name: guild.name});
		obj[guild.id][0]["ignoredUsers"] = [];
	 	obj[guild.id][0]["ownerUsers"] = [];
	 	obj[guild.id][0]["events"] = [];
		jsonfile.writeFile(settingspath, obj, function(err){
			if(err) console.log(err);
		});
	});
});


bot.on('message', message =>{
	//#scope variables////////////////
	var msg = message.content;
	var msgChannel = message.channel;
	cmd = msg.slice(prefix.length).split(" ");
	/////////////////////////////////
	/*jsonfile.readFile(settingspath, function(err, obj){
		ignoreList = obj[message.guild.id][0].ignoredUsers;
	});
	if(!(ownerId.indexOf(message.author.id) != -1) && ignoreList.indexOf(message.author.id) != -1) return; //if being ignored*/
	if(message.author.bot) return;


	/* #init 
	  * initializes the json settings for the server command was issued from.
	  */
	 if(msg.startsWith(prefix+"init")){
	 	if(!message.guild.member(message.author).roles.exists('name', adminrole)){
	 			msgChannel.sendMessage(":warning: Sorry! You must have the `"+adminrole+"` role to do that. Please contact an adult.");
	 			return;
	 	}
	 	jsonfile.readFile(settingspath, function(err, obj){
	 		if (err) console.log(err);
	 		if(!obj.hasOwnProperty(message.guild.id) || msg.includes("--reset")){
	 			obj[message.guild.id] = [];
	 			obj[message.guild.id].push({name: message.guild.name});
	 			obj[message.guild.id][0]["ignoredUsers"] = [];
	 			obj[message.guild.id][0]["ownerUsers"] = [];
	 			obj[message.guild.id][0]["events"] = [];
	 			jsonfile.writeFile(settingspath, obj, function(err){ if(err) console.log(err); });
	 			msgChannel.sendMessage("`Server settings initialized.`");
	 		}
	 		else{
	 			msgChannel.sendMessage("`Settings for this server already initialized!`");
	 		}
	 	});
	 }

	/* #about
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
	 		"Noble Experiment#9092. Created by dev#4317",
	 		"",
	 		"This bot is specifically catered towards guild/clan management. If you have any feature suggestions or bugs, please join my server. :)",
	 		"",
	 		"Uptime: " +hours + " hr, " + minutes + " min, " + seconds + " sec",
	 		"Servers: " + bot.guilds.size,
	 		"",
	 		"NOBLE Bot Server: <https://discord.gg/b8trXJv>",
	 		"",
	 		"Invite this bot to your server: ",
	 		"https://discordapp.com/oauth2/authorize?&client_id=225345661590044672&scope=bot&permissions=0",
	 		"```"
	 		]);
	 }

	/* #help
	 * Shows the help usage text for a command, or shows the list of commands
	 */
	 if(msg.startsWith(prefix+"help")){
	 }

	/* #ping
	 * Checks to see if the bot if alive by replying 'pong'
	 */
	 if(msg === prefix+"ping"){
	 	var d = new Date();
	 	console.log(d.getDate());
	 	console.log(d.getMonth());
	 	msgChannel.sendMessage("pong");
	 }

	/* #delete
	 * Deletes messages based on args
	 */
	 if(msg.startsWith(prefix+"delete")){
	 	if(message.guild.member(message.author).roles.exists('name', adminrole) || message.guild.member(message.author).permissions.hasPermission("MANAGE_MESSAGES") || message.author.id === devId){
		 	if(cmd[1] === "contains"){
		 		let x = msg.replace(""+prefix+"delete contains ", "");
		 		message.channel.fetchMessages().then(messages=>{
		     		message.channel.bulkDelete(messages.filter(entry=> entry.content.includes(x)));
		     	});
		     	msgChannel.sendMessage("Deleted messages containing `"+x+ "`").then(msg=>msg.delete(5000));
		 	}
		 	else if(!isNaN(cmd[1]) && parseInt(cmd[1]) >= 0){
		 		let id = message.id;
		 		message.channel.fetchMessages({limit:(parseInt(cmd[1])+1)}).then(messages=>{
		 			message.channel.bulkDelete(messages);
		 		});
		 	}
		 	else if(message.mentions.users.size > 0){
		 		let userIDs = [];
	 			message.mentions.users.forEach(function(entry){
	 				userIDs.push(entry.id);
	 			});
	 			message.channel.fetchMessages().then(messages=>{
	 				message.channel.bulkDelete(messages.filter(entry => userIDs.indexOf(entry.author.id) !== -1));
	 			});
	 			message.delete(5000);
		 	}
		 	else{
		 		msgChannel.sendMessage("placeholder");
		 	}
	 	}
	 	else{
	 		msgChannel.sendMessage(":warning: Sorry! You must have the `"+adminrole+"` role or `Manage Messages` permissions to do that. Please contact an adult.");
	 		return;
	 	}
	 }	 

	/* #ignore
	  */
	 if(msg.startsWith(prefix+"ignore")){
	 	if(ownerId.indexOf(message.author.id) == -1){
	 		msgChannel.sendMessage(":warning: `Sorry! You must have the `Bot Admin` role to do that. Please contact an adult.");
	 			return;
	 	}
	 	if(message.mentions.users.size > 0){
		 	jsonfile.readFile(settingspath, function(err, obj){
		 		let server = obj[message.guild.id][0];
		 		let ignored = server.ignoredUsers;
		 		let msglog = [];
		 		message.mentions.users.forEach(function(entry){
		 			if(ignored.indexOf(entry.id) == -1){
		 				ignored.push(entry.id);
		 				msglog.push(":white_check_mark: `"+entry.username+" successfully added to ignore list.`");
		 			}
		 			else{
		 				msglog.push(":warning: `"+entry.username+" is already being ignored.`");
		 			}
		 		});
		 		jsonfile.writeFile(settingspath, obj, function(err){});
		 		msgChannel.sendMessage(msglog);
		 	});
	 	}
	 	else{
	 		msgChannel.sendMessage("placeholder");
	 	}
	 }

	/* #unignore
	 */
	 if(msg.startsWith(prefix+"unignore")){
	 	if(ownerId.indexOf(message.author.id) == -1){
	 		msgChannel.sendMessage(":warning: `Sorry! You must have the `Bot Admin` role to do that. Please contact an adult.");
	 			return;
	 	}
	 	if(message.mentions.users.size >= 1){
	 		jsonfile.readFile(settingspath, function(err, obj){
		 		let server = obj[message.guild.id][0];
		 		let ignored = server.ignoredUsers;
		 		let msglog = [];
		 		message.mentions.users.forEach(function(entry){
		 			if(ignored.indexOf(entry.id) > -1){ //exists in ignored list
		 				ignored = ignored.splice(ignored.indexOf(entry.id), 1);
		 				msglog.push(":white_check_mark: `"+entry.username+" successfully removed from ignore list`");
		 			}
		 			else{
		 				msglog.push(":warning: `"+entry.username+" is not being ignored.`");
		 			}
		 		});
		 		jsonfile.writeFile(settingspath, obj, function(err){});
		 		msgChannel.sendMessage(msglog);
	 		});
	 	}
	 	else{
	 		msgChannel.sendMessage("placeholder");
	 	}
	 }

	/* #set
	 * various set functions
	 */
	 if(msg.startsWith(prefix+"set") && cmd.length > 2){
 		if(message.guild.member(message.author).roles.exists('name', adminrole) || message.author.id === devId){
 			
		 	let x = msg.substring((prefix+"set "+cmd[1]+" ").length);
		 	if(cmd[1] === "username") bot.user.setUsername(x);
		 	else if(cmd[1] === "nickname") message.guild.member(bot.user).setNickname(x);
		 	else if(cmd[1] === "status") bot.user.setStatus("online", x);
		 	else if(cmd[1] === "defaultrole"){
		 		jsonfile.readFile(settingspath, function(err, obj){
		 			if(err) { msgChannel.sendMessage("`"+err+"`"); return; }
		 			if(message.guild.roles.exists('name', x)){
		 				obj[message.guild.id][0]["defaultrole"] = x;
		 				obj[message.guild.id][0]["defaultrolestatus"] = "enabled";
		 				jsonfile.writeFile(settingspath, obj, function(err){if(err)throw err;});
		 				msgChannel.sendMessage("`Default role on this server set to: " + x +"`");
		 			}
		 			else msgChannel.sendMessage("`ERROR: No such role exists on this server!`");
		 		});
		 	}
		 	else if(cmd[1] === "greetmsg"){
		 		jsonfile.readFile(settingspath, function(err, obj){
		 			if(err) { msgChannel.sendMessage("`"+err+"`"); return; }
	 				obj[message.guild.id][0]["greetmsg"] = x;
	 				obj[message.guild.id][0]["greetch"] = message.channel.name;
	 				obj[message.guild.id][0]["greetmsgstatus"] = "enabled";
	 				jsonfile.writeFile(settingspath, obj, function(err){ if(err) msgChannel.sendMessage("`"+err+"`");});
					msgChannel.sendMessage("`Greet message successfully set.`");

		 		});
		 	}
		 	else if(cmd[1] === "greetpm"){
		 		jsonfile.readFile(settingspath, function(err, obj){
		 			if(err) { msgChannel.sendMessage("`"+err+"`"); return; }
		 			obj[message.guild.id][0]["greetpm"] = x;
		 			obj[message.guild.id][0]["greetpmstatus"] = "enabled";
		 			jsonfile.writeFile(settingspath, obj, function(err){ if(err) msgChannel.sendMessage("`"+err+"`"); });
		 			msgChannel.sendMessage("`Greet private message successfully set.`");
		 		});
		 	}
		 	else if(cmd[1] === "logchannel"){
		 		if(message.guild.channels.exists('name', x)){
			 		jsonfile.readFile(settingspath, function(err, obj){
			 			if(err){msgChannel.sendMessage("`"+err+"`"); return; }
			 			obj[message.guild.id][0]["logchannel"] = x;
			 			obj[message.guild.id][0]["logchannelstatus"] = "enabled";
			 			jsonfile.writeFile(settingspath, obj, function(err) { if(err) msgChannel.sendMessage("`"+err+"`")});
			 			msgChannel.sendMessage("`Logging new and exiting users in #"+x+"`");
			 		})
		 		}
		 		else msgChannel.sendMessage("`That channel does not exist on this server, or I do not have access to that channel.`");
		 	}
		 	else{
		 		msgChannel.sendMessage(":warning: You have entered a `set` command that I didn't recognize. Type `"+prefix+"help set` for usage information"); 
		 	}
	 	}
	 	else{
	 		msgChannel.sendMessage(":warning: Sorry! You must have the `"+adminrole+"` role to do that. Please contact an adult.");
 			return;
 		}
	 }

    /* #toggle
	 *
	 */
	 if(msg.startsWith(prefix+"toggle") && cmd.length > 1){
	 	if(message.guild.member(message.author).roles.exists('name', adminrole) || message.author.id === devId){
 		
			let x = msg.substring((prefix+"toggle "+cmd[1]+" ").length);
			jsonfile.readFile(settingspath, function(err, obj){
				if(err){msgChannel.sendMessage("`"+err+"`"); return; }
				if(cmd[1] === "greetmsg"){
					if(obj[message.guild.id][0].greetmsgstatus === "enabled") obj[message.guild.id][0].greetmsgstatus = "disabled";
					else obj[message.guild.id][0].greetmsgstatus = "enabled";
					let status = obj[message.guild.id][0].greetmsgstatus;
					jsonfile.writeFile(settingspath, obj, function(err){ if(err) msgChannel.sendMessage("`"+err+"`"); return;});
					msgChannel.sendMessage("`Greet message is now "+status+" on this server.`");
				}
				else if(cmd[1] === "greetpm"){
					if(obj[message.guild.id][0].greetpmstatus === "enabled") obj[message.guild.id][0].greetpmstatus = "disabled";
					else obj[message.guild.id][0].greetpmstatus = "enabled";
					let status = obj[message.guild.id][0].greetpmstatus;
					jsonfile.writeFile(settingspath, obj, function(err){ if(err) msgChannel.sendMessage("`"+err+"`"); return;});
					msgChannel.sendMessage("`Greet PM is now "+status+" on this server.`");
				}
				else if(cmd[1] === "defaultrole"){
					if(obj[message.guild.id][0].defaultrolestatus === "enabled") obj[message.guild.id][0].defaultrolestatus = "disabled";
					else obj[message.guild.id][0].defaultrolestatus = "enabled";
					let status = obj[message.guild.id][0].defaultrolestatus;
					jsonfile.writeFile(settingspath, obj, function(err){ if(err) msgChannel.sendMessage("`"+err+"`"); return;});
					msgChannel.sendMessage("`Default role is now "+status+" on this server.`");
				}
				else if(cmd[1] === "logchannel"){
					if(x.includes("#")) x = x.replace("#", "");
					if(obj[message.guild.id][0].logchannelstatus === "enabled") obj[message.guild.id][0].logchannelstatus = "disabled";
					else obj[message.guild.id][0].logchannelstatus = "enabled";
					let status = obj[message.guild.id][0].logchannelstatus;
					jsonfile.writeFile(settingspath, obj, function(err){ if(err) msgChannel.sendMessage("`"+err+"`"); return;});
					msgChannel.sendMessage("`LogChannel is now "+status+" on this server.`");
				}
				else{
					msgChannel.sendMessage(":warning: You have entered a `toggle` command that I didn't recognize. Type `"+prefix+"help toggle` for usage information"); 
				}
			});
		}
		else{
			msgChannel.sendMessage(":warning: Sorry! You must have the `"+adminrole+"` role to do that. Please contact an adult.");
 			return;
 		}
		

	 }

	/* #get
	 */
	 if(msg.startsWith(prefix+"get") && cmd.length > 1){
	 	if(message.guild.member(message.author).roles.exists('name', adminrole) || message.author.id === devId){

		 	let x = msg.substring((prefix+"toggle "+cmd[1]+" ").length);
			jsonfile.readFile(settingspath, function(err, obj){
				let info = obj[message.guild.id][0];
				if(cmd[1] === 'greetmsg'){
					if(info.hasOwnProperty('greetmsg')) 
						msgChannel.sendMessage("The current greet message is set to: ```"+info.greetmsg+"``` and it is **"+ info.greetmsgstatus+"** in channel #"+info.greetch);
					else 
						msgChannel.sendMessage("`There is currently no greet message set. To set a greet message, type ["+ prefix + "set greetmsg <msg>] in the channel you wish to activate it in.`");
				}
				else if(cmd[1] === 'greetpm'){
					if(info.hasOwnProperty('greetpm')) 
						msgChannel.sendMessage("The current greet pm is set to: ```"+info.greetpm+"``` and it is **"+info.greetpmstatus+"** on this server.");
					else
						msgChannel.sendMessage("`There is currently no greet pm set. To set a greet pm, type ["+ prefix + "set greetpm <msg>]`");
				}
				else if(cmd[1] === 'defaultrole'){
					if(info.hasOwnProperty('defaultrole')) 
						msgChannel.sendMessage("The current default role is set to: `"+info.defaultrole+"` and it is **"+info.defaultrolestatus+"** on this server.");
					else
						msgChannel.sendMessage("`There is currently no default role set. To set a deafult role, type ["+ prefix + "set defaultrole <role name>]`");
				}
				else if(cmd[1] === 'logchannel'){
					if(info.hasOwnProperty('logchannel')) 
						msgChannel.sendMessage("The current logging channel is set to: #"+info.logchannel+" and it is **"+info.logchannelstatus+"** on this server.");
					else
						msgChannel.sendMessage("`There is currently no logging channel set. To set a logging channel, type ["+ prefix + "set logchannel <channel name>]`");
				}
				else if(cmd[1] === 'ignored'){
					if(ignoreList.length > 0){
						let usrs = [];
						ignoreList.forEach(function(entry){
							usrs.push(message.guild.fetchMember(entry).username);
						});
						msgChannel.sendMessage("Currently ignored users: ```"+usrs+"```");
					}
					else{
						msgChannel.sendMessage("`Currently ignoring no users.`");
					}
				}
				else{
					msgChannel.sendMessage(":warning: You have entered a `get` command that I didn't recognize. Type `"+prefix+"help get` for usage information"); 
				}
			});	
		}
		else{
			msgChannel.sendMessage(":warning: Sorry! You must have the `"+adminrole+"` role to do that. Please contact an adult.");
 			return;
 		}
	 }

	/* #try
	 * Evaluates the line of code via a string passed into the bot.
	 * Only useable by ownerId (for security reasons)
	 */
	 if(msg.startsWith(prefix+"try") && message.author.id === devId){
		try{
			let str = prefix+"try";
			let toEval = msg.substring(str.length+1);
			msgChannel.sendMessage("`"+eval(toEval)+"`");
		}
		catch(err){
			msgChannel.sendMessage("`"+err+"`");
		}
	 }

	/* #ban
     * Bans a single tagged user from server if message author has ban permissions
     */
     if(msg.startsWith(prefix+"ban")){
     	if(message.guild.member(message.author).roles.exists('name', adminrole) || message.guild.member(bot.user).permissions.hasPermission("BAN_MEMBERS")){
	     	let guildUser = message.guild.member(message.author); //creates a guild user of message author
     		if(!message.guild.member(bot.user).permissions.hasPermission("BAN_MEMBERS")){
     			msgChannel.sendMessage("`Error: I don't have the necessary permissions for that!`");
     			return;
     		}
	     	if(guildUser.permissions.hasPermission("BAN_MEMBERS") && message.mentions.users.size === 1){
	     		jsonfile.readFile(settingspath, function(err, obj){
					if(err) throw err;
		     		let reason = "";
		     		if(msg.indexOf("--") != -1) reason = msg.substring(msg.indexOf("--")+2);
		     		let user = message.guild.member(message.mentions.users.first());
		     		user.ban();
		     		if(reason.length != 0){
		     			user.sendMessage("You were banned from **" + message.guild.name + "** for the following reason: \n" + "```"+reason+"```");
		     			if(obj[message.guild.id][0].hasOwnProperty('logchannel') && obj[message.guild.id][0].logchannelstatus === "enabled"){
							message.guild.channels.find('name', obj[message.guild.id][0].logchannel).sendMessage(":no_entry_sign: <@"+user.id+"> has been banned from the server by <@"+message.author.id+"> for the following reason: ```"+reason+"```");
						}
		     		}
		     		else{
		     			if(obj[message.guild.id][0].hasOwnProperty('logchannel') && obj[message.guild.id][0].logchannelstatus === "enabled"){
							message.guild.channels.find('name', obj[message.guild.id][0].logchannel).sendMessage(":no_entry_sign: <@"+user.id+"> has been banned from the server by <@"+message.author.id+">. No reason specified.");
						}
		     		}
		     		msgChannel.sendMessage("Banned <@" + user.id + ">");
				});
	     	}
	     	else{
	     		//msgChannel.sendMessage(help["ban"]);
	     	}
	    }
	    else{
	     	msgChannel.sendMessage(":warning: Sorry! You must have the `"+adminrole+"` role or Ban permissions to do that. Please contact an adult.");
 			return;
 		}
     }

    /* #kick
     * Kicks a single tagged user from server if message author has kick permissions
     */
     if(msg.startsWith(prefix+"kick")){
     	if(message.guild.member(message.author).roles.exists('name', adminrole) || message.guild.member(bot.user).permissions.hasPermission("KICK_MEMBERS") || message.author.id === devId){
	     	let guildUser = message.guild.member(message.author); //creates a guild user of message author
	 		if(!message.guild.member(bot.user).permissions.hasPermission("KICK_MEMBERS")){
	 			msgChannel.sendMessage("`Error: I don't have the necessary permissions for that!`");
	 			return;
	 		}
	     	if(message.mentions.users.size === 1){
	     		jsonfile.readFile(settingspath, function(err, obj){
					if(err) throw err;
		     		let reason = "";
		     		if(msg.indexOf("--") != -1) reason = msg.substring(msg.indexOf("--")+2);
		     		let user = message.guild.member(message.mentions.users.first());
		     		user.kick();
		     		if(reason.length != 0){
		     			user.sendMessage("You were kicked from **" + message.guild.name + "** for the following reason: \n" + "```"+reason+"```");
		     			if(obj[message.guild.id][0].hasOwnProperty('logchannel') && obj[message.guild.id][0].logchannelstatus === "enabled"){
		     				message.guild.channels.find('name', obj[message.guild.id][0].logchannel).sendMessage(":no_entry_sign: <@"+user.id+"> has been kicked from the server by <@"+message.author.id+"> for the following reason: ```"+reason+"```");
		     			}
		     		}
		     		else{
		     			if(obj[message.guild.id][0].hasOwnProperty('logchannel') && obj[message.guild.id][0].logchannelstatus === "enabled"){
		     				message.guild.channels.find('name', obj[message.guild.id][0].logchannel).sendMessage(":no_entry_sign: <@"+user.id+"> has been kicked from the server by <@"+message.author.id+">. No reason specified.");
		     			}
		     		}
		     		msgChannel.sendMessage("Kicked <@" + user.id + ">");
				});
	     	}
	     	else{
	     		//msgChannel.sendMessage(help["kick"]);
	     	}
	    }
     	else{
	     	msgChannel.sendMessage(":warning: Sorry! You must have the `"+adminrole+"` role or Ban permissions to do that. Please contact an adult.");
 			return;
 		}
     }

	/* #info
	 * Pulls information about the tagged user and outputs it in channel or PM with the optional -pm tag.
	 */
	 if(msg.startsWith(prefix+"info")){
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
			"**Joined this server on: **" + guildUser.joinDate,
			"**Account created: **" + user.creationDate,
			"**Avatar URL: **" + user.avatarURL
		];
		if(msg.indexOf("--pm") != -1){
			message.author.sendMessage(infoArray);
		}
		else{
			msgChannel.sendMessage(infoArray);
		}
	 }


	/* #assign
	 */
	 if(msg.startsWith(prefix+"assign")){
	 	let usr = message.guild.member(message.author);
	 	if(usr.roles.exists('name', adminrole) || usr.hasPermission("MANAGE_ROLES_OR_PERMISSIONS")){
	 		let rolename = "";
	 		for(var k in cmd){
	 			if(cmd[k].includes("<@") || cmd[k].includes("assign")) continue;
	 			else{
	 				rolename = cmd[k];
	 				break;
	 			}
	 		}
	 		if(message.guild.roles.exists('name', rolename)){
	 			message.mentions.users.forEach(function(entry){
	 				message.guild.member(entry).addRole(message.guild.roles.find('name', rolename));
	 			});
	 		}
	 		else{
	 			msgChannel.sendMessage(":warning: The role `"+rolename+"` does not exist.");
	 		}
	 	}
	 	else{
	 		msgChannel.sendMessage(":warning: You do not have sufficient permissions to do that. Please contact an adult.");
	 	}
	 }

	/* #prunemembers
 	 */
 	 if(msg.startsWith(prefix+"prunemembers")){
 	 	if(message.guild.member(message.author).roles.exists('name', adminrole)){
 	 		if(cmd[1] >= '14'){
 	 			message.guild.pruneMembers(cmd[1]);
 	 		}
 	 		else{
 	 			msgChannel.sendMessage(":warning: Prune members blocked because number of days was set below the safeguard.");
 	 		}
 	 	}
 	 	else{
 	 		msgChannel.sendMessage(":warning: You do not have sufficient permissions to do that. Please contact an adult.");
 	 	}
 	 }


	if(msg.includes("--del")){message.delete();}
 });

bot.login(token);
