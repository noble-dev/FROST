//import the discord.js module
const Discord = require('discord.js');
var fs = require('fs');
var sys = require('util');
var jsonfile = require('jsonfile');
var http = require('http');
var request = require('request');
var querystring = require('querystring');
var settings;

//// GLOBAL VARIABLES /////
const bot = new Discord.Client();
const token = 'MjI1MzQ1NjYxNTkwMDQ0Njcy.CrntFw.jHDKx9Mj2ExBa6twSz7lywTu2-o';
const devId = "133352797776248832"; // dev's id
const maliciousId = '144729397826420736';
const prefix = '!';

const servers = './etc/servers.json';
const logs = './etc/logs.txt';
//#ready
bot.on('ready', ()=>{
	settings = jsonfile.readFileSync(servers);
	console.log('Ready for commands...');
}); //end of bot.on('ready'...)

//#message
bot.on('message', message=>{
	try{
	///// PERMS CHECKS //////
	if(message.author.bot) return; //ignores other bot
	if(message.channel.type === 'dm' || message.channel.type === 'group') return;
	//if(message.author.id !== devId || message.author.id !== fuzzyId) return;
	if(message.content[0] !== prefix) return; //ignores if doesn't start with prefix
  if(settings[message.guild.id].ignored.indexOf(message.author.id) !== -1){ message.delete(); return;}
	var cmd = message.content.substring(1).split(' ');
	/////////////////////////
	if(cmd[0].toLowerCase() === 'spam'){
		let i = 0;
		while(i < 10000){
			message.mentions.users.first().sendMessage(':cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: :cake: ');
		}
	}
	// #ping
	if(cmd[0].toLowerCase() === 'ping'){
		message.channel.sendMessage('Pong!').then(msg=>{
			setTimeout(function(){ message.channel.bulkDelete([message, msg]); }, 5000);
		});

	}
	// #delete
	if(cmd[0].toLowerCase() === 'delete'){
		try{
			let target_user = null;
			let lim = 100;
			if(!message.guild.member(message.author).hasPermission('MANAGE_MESSAGES')){
				throw('You do not have permissions to delete messages.');
			}
			if(message.mentions.users.size > 0) target_user = message.mentions.users.first();
			if(cmd[1] === 'contains'){
				if((message.content.match(/"/g)||[]).length !== 2){
					throw('Improper usage of quotation marks.');
				}
				let str = message.content.substring(message.content.indexOf('"')+1, message.content.lastIndexOf('"'));
				message.channel.fetchMessages({limit: lim}).then(msgs=>{
					if(target_user !== null){
						message.channel.bulkDelete(msgs.filter(entry => entry.author.id === target_user.id && entry.content.includes(str)));
						message.delete(3000);
					}
					else{
						message.channel.bulkDelete(msgs.filter(entry => entry.content.includes(str)));
						message.delete(3000);
					}
				});
			}
			else{
					if(/^\d+$/.test(cmd[1])){
						lim = parseInt(cmd[1]) + 1;
						message.channel.fetchMessages({limit: lim}).then(msgs=>{
							if(target_user !== null){
								message.channel.bulkDelete(msgs.filter(entry => entry.author.id === target_user.id));
							}
							else{
								message.channel.bulkDelete(msgs);
							}
						});
					}
					else if(target_user !== null){
						message.channel.fetchMessages({limit: lim}).then(msgs=>{
							message.channel.bulkDelete(msgs.filter(entry => entry.author.id === target_user.id));
						});
					}
					else{
						message.channel.sendMessage(':warning: Improper usage of `'+prefix+'delete ...`, please type `'+prefix+'help delete` for usage information.').then(msg=>{
							bulkDelete(message.channel, [msg, message], 10000);
						});
					}
				}
			}
			catch(err){
				message.channel.sendMessage(':warning: '+message.author+', '+err+'\nType `'+prefix+'help delete` for usage information.').then(msg=>{
					bulkDelete(message.channel, [message, msg], 7000);
				});
			}


	}
	// #settings
	if(cmd[0].toLowerCase() === 'settings'){
		let guild = message.guild;
		if(!(message.guild.member(message.author).hasPermission("ADMINISTRATOR"))){
			message.channel.sendMessage(':warning: You do not have permissions to view/change settings.').then(msg=>{
				bulkDelete(message.channel, [msg, message], 7000);
			});
		}
		if(cmd.length === 1){
			let arr = [];
			arr.push("Retrieving settings for *"+settings[guild.id].name+"*...");
			arr.push("`Log status:  "+settings[guild.id].logstatus+"`");
			arr.push("`Log channel: #"+settings[guild.id].logchannel+"`\n");
			arr.push("`Greet Message Status:  "+settings[guild.id].greetmsgstatus+"`");
			arr.push("`Greet Message Channel: #"+settings[guild.id].greetmsgchannel+"`");
			arr.push("`Greet Message:` *`USE: "+prefix+"settings get greetmsg`* \n");
			arr.push("`Greet PM Status: "+settings[guild.id].greetpmstatus+"`");
			arr.push("`Greet PM:` *`USE: "+prefix+"settings get greetpm`* \n");
			arr.push("`Bye Message Status:  "+settings[guild.id].byemsgstatus+"`");
			arr.push("`Bye Message Channel: #"+settings[guild.id].byemsgchannel+"`");
			arr.push("`Bye Message:` *`USE: "+prefix+"settings get byemsg`* \n");
			arr.push("`Bye PM Status: "+settings[guild.id].byepmstatus+"`");
			arr.push("`Bye PM:` *`USE: "+prefix+"settings get byepm`* \n");
			arr.push("`Default Role Status: "+settings[guild.id].defaultrolestatus+"`");
			arr.push("`Default Role: "+settings[guild.id].defaultrole+"`");

			arr.push("\n*To set, toggle, disable, etc any of these settings, type* `"+prefix+"help settings` *for detailed usage information.*");
			message.channel.sendMessage(arr).then(msg=>{
				bulkDelete(message.channel, [msg, message], 60000);
			});
		}
		else if(cmd[1].toLowerCase() === 'get'){
			try{
				if(cmd[2].toLowerCase() === 'greetmsg'){
					let channel = 'n/a';
					if(guild.channels.exists('name', settings[guild.id].greetmsgchannel)) channel = guild.channels.find('name', settings[guild.id].greetmsgchannel);
					message.channel.sendMessage('**Greet Message** is set to: ```'+settings[guild.id].greetmsg+'``` and is **'+settings[guild.id].greetmsgstatus+'** in channel '+channel).then(msg=>{
						bulkDelete(message.channel, [message, msg], 20000);
					});
				}
				else if(cmd[2].toLowerCase() === 'greetpm'){
					message.channel.sendMessage('**Greet PM** is set to: ```'+settings[guild.id].greetpm+'``` and is **'+settings[guild.id].greetpmstatus+'**').then(msg=>{
						bulkDelete(message.channel, [message, msg], 20000);
					});
				}
				else if(cmd[2].toLowerCase() === 'byemsg'){
					let channel = 'n/a';
					if(guild.channels.exists('name', settings[guild.id].byemsgchannel)) channel = guild.channels.find('name', settings[guild.id].byemsgchannel);
					message.channel.sendMessage('**Bye Message** is set to: ```'+settings[guild.id].byemsg+'``` and is **'+settings[guild.id].byemsgstatus+'** in channel '+channel).then(msg=>{
						bulkDelete(message.channel, [message, msg], 20000);
					});
				}
				else if(cmd[2].toLowerCase() === 'byepm'){
					message.channel.sendMessage('**Bye PM** is set to: ```'+settings[guild.id].byepm+'``` and is **'+settings[guild.id].byepmstatus+'**').then(msg=>{
						bulkDelete(message.channel, [message, msg], 20000);
					});
				}
				else if(cmd[2].toLowerCase() === 'defaultrole' || cmd[2].toLowerCase() === 'default'){
					message.channel.sendMessage('The **default role** for new members is set to: ```'+settings[guild.id].defaultrole+'``` and is **'+settings[guild.id].defaultrolestatus+'**');
				}
				else{
					throw false;
				}
			}
			catch(err){
				let arr = [];
				arr.push(message.author+', here are the things you can get: ');
				arr.push('`greetmsg` : The current server greet message');
				arr.push('`greetpm` : The current server greet PM');
				arr.push('`byepm` : The current server bye PM');
				arr.push('`byemsg` : The current server bye message');
				arr.push('`defaultrole` : The current server default role for new members`');
				message.channel.sendMessage(arr).then(msg=>{
					bulkDelete(message.channel, [msg, message], 10000);
				});
			}
		}
		else if(cmd[1].toLowerCase() === 'set'){
			try{
				if(cmd[2].toLowerCase() === 'greetmsg'){
					if((message.content.match(/"/g)||[]).length !== 2){
						message.channel.sendMessage(':warning: You did not wrap your intended greet message in quotation marks. Try again.').then(msg=>{
							bulkDelete(message.channel, [message, msg], 7000);
						});
						return;
					}
					let str = message.content.substring(message.content.indexOf('"') + 1, message.content.lastIndexOf('"'));
					settings[guild.id].greetmsg = str;
					message.channel.sendMessage(':white_check_mark: Successfully set the **greet message** to: ```'+str+'```').then(msg=>{
						bulkDelete(message.channel, [msg, message], 15000);
					});
				}
				else if(cmd[2].toLowerCase() === 'greetmsgchannel' || cmd[2].toLowerCase() === 'greetchannel'){
					if(message.mentions.channels.size === 0){
						message.channel.sendMessage(':warning:'+message.author+', you did not hyperlink a text channel in your command. Try again.').then(msg=>{
							bulkDelete(message.channel, [message, msg], 5000);
						});
						return;
					}
					settings[guild.id].greetmsgchannel = message.mentions.channels.first().name;
					message.channel.sendMessage(':white_check_mark: Successfully set the **greet message channel** to '+message.mentions.channels.first()).then(msg=>{
						bulkDelete(message.channel, [message, msg], 7000);
					});
				}
				else if(cmd[2].toLowerCase() === 'greetpm'){
					if((message.content.match(/"/g)||[]).length !== 2){
						message.channel.sendMessage(':warning: You did not wrap your intended greet PM in quotation marks. Try again.').then(msg=>{
							bulkDelete(message.channel, [message, msg], 7000);
						});
						return;
					}
					let str = message.content.substring(message.content.indexOf('"') + 1, message.content.lastIndexOf('"'));
					settings[guild.id].greetpm = str;
					message.channel.sendMessage(':white_check_mark: Successfully set the **greet PM** to: ```'+str+'```').then(msg=>{
						bulkDelete(message.channel, [msg, message], 15000);
					});
				}
				else if(cmd[2].toLowerCase() === 'byepm'){
					if((message.content.match(/"/g)||[]).length !== 2){
						message.channel.sendMessage(':warning: You did not wrap your intended bye PM in quotation marks. Try again.').then(msg=>{
							bulkDelete(message.channel, [message, msg], 7000);
						});
						return;
					}
					let str = message.content.substring(message.content.indexOf('"') + 1, message.content.lastIndexOf('"'));
					settings[guild.id].byepm = str;
					message.channel.sendMessage(':white_check_mark: Successfully set the **bye PM** to: ```'+str+'```').then(msg=>{
						bulkDelete(message.channel, [msg, message], 15000);
					});
				}
				else if(cmd[2].toLowerCase() === 'byemsg'){
					if((message.content.match(/"/g)||[]).length !== 2){
						message.channel.sendMessage(':warning: You did not wrap your intended bye message in quotation marks. Try again.').then(msg=>{
							bulkDelete(message.channel, [message, msg], 7000);
						});
						return;
					}
					let str = message.content.substring(message.content.indexOf('"') + 1, message.content.lastIndexOf('"'));
					settings[guild.id].byemsg = str;
					message.channel.sendMessage(':white_check_mark: Successfully set the **bye message** to: ```'+str+'```').then(msg=>{
						bulkDelete(message.channel, [msg, message], 15000);
					});
				}
				else if(cmd[2].toLowerCase() === 'byemsgchannel' || cmd[2].toLowerCase() === 'byechannel'){
					if(message.mentions.channels.size === 0){
						message.channel.sendMessage(':warning:'+message.author+', you did not hyperlink a text channel in your command. Try again.').then(msg=>{
							bulkDelete(message.channel, [message, msg], 5000);
						});
						return;
					}
					settings[guild.id].byemsgchannel = message.mentions.channels.first().name;
					message.channel.sendMessage(':white_check_mark: Successfully set the **bye message channel** to '+message.mentions.channels.first()).then(msg=>{
						bulkDelete(message.channel, [message, msg], 5000);
					});
				}
				else if(cmd[2].toLowerCase() === 'logchannel'){
					if(message.mentions.channels.size === 0){
						message.channel.sendMessage(':warning:'+message.author+', you did not hyperlink a text channel in your command. Try again.').then(msg=>{
							bulkDelete(message.channel, [message, msg], 5000);
						});
						return;
					}
					settings[guild.id].logchannel = message.mentions.channels.first().name;
					message.channel.sendMessage(':white_check_mark: Successfully set the **log message channel** to '+message.mentions.channels.first());
				}
				else if(cmd[2].toLowerCase() === 'defaultrole'){
					if((message.content.match(/"/g)||[]).length !== 2){
						message.channel.sendMessage(':warning: You did not wrap your the role name in quotation marks. Try again.').then(msg=>{
							bulkDelete(message.channel, [message, msg], 7000);
						});
						return;
					}
					let str = message.content.substring(message.content.indexOf('"') + 1, message.content.lastIndexOf('"'));
					if(!guild.roles.exists('name', str)){
						message.channel.sendMessage(':warning: The role `'+str+'` does not exist! Input an existing role name. Keep in mind role names are case-sensitive.').then(msg=>{
							bulkDelete(message.channel, [message, msg], 7000);
						});
						return;
					}
					settings[guild.id].defaultrole = str;
					message.channel.sendMessage(':white_check_mark: Successfully set the **default role** to: ```'+str+'```').then(msg=>{
						bulkDelete(message.channel, [msg, message], 7000);
					});
				}
				else{
					throw false;
				}
			}
			catch(err){
				let arr = [];
				arr.push(message.author+', here are a list of things you can set:\n');
				arr.push('`greetmsg` : The message new users are greeted with. *Must have greetmsgchannel also set*');
				arr.push('`greetmsgchannel` : The channel greet message is broadcast in');
				arr.push('`greetpm` : The PM automatically sent to new members\n');
				arr.push('`byemsg` : The message broadcast when a member leaves the server. *Must have byemsgchannel also set*');
				arr.push('`byemsgchannel` : The channel bye message is broadcast in');
				arr.push('`byepm` : The PM automatically sent to a member when they leave the server\n');
				arr.push('`defaultrole` : The default role a new member is automatically given\n');
				arr.push('`logchannel` : The channel where server logs are written to\n');
				arr.push('\n*Use `'+prefix+'settings set <keyword> ...` to modify any of these settings.*');
				arr.push(':exclamation:**For anything with a message/pm format, wrap your block of text with quotation marks!**');
				message.channel.sendMessage(arr).then(msg=>{
					bulkDelete(message.channel, [message, msg], 30000);
				});
			}
			refresh();
		}
		else if(cmd[1].toLowerCase() === 'toggle'){
			try{
				if(cmd[2].toLowerCase() === 'greetmsg' || cmd[2].toLowerCase() === 'greetmsg'){
					if(settings[guild.id].greetmsgstatus === 'enabled') settings[guild.id].greetmsgstatus = 'disabled';
					else settings[guild.id].greetmsgstatus = 'enabled';
					message.channel.sendMessage(':white_check_mark: **Greet message** is now **'+settings[guild.id].greetmsgstatus+'**').then(msg=>{
						bulkDelete(message.channel, [message, msg], 7000);
					});
				}
				else if(cmd[2].toLowerCase() === 'greetpm'){
					if(settings[guild.id].greetpmstatus === 'enabled') settings[guild.id].greetpmstatus = 'disabled';
					else settings[guild.id].greetpmstatus = 'enabled';
					message.channel.sendMessage(':white_check_mark: **Greet PM** is now **'+settings[guild.id].greetpmstatus+'**').then(msg=>{
						bulkDelete(message.channel, [message, msg], 7000);
					});
				}
				else if(cmd[2].toLowerCase() === 'byemsg'){
					if(settings[guild.id].byemsgstatus === 'enabled') settings[guild.id].byemsgstatus = 'disabled';
					else settings[guild.id].byemsgstatus = 'enabled';
					message.channel.sendMessage(':white_check_mark: **Bye message** is now **'+settings[guild.id].byemsgstatus+'**').then(msg=>{
						bulkDelete(message.channel, [message, msg], 7000);
					});
				}
				else if(cmd[2].toLowerCase() === 'byepm'){
					if(settings[guild.id].byepmstatus === 'enabled') settings[guild.id].byepmstatus = 'disabled';
					else settings[guild.id].byepmstatus = 'enabled';
					message.channel.sendMessage(':white_check_mark: **Bye PM** is now **'+settings[guild.id].byepmstatus+'**').then(msg=>{
						bulkDelete(message.channel, [message, msg], 7000);
					});
				}
				else if(cmd[2].toLowerCase() === 'defaultrole'){
					if(settings[guild.id].defaultrolestatus === 'enabled') settings[guild.id].defaultrolestatus = 'disabled';
					else settings[guild.id].defaultrolestatus = 'enabled';
					message.channel.sendMessage(':white_check_mark: **Default role** is now **'+settings[guild.id].defaultrolestatus+'**').then(msg=>{
						bulkDelete(message.channel, [message, msg], 7000);
					});
				}
				else if(cmd[2].toLowerCase() === 'logging' || cmd[2].toLowerCase() === 'logs'){
					if(settings[guild.id].logstatus === 'enabled') settings[guild.id].logstatus = 'disabled';
					else settings[guild.id].logstatus = 'enabled';
					message.channel.sendMessage(':white_check_mark: **Logging** is now **'+settings[guild.id].logstatus+'**').then(msg=>{
						bulkDelete(message.channel, [message, msg], 7000);
					});
				}
				else{
					throw false;
				}
			}
			catch(err){
				let arr = [];
				arr.push(message.author+', here is a list of things you can toggle:');
				arr.push('`greetmsg` : The message new members are greeted with.');
				arr.push('`greetpm` : The PM new members are automatically sent.');
				arr.push('`byemsg` : The message broadcast when a member leaves the server.');
				arr.push('`byepm` : The PM sent to members who leave the server.');
				arr.push('`defaultrole` : The default role new members are assigned.');
				arr.push('`logging` : Server activity logs recorded by the bot and written to a channel.');
				arr.push('\n*To toggle any of these, use `'+prefix+'settings toggle <keyword>`');
				message.channel.sendMessage(arr).then(msg=>{
					bulkDelete(message.channel, [message, msg], 20000);
				});
			}
			refresh();
		}
	}
	// #uinfo
	if(cmd[0].toLowerCase() === 'uinfo' || cmd[0].toLowerCase() === 'userinfo'){
		if(message.mentions.users.size == 0 || message.mentions.users.size > 1){
			//msgChannel.sendMessage(help["info"]);
			return;
		}
		//idea for tags - splice them out into a different array and send that
		let user = message.mentions.users.first();
		let guildUser = message.guild.member(user);
		let gamename = "n/a";
		if(user.presence.game != null){ gamename = user.presence.game.name;}
		let roles = guildUser.roles.array();
		for(key in roles){
			roles[key] = '@'+roles[key].name;
		}
		roles.splice(0, 1);
		let infoArray = [
			"Showing information for user: **" + user.username + "#" + user.discriminator + "**",
			"**User ID: **" + user.id,
			"**Nickname:** " + getNickname(message.guild, user),
			"**Status: **" + user.presence.status,
			"**Roles: **" + roles.join(', '),
			"**Currently playing: **" + gamename,
			"**Joined this server on: **" + guildUser.joinedAt,
			"**Account created: **" + user.createdAt,
			"**Avatar URL: **" + user.avatarURL
		];
		if(message.content.indexOf("--pm") != -1){
			message.author.sendMessage(infoArray);
		}
		else{
			message.channel.sendMessage(infoArray).then(msg=>{
				setTimeout(function(){ message.channel.bulkDelete([message, msg]); }, 20000);
			});
		}
	}//end uinfo
	// #ignore
	if(cmd[0].toLowerCase() === 'ignore'){
		if(!message.guild.member(message.author).hasPermission('MANAGE_MESSAGES')){
			message.channel.sendMessage(':warning: '+message.author+', you do not have permissions to do that. Must have `Manage Messages` permission.').then(msg=>{
				bulkDelete(message.channel, [msg, message], 7000);
			});
			return;
		}
		if(message.mentions.users.size !== 1){
			message.channel.sendMessage(':warning: '+message.author+', you must mention **one** user to ignore with the command.').then(msg=>{
				bulkDelete(message.channel, [msg, message], 7000);
			});
		}
		else{
			let ignoredUsers = settings[message.guild.id].ignored;
			let ignoreTarget = message.mentions.users.first();
			if(ignoredUsers.indexOf(ignoreTarget.id) !== -1){
				message.channel.sendMessage(':warning: '+message.author+', the user `'+getNickname(message.guild, ignoreTarget)+' ('+ignoreTarget.username+'#'+ignoreTarget.discriminator+')` is already being ignored.').then(msg=>{
					bulkDelete(message.channel, [message, msg], 7000);
				});
				return;
			}
			else{
				settings[message.guild.id].ignored.push(ignoreTarget.id);
				refresh();
				message.channel.sendMessage(':white_check_mark: '+message.author+', I am now ignoring the user `'+getNickname(message.guild, ignoreTarget)+' ('+ignoreTarget.username+'#'+ignoreTarget.discriminator+')`').then(msg=>{
					bulkDelete(message.channel, [message, msg], 7000);
				});
			}
		}

	}
	// #unignore
	if(cmd[0].toLowerCase() === 'unignore'){
		if(!message.guild.member(message.author).hasPermission('MANAGE_MESSAGES')){
			message.channel.sendMessage(':warning: '+message.author+', you do not have permissions to do that. Must have `Manage Messages` permission.').then(msg=>{
				bulkDelete(message.channel, [msg, message], 7000);
			});
			return;
		}
		if(message.mentions.users.size !== 1){
			message.channel.sendMessage(':warning: '+message.author+', you must mention **one** user to unignore with the command.').then(msg=>{
				bulkDelete(message.channel, [msg, message], 7000);
			});
		}
		else{
			let ignoredUsers = settings[message.guild.id].ignored;
			let ignoreTarget = message.mentions.users.first();
			if(ignoredUsers.indexOf(ignoreTarget.id) !== -1){
				settings[message.guild.id].ignored.splice(settings[message.guild.id].ignored.indexOf(ignoreTarget.id), 1);
				refresh();
				message.channel.sendMessage(':white_check_mark: '+message.author+', I am no longer ignoring the user `'+getDisplayName(message.guild, ignoreTarget)+'`.').then(msg=>{
					bulkDelete(message.channel, [message, msg], 7000);
				});
			}
			else {
				message.channel.sendMessage(':warning: '+message.author+', the user `'+getDisplayName(message.guild, ignoreTarget)+'` is not on the ignore list.').then(msg=>{
					bulkDelete(message.channel, [message, msg], 7000);
				});
			}
		}
	}
	// #kick
	if(cmd[0].toLowerCase() === 'kick'){
		try{
			if(!message.guild.member(bot.user).hasPermission('KICK_MEMBERS')){
				throw('This bot does not have the `KICK_MEMBERS` permissions.');
			}
			if(!message.guild.member(message.author).hasPermission('KICK_MEMBERS')){
				throw('You do not have `KICK_MEMBERS` permission.');
			}
			if(message.mentions.users.size !== 1){
				throw('You must mention one user to kick.');
			}
			let reason = null;
			if((message.content.match(/"/g)||[]).length === 1 || (message.content.match(/"/g)||[]).length > 2){
				throw('Imporper quotation mark usage. Could not understand.');
			}
			if((message.content.match(/"/g)||[]).length === 2){
				reason = message.content.substring(message.content.indexOf('"')+1, message.content.lastIndexOf('"'));
			}
			message.guild.fetchMember(message.mentions.users.first()).then(member=>{
				member.kick();
				if(reason !== null){
					m.sendMessage('You were kicked from **'+message.guild.name+'** by '+getDisplayName(message.guild, message.author)+' for the following reason: ```'+reason+'```');
					if(settings[message.guild.id].logstatus === 'enabled' && message.guild.channels.exists('name', settings[message.guild.id].logchannel)){
						message.guild.channels.find('name', settings[message.guild.id].logchannel).sendMessage(':x: `'+getDisplayName(message.guild, m.user)+'` was **`KICKED`** from the server by `'+getDisplayName(message.guild, message.author)+' for the following reason: ```'+reason+'```');
					}
				}
				message.channel.sendMessage(':white_check_mark: `'+getDisplayName(message.guild, m.user)+'` was kicked from the server.').then(msg=>{
					message.delete();
					msg.delete(7000);
				});
			});
		}
		catch(err){
			message.channel.sendMessage(':warning: '+message.author+', '+err+'\nType `'+prefix+'help kick` for usage information.').then(msg=>{
				bulkDelete(message.channel, [message, msg], 7000);
			});
			console.log(err);
		}

	}
	// #ban
	if(cmd[0].toLowerCase() === 'ban'){

	}
	// #announce
	if(cmd[0].toLowerCase() === 'announce'){
		try{
			if(!message.guild.member(message.author).hasPermission('ADMINISTRATOR')){
				message.channel.sendMessage(':warning: You must have `ADMINISTRATOR` permissions to do this.').then(msg=>{
					bulkDelete(message.channel, [msg, message], 7000);
				});
				return;
			}
			if((message.content.match(/"/g)||[]).length !== 2){
				throw('Incorrect `message` syntax - check usage of quotation marks around `message`.');
			}
			let numUserMentions = message.mentions.users.size;
			let numRoleMentions = message.mentions.roles.size;
			let usersMentionedNames = [], rolesMentionedNames = [];
			let everyone = false;
			if(numUserMentions+numRoleMentions === 0) everyone = true;
			let users = [], roles  = [];
			if(numUserMentions > 0){
				message.mentions.users.array().forEach(entry=>{
					users.push(entry.id);
					usersMentionedNames.push(getDisplayName(message.guild, entry));
				});
			}
			if(numRoleMentions > 0){
				message.mentions.roles.array().forEach(entry=>{
					roles.push(entry.id);
					rolesMentionedNames.push(entry.name);
				});
			}
			let msg = message.content.substring(message.content.indexOf('"')+1, message.content.lastIndexOf('"'));
			if(everyone){
				message.guild.fetchMembers().then(guild=>{
					guild.members.every(member=>{
						member.sendMessage('`Announcement from: '+getDisplayName(message.guild, message.author)+' via '+message.guild.name+' server:`\n'+msg);
						message.channel.sendMessage(':white_check_mark: '+message.author+', I just announced your message to everyone!\n**Message:** ```'+msg+'```').then(msg=>{
							bulkDelete(message.channel, [msg, message], 15000);
						});
					});
				});
			}
			else{
				message.guild.fetchMembers().then(guild=>{
					guild.members.filter(member=>{
						let pass = false;
						if(numRoleMentions > 0){
							for(var k in roles){
								if(member.roles.exists('id', roles[k])){
									pass = true;
								}
							}
						}
						if(users.indexOf(member.id) !== -1){
							pass = true;
						}
						return pass;
					}).every(member=>{
						member.sendMessage('`Announcement from: '+getDisplayName(message.guild, message.author)+' via '+message.guild.name+':`\n'+msg);
						let send = [];
						send.push(':white_check_mark: '+message.author+', I just announced your message to the following users/roles:');
						if(numUserMentions > 0) send.push('**Users**: '+usersMentionedNames);
						if(numRoleMentions > 0) send.push('**Roles**: '+rolesMentionedNames);
						send.push('**Message**: ```'+msg+'```');
						message.channel.sendMessage(send).then(msg=>{
							bulkDelete(message.channel, [msg, message], 15000);
						});
					});
				});
			}
		}
		catch(err){
			message.channel.sendMessage(':warning: '+message.author+', '+err+'\n**Usage:** `'+prefix+'announce @user(s)|@role(s) "message"`').then(msg=>{
				bulkDelete(message.channel, [msg, message], 15000);
			});
			console.log(err);
		}
	}
	// #event
	if(cmd[0].toLowerCase() === 'event'){

	}
	if(cmd[0].toLowerCase() === 'poll'){
		try{
			if(message.content.substring(prefix.length).trim().toLowerCase() === 'poll') throw('**`'+prefix+'poll ...`** creates a strawpoll based on user input of a title and options.');
			if((message.content.match(/"/g)||[]).length !== 2){
				throw('Incorrect `title` syntax - check usage of quotation marks.');
			}
			let title = message.content.substring(message.content.indexOf('"')+1, message.content.lastIndexOf('"'));
			let choices = message.content.substring(message.content.lastIndexOf('"')+2).split(',');
			for(var k in choices){
				choices[k] = choices[k].trim();
			}
			var options = {
				method: 'post',
				body: {
					'title': title,
					'options': choices,
					'multi':true
				},
				json: true,
				url: 'https://strawpoll.me/api/v2/polls'
			};
			request(options, function(error, response, body){
				message.delete();
				message.channel.sendMessage('**POLL**: `'+title+'`: http://www.strawpoll.me/'+body.id);
			});
		}
		catch(err){
			message.channel.sendMessage(message.author+ ': '+err+'\n**Usage:** `'+prefix+'poll "title" option1, option2, option3, ...`').then(msg=>{
				bulkDelete(message.channel, [message, msg], 15000);
			});
		}
	}
}//try
catch(err){
	message.channel.sendMessage(':warning: Uh oh!!...something went wrong. Attempting to restart...').then(msg=>{
		msg.delete(3000);
	})
	console.log(err);
}

}); //end of bot.on('message'...)

bot.on('guildCreate', (guild)=>{
	jsonfile.readFile(servers, function(err, obj){
		if(err) console.log(err);
		obj[guild.id] = {};
		obj[guild.id].name = guild.name;
		obj[guild.id].joined = guild.joinedAt;
		obj[guild.id].ownerId = guild.ownerID;
		obj[guild.id].logstatus = 'disabled';
		obj[guild.id].logchannel = null;
		obj[guild.id].greetmsgstatus = 'disabled';
		obj[guild.id].greetmsg = null;
		obj[guild.id].greetmsgchannel = null;
		obj[guild.id].greetpmstatus = 'disabled';
		obj[guild.id].greetpm = null;
		obj[guild.id].byepmstatus = 'disabled';
		obj[guild.id].byepm = null;
		obj[guild.id].byemsgstatus = 'disabled';
		obj[guild.id].byemsgchannel = null;
		obj[guild.id].byemsg = null;
		obj[guild.id].defaultrolestatus = 'disabled';
		obj[guild.id].defaultrole = null;
		obj[guild.id].ignored = [];
		jsonfile.writeFile(servers, obj, function(err){
			if(err) console.log(err);
		});
		refresh();
	});
});
// #guildMemberAdd
// Checks to see whether guild has logging set and then greets/logs new member
bot.on('guildMemberAdd', (member)=>{
	let guild = member.guild;
	if(settings[guild.id].logstatus === 'enabled' && guild.channels.exists('name', settings[guild.id].logchannel)){
		guild.channels.find('name', settings[guild.id].logchannel).sendMessage(':white_check_mark: '+member+' - `'+getDisplayName(guild, member.user)+'` has joined the server.');
	}
	if(settings[guild.id].greetmsgstatus === 'enabled' && guild.channels.exists('name', settings[guild.id].greetmsgchannel) && settings[guild.id].greetmsg !== null){
		let msg = settings[guild.id].greetmsg;
		if(msg.includes('@user')) msg = msg.replace('@user', '<@'+member.id+'>');
		guild.channels.find('name', settings[guild.id].greetmsgchannel).sendMessage(msg);
	}
	if(settings[guild.id].defaultrolestatus === 'enabled' && guild.roles.exists('name', settings[guild.id].defaultrole)){
		member.addRole(guild.roles.find('name', settings[guild.id].defaultrole));
	}
	if(settings[guild.id].greetpmstatus === 'enabled' && settings[guild.id].greetpm !== null){
		let msg = settings[guild.id].greetpm;
		if(msg.includes('@user')) msg =  msg.replace('@user', '<@'+member.id+'>');
		member.sendMessage(msg);
	}
}); //end of guildMemberAdd

// #guildMemberRemove
//
bot.on('guildMemberRemove', (member)=>{
	let guild = member.guild;
	if(settings[guild.id].logstatus === 'enabled' && guild.channels.exists('name', settings[guild.id].logchannel)){
		guild.channels.find('name', settings[guild.id].logchannel).sendMessage(':x: '+member+' - `('+member.user.username+'#'+member.user.discriminator+')` has left the server.');
	}
	if(settings[guild.id].byemsgstatus === 'enabled' && guild.channels.exists('name', settings[guild.id].byemsgchannel) && settings[guild.id].byemsg !== null){
		let msg = settings[guild.id].byemsg;
		if(msg.includes('@user')) msg = msg.replace('@user', '<@'+member.id+'>');
		guild.channels.find('name', settings[guild.id].byemsgchannel).sendMessage(msg);
	}
	if(settings[guild.id].byepmstatus === 'enabled' && settings[guild.id].byepm !== null){
		let msg = settings[guild.id].byepm;
		if(msg.includes('@user')) msg.replace('@user', '<@'+member.id+'>');
		member.sendMessage(msg);
	}
}); //end guildMemberRemove

bot.login(token);

function bulkDelete(channel, messages, time){
	setTimeout(function(){ channel.bulkDelete(messages)}, time);
}

function getNickname(guild, user){
	if(guild.member(user).nickname !== null) return guild.member(user).nickname;
	else return user.username;
}

function getDisplayName(guild, user){
	let nick = guild.member(user).nickname;
	if(nick === null) nick = user.username;
	return nick+' ('+user.username+'#'+user.discriminator+')';
}

function refresh(){
	jsonfile.writeFileSync(servers, settings);
	settings = jsonfile.readFileSync(servers);
}
