//import the discord.js module
const Discord = require('discord.js');
var fs = require('fs');
var sys = require('util');
var jsonfile = require('jsonfile');


//// GLOBAL VARIABLES /////
const bot = new Discord.Client();
const token = 'MjI1MzQ1NjYxNTkwMDQ0Njcy.CrntFw.jHDKx9Mj2ExBa6twSz7lywTu2-o';
const devId = "133352797776248832"; // dev's id
const maliciousId = '144729397826420736';
const prefix = '!';
const officer_role = 'Captain';
const admin_role = 'Council';
const member_role = 'Member';
const guest_role = 'Guest';
const member_access_channel = 'general-chat';
const guest_access_channel = 'guest-chat';
var squads, settings, serversettings, mi_settings;
var showingList = {};
var showingInfo = {};


//FILE PATHS
const squadspath = './etc/MI_squads.json';
const misettingspath = './etc/MI_settings.json';

function refresh(path){
	try{
		if(path === 'squads'){
			jsonfile.writeFileSync(squadspath, squads);
			squads = jsonfile.readFileSync(squadspath);
		}
		else if(path === 'settings'){
			jsonfile.writeFileSync(misettingspath, mi_settings);
			mi_settings = jsonfile.readFileSync(misettingspath);
		}
		console.log('Refreshed memory of '+path+'...');
	}
	catch(err){
		console.log('Could not read one or more files...');
	 	console.log(err);
	}
}
//#ready
bot.on('ready', ()=>{
	try{
		squads = jsonfile.readFileSync(squadspath);
		mi_settings = jsonfile.readFileSync(misettingspath);
		let channels = bot.guilds.find('id', maliciousId).channels.array();
		for(key in channels){
			showingList[channels[key].id] = false;
			showingInfo[channels[key].id] = {};
		}
		console.log('Set channels...');
	}
	catch(err){
		console.log('Could not read one or more files...');
	 	console.log(err);
	}
	console.log('Ready for commands...');
}); //end of bot.on('ready'...)

//#message
bot.on('message', message=>{
	///// PERMS CHECKS //////
	if(message.author.bot) return; //ignores other bots
	if(message.guild.id != maliciousId) return;
	if(message.content.includes('@everyone') && !message.guild.member(message.author).roles.exists('name', admin_role)) message.delete().then(msg=>{
		msg.channel.sendMessage(':x: '+message.author+', you do not have permissions to use the `@everyone` tag. Next time you will be automatically muted.').then(warningmsg=>{
			warningmsg.delete(7000);
		});
	});
	if(message.content[0] !== prefix) return; //ignores if doesn't start with prefix
	/////////////////////////

	var cmd = message.content.substring(1).split(' ');

	// #register
	if(cmd[0].toLowerCase() === 'register'){
		if(!message.guild.member(message.author).roles.exists('name', officer_role)){
			message.channel.sendMessage(':warning: You do not have permissions to do that.').then(msg=>{
				setTimeout(function(){ message.channel.bulkDelete([message, msg]); }, 7000);
			});
			return;
		}
		if(squads.hasOwnProperty(message.author.id)){
			message.channel.sendMessage(':warning: You already have a squad registered.').then(msg=>{
				setTimeout(function(){ message.channel.bulkDelete([message, msg]); }, 7000);
			});
			delete squads[message.author.id];
			return;
		}
		if(cmd.length < 3){
			message.channel.sendMessage(':warning: You are missing parameters. Please be sure you are following the format: `'+prefix+'register <squad_tag> <squad_name>`').then(msg=>{
				setTimeout(function(){ message.channel.bulkDelete([message, msg]); }, 7000);
			});
			return;
		}
		if(cmd[1].startsWith('[') || cmd[1].startsWith('(') || cmd[1].startsWith('<') || cmd[1].startsWith('"')){
			cmd[1] = cmd[1].substring(1, cmd[1].length-1);
		}
		if(cmd[2].startsWith('[') || cmd[2].startsWith('(') || cmd[2].startsWith('<') || cmd[2].startsWith('"')){
			cmd[2] = cmd[2].substring(1, cmd[2].length-1);
		}
		var sq = message.author.id;
		squads[sq] = {};
		squads[sq].name = cmd[2];
		squads[sq].tag = cmd[1];
		squads[sq].maxMembers = 20;
		squads[sq].captainId = message.author.id;
		squads[sq].about = undefined;
		squads[sq].focus = undefined;
		squads[sq].requirements = undefined;
		squads[sq].invites = [];
		refresh('squads');
		message.channel.sendMessage('`Creating squad role...`').then(msg=>{
			message.guild.createRole({ name: squads[sq].name }).then(role=>{
				message.guild.member(message.author).addRole(role);
				msg.edit('`Creating squad channel...`');
				message.guild.createChannel(squads[sq].tag.toLowerCase()+'-chat', 'text').then(ch=>{
					msg.edit('`Setting up squad channel permissions...`');
					ch.overwritePermissions(message.guild.roles.find('name', '@everyone'), {READ_MESSAGES: false});
					ch.overwritePermissions(role, {READ_MESSAGES: true});
					ch.overwritePermissions(message.guild.roles.find('name', officer_role), {MANAGE_MESSAGES: true});
					ch.sendMessage('Hello '+message.author+'. This is your private squad channel. Only the council, you, and your squad members should have access to this text channel and your voice channel. \n**This is your domain, your rules.**\nTo set up requirements, squad focus, squad intros, etc, please type \n`'+prefix+'help squad`');
					msg.edit('`Creating squad voice channel...');
					message.guild.createChannel('['+squads[sq].tag+']  '+squads[sq].name, 'voice').then(voice=>{
						voice.overwritePermissions(message.guild.roles.find('name', '@everyone'), {CONNECT: false});
						voice.overwritePermissions(role, {CONNECT: true});
						voice.overwritePermissions(message.guild.roles.find('name', officer_role), {DEAFEN_MEMBERS: true, MUTE_MEMBERS: true, CONNECT: true});
						voice.overwritePermissions(message.guild.roles.find('name', admin_role), {DEAFEN_MEMBERS: true, MUTE_MEMBERS: true, CONNECT: true});
						msg.edit('`['+squads[sq].tag+'] '+squads[sq].name+' set-up complete.`');
					});
				});
			});
		});
	}

	// #list
	if(cmd[0].toLowerCase() === 'list'){
		var list = ['*`For more information on a squad, type: '+prefix+'info [tag|name|@captain]`*'].concat(getListOfSquads(message.guild.id));
		if(showingList[message.channel.id] === false){
			message.channel.sendMessage(list).then(msg=>{
				showingList[message.channel.id] = true;
				setTimeout(function(){ message.channel.bulkDelete([message, msg]); showingList[message.channel.id] = false;}, 20000);
			});
		}
		else{
			message.channel.sendMessage(':warning: There is already a list of squads displayed! Scroll up, or wait until that post expires.').then(msg=>{
				setTimeout(function(){ message.channel.bulkDelete([message, msg]); }, 5000);
			});
		}
	}

	// #info
	if(cmd[0].toLowerCase() === 'info'){
			let list = [];
			let keyword = message.content.substring(message.content.toLowerCase().indexOf('info')+5);
			let key = getSquadId(keyword);
			if(key === null){
				message.channel.sendMessage(':warning: Could not find a squad associated with your keyword: `'+keyword+'`.').then(msg=>{
					setTimeout(function(){ message.channel.bulkDelete([message, msg]); }, 7000);
				});
				return;
			}
			if(showingInfo[message.channel.id][message.author.id] === undefined){
				showingInfo[message.channel.id][message.author.id] = Date.now();
				let members = getSquadMembers(squads[key].captainId);
				let currentSize = members.length;
				for(x in members){
					members[x] = getNickname(members[x]);
				}
				members = members.splice(1);
				list.push('`Retrieving info for squad...`');
				list.push('**Squad Name:** '+squads[key].name);
				list.push('**Squad Tag:** '+squads[key].tag);
				list.push('**Capacity: **' + currentSize + '/'+squads[key].maxMembers);
				list.push('**Captain: **' + getNickname(squads[key].captainId));
				list.push('**Members: **\n' + members.join(',   '));
				list.push('**About: **\n`' + squads[key].about+'`');
				list.push('**Requirements: **\n`' + squads[key].requirements+'`');
				list.push('**Achievements/Trophies: **\n`'+squads[key].achievements+'`')
				message.channel.sendMessage(list).then(msg=>{
					setTimeout(function(){ message.channel.bulkDelete([message, msg]); delete showingInfo[message.channel.id][message.author.id];}, 60000);
				});
			}
			else{
				message.channel.sendMessage(message.author+', you are on cooldown for the `'+prefix+'info` command on this channel. Your cooldown has `'+Math.round((60000 - (Date.now() - showingInfo[message.channel.id][message.author.id]))/1000)+'` seconds left.').then(msg=>{
					setTimeout(function(){ message.channel.bulkDelete([message, msg]); }, 7000);
				});
			}
	}

	// #approve
	if(cmd[0].toLowerCase() === 'approve'){
		if(message.guild.id != maliciousId) return;
		if(message.guild.member(message.author).roles.exists('name', officer_role) || message.guild.member(message.author).roles.exists('name', admin_role)){
			if(message.mentions.users.size === 0){
				message.channel.sendMessage(':warning: You did not mention anyone.').then(msg=>{
					setTimeout(function(){ message.channel.bulkDelete([message, msg]); }, 7000);
				});
				return;
			}
			let usrs = message.mentions.users.array();
			for(key in usrs){
				if(message.guild.member(usrs[key]).roles.exists('name', member_role)){
					message.channel.sendMessage(':warning: '+usrs[key]+' is already a member.').then(msg=>{
						setTimeout(function(){ message.channel.bulkDelete([message, msg]); }, 7000);
					});
					continue;
				}
				else{
					message.guild.member(usrs[key]).addRole(message.guild.roles.find('name', member_role)).then(usr=>{
						if(message.guild.member(usrs[key]).roles.exists('name', guest_role)){
							message.guild.member(usrs[key]).removeRole(message.guild.roles.find('name', guest_role));
						} //end if exists guest role
						if(mi_settings.logchannelstatus === 'enabled' && message.guild.channels.exists('name', mi_settings.logchannel)){
							message.guild.channels.find('name', mi_settings.logchannel).sendMessage(':white_check_mark: '+message.author+' has approved '+usrs[key]+' ('+usrs[key].username+'#'+usrs[key].discriminator+")'s application to join the guild.");
						}
						if(message.guild.channels.exists('name', member_access_channel)){
							message.guild.channels.find('name', member_access_channel).sendMessage(':white_check_mark: You have been granted member permissions. Welcome to '+message.guild.name+', '+usrs[key]).then(msg=>{
								message.delete();
							});
						}
					});
				} //end else
			}//end for loop through mentioned users
		}
		else{
			message.channel.sendMessage(':warning: You do not have permissions to do that.').then(msg=>{
				setTimeout(function(){ message.channel.bulkDelete([message, msg]); }, 7000);
			});
			return;
		}
	}

	// #invite
	if(cmd[0].toLowerCase() === 'invite'){
		if(message.guild.id != maliciousId) return; //if not Malicious Intent
		if(!message.guild.member(message.author).roles.exists('name', officer_role)){
			message.channel.sendMessage(':warning: You do not have permissions to do that.').then(msg=>{
				setTimeout(function(){ message.channel.bulkDelete([message, msg]); }, 7000);
			});
			return;
		}
		if(!squads.hasOwnProperty(message.author.id)){
			message.channel.sendMessage(':warning: You do not have a squad set up under your name yet.').then(msg=>{
				setTimeout(function(){ message.channel.bulkDelete([message, msg]); }, 7000);
			});
			return;
		}
		if(message.mentions.users.size === 0){
			message.channel.sendMessage(':warning: You did not mention anyone to invite.').then(msg=>{
				setTimeout(function(){ message.channel.bulkDelete([message, msg]); }, 7000);
			});
			return;
		}
		if(message.mentions.users.size > 1){
			message.channel.sendMessage(':warning: You can only invite one member at a time.').then(msg=>{
				setTimeout(function(){ message.channel.bulkDelete([message, msg]); }, 7000);
			});
		}
		let currentSquadSize = getSquadMembers(message.author.id).length;
		let maxSize = squads[message.author.id].maxMembers;
		let target = squads[message.author.id];
		let usr = message.mentions.users.first();
		if(target.invites.indexOf(usr.id) != -1){
			message.channel.sendMessage(':warning: '+getNickname(usr.id)+' has already been invited to join `'+target.name+'`.').then(msg=>{
				setTimeout(function(){ message.channel.bulkDelete([message, msg]); }, 7000);
			});
			return;
		}
		if(currentSquadSize+1 > maxSize){
			message.channel.sendMessage(':warning: Cannot invite '+getNickname(usr)+' because `'+target.name+'` is at capacity. (max: '+maxSize+' members)').then(msg=>{
				setTimeout(function(){ message.channel.bulkDelete([message, msg]); }, 7000);
			});
			return;
		}
		if(!message.guild.member(usr).roles.exists('name', member_role)){
			message.channel.sendMessage(':warning: Cannot invite because '+getNickname(usr.id)+' is not a member yet.').then(msg=>{
				setTimeout(function(){ message.channel.bulkDelete([message, msg]); }, 7000);
			});
			return;
		}
		if(Date.now() - message.guild.member(usr).joinedAt.getTime() < 86400000){
			message.channel.sendMessage(':warning: New users must have been on this server for at least 24 hours before being eligible to join a squad.').then(msg=>{
				setTimeout(function(){ message.channel.bulkDelete([message, msg]); }, 7000);
			});
			return;
		}
		let sqs = Object.keys(squads);
		for(key in sqs){
			if(message.guild.member(usr).roles.exists('name', squads[sqs[key]].name)){
				message.channel.sendMessage(':warning: Cannot invite because '+getNickname(usr.id)+' is already a member of squad `'+squads[sqs[key]].name+'`').then(msg=>{
					setTimeout(function(){ message.channel.bulkDelete([message, msg]); }, 7000);
				});
				return;
			}
		}
		target.invites.push(usr.id);
		message.guild.member(usr).sendMessage('Hello, you have been invited to join `['+target.tag+']` `'+target.name+'` currently led by @'+getNickname(target.captainId)+". \n Squad membership is a motion of extending the guild's trust and expectations to you as a productive member. ```Joining a squad is binding and members may only be moved to a different squad under special circumstances. You can leave a squad at any time but your acceptance into a different squad as well as participation in guild events may be limited. Therefore, please make sure you are comfortable with the squad members as well as its requirements/goals before joining.```\nTo accept this invite, please type **`"+prefix+'accept '+target.tag+'`** in the **#general-chat** channel of the Malicious Intent server. You may also type **`'+prefix+'accept`** to see invites from any other squad that you have pending (if any).\n**DO NOT REPLY TO THIS MESSAGE**.');
		message.channel.sendMessage(message.author+' has invited '+usr+' to join `['+target.tag+'] '+target.name+'`. Please check your private messages for information on how to accept this invitation.').then(msg=>{
			message.delete();
			msg.delete(30000);
		});
		refresh('squads');
	}

	// #accept
	if(cmd[0].toLowerCase() === 'accept'){
			if(message.guild.id !== maliciousId) return;
			if(checkIsInSquad(message.author.id) !== null){
				message.channel.sendMessage(':warning: '+message.author+', you are already in a squad.').then(msg=>{
					setTimeout(function(){ message.channel.bulkDelete([message, msg]); }, 7000);
				});
				return;
			}
			let invites = getInvites(message.author.id);
			if(invites.length === 0){
				message.channel.sendMessage(message.author+', you do not have any pending squad invites at this time.').then(msg=>{
					setTimeout(function(){ message.channel.bulkDelete([message, msg]); }, 7000);
				});
				return;
			}
			if(cmd.length === 1){
				let list = [message.author+', here is a list of all your pending squad invites:\n'];
				for(key in invites){
					list.push('`['+squads[invites[key]].tag + '] '+squads[invites[key]].name+' -- Captain: @'+getNickname(squads[invites[key]].captainId)+'`');
				}
				list.push('\nTo accept a squad invite, type `'+prefix+'accept [tag|name]`');
				message.channel.sendMessage(list).then(msg=>{
					setTimeout(function(){ message.channel.bulkDelete([message, msg]); }, 7000);
				});
			}
			else{
				let keyword = message.content.substring(message.content.toLowerCase().indexOf('accept')+7);
				if(keyword[0] === '[' || keyword[0] === '<' || keyword[0] === '(' || keyword[0] === '"') keyword = keyword.substring(1, keyword.length-1);
				let sq = Object.keys(squads);
				let target = '0';
				for(key in sq){
					if(squads[sq[key]].name.toLowerCase() === keyword.toLowerCase() || squads[sq[key]].tag.toLowerCase() === keyword.toLowerCase()){
						target = sq[key];
						break;
					}
				}
				if(target === '0'){
					message.channel.sendMessage(':warning: Could not find squad associated with keyword: `'+keyword+'`').then(msg=>{
						setTimeout(function(){ message.channel.bulkDelete([message, msg]); }, 7000);
					});
				}
				else if(squads[target].invites.indexOf(message.author.id) === -1){
					message.channel.sendMessage(':warning: '+message.author+', you do not have an invite from `'+squads[target].name+'`.').then(msg=>{
						setTimeout(function(){ message.channel.bulkDelete([message, msg]); }, 7000);
					});
				}
				else{
					message.guild.member(message.author).addRole(message.guild.roles.find('name', squads[target].name)).then(role=>{
						message.guild.channels.find('name', squads[target].tag.toLowerCase()+'-chat').sendMessage('Welcome to the squad, '+message.author);
						message.channel.sendMessage(':white_check_mark: '+message.author+', you have joined the squad `'+squads[target].name+'`').then(msg=>{
							setTimeout(function(){ message.channel.bulkDelete([message, msg]); }, 7000);
						});
					});
					for(key in invites){
						squads[invites[key]].invites.splice(squads[invites[key]].invites.indexOf(message.author.id), 1);
					}
					if(mi_settings.logchannelstatus === 'enabled' && message.guild.channels.exists('name', mi_settings.logchannel)){
						message.guild.channels.find('name', mi_settings.logchannel).sendMessage(':arrow_right: '+message.author+' ('+getName(message.author)+') has joined the squad: `['+squads[target].tag+']  '+squads[target].name+'`');
					}
					refresh('squads');
				}
			}


	}

	// #drop
	if(cmd[0].toLowerCase() === 'drop'){
			if(!message.guild.member(message.author).roles.exists('name', officer_role)){
				message.channel.sendMessage(':warning: You do not have permissions to do that.').then(msg=>{
					setTimeout(function(){ message.channel.bulkDelete([message, msg]); }, 7000);
				});
				return;
			}
			if(!squads.hasOwnProperty(message.author.id)){
				message.channel.sendMessage(':warning: You do not have a squad registered yet.').then(msg=>{
					setTimeout(function(){ message.channel.bulkDelete([message, msg]); }, 7000);
				});
				return;
			}
			if(message.mentions.users.size === 0){
				message.channel.sendMessage(':warning: You did not mention anyone to drop.').then(msg=>{
					setTimeout(function(){ message.channel.bulkDelete([message, msg]); }, 7000);
				});
				return;
			}
			let usr = message.mentions.users.first();
			if(checkIsInSquad(usr.id) != squads[message.author.id].captainId){
				message.channel.sendMessage(':warning: You cannot drop someone that is not in your squad!').then(msg=>{
					setTimeout(function(){ message.channel.bulkDelete([message, msg]); }, 7000);
				});
				return;
			}
			else{
				message.guild.member(usr).removeRole(message.guild.roles.find('name', squads[message.author.id].name)).then(member=>{
					if(mi_settings.logchannelstatus === 'enabled' && message.guild.channels.exists('name', mi_settings.logchannel)){
						message.guild.channels.find('name', mi_settings.logchannel).sendMessage(':no_entry_sign: '+message.author+' has dropped ' +usr+ '('+getName(usr)+') from the squad `['+squads[message.author.id].tag+']  '+squads[message.author.id].name+'`');
					}
					message.guild.channels.find('name', squads[message.author.id].tag.toLowerCase()+'-chat').sendMessage(':no_entry_sign: '+getNickname(usr.id)+' was dropped from the squad.').then(msg=>{
						message.delete();
					});
				});
			}
	}

	// #set
	if(cmd[0].toLowerCase() === 'set'){
		if(cmd.length < 2) return;
		cmd[1] = cmd[1].toLowerCase();
		let txt = message.content.substring(cmd[0].length + cmd[1].length + prefix.length + 2);
		if(cmd[1] === 'greetpm'){
			mi_settings.greetpm = txt;
			refresh('malicious_settings');
			message.channel.sendMessage(':white_check_mark: Successfully set the greet PM to ```'+txt+'``` and it is currently **'+mi_settings.greetpmstatus+'**');
		}
		else if(cmd[1] === 'greetmsg'){
			mi_settings.greetmsg = txt;
			refresh('malicious_settings');
			message.channel.sendMessage(':white_check_mark: Successfully set the greet msg to ```'+txt+'``` and it is currently **'+mi_settings.greetmsgstatus+'** on the channel **'+mi_settings.greetmsgchannel+'**');
		}
		else if(cmd[1] === 'greetmsgchannel'){
			if(message.mentions.channels.size != 1) message.channel.sendMessage(':warning: You did not tag a text-channel. The correct usage is `'+prefix+'set greetmsgchannel #<channelname>`');
			else{
				if(!message.guild.channels.exists('name', message.mentions.channels.first().name)){
					message.channel.sendMessage(':warning: Could not find the channel: '+message.mentions.channels.first());
					return;
				}
				mi_settings.greetmsgchannel = message.mentions.channels.first().name;
				refresh('malicious_settings');
				message.channel.sendMessage(':white_check_mark: Successfully set the greet msg channel to '+message.mentions.channels.first());
			}
		}
		else if(cmd[1] === 'byepm'){
			mi_settings.byepm = txt;
			refresh('malicious_settings');
			message.channel.sendMessage(':white_check_mark: Successfully set the greet msg to ```'+txt+'``` and it is currently **'+mi_settings.byepmstatus+'**');
		}
		else if(cmd[1] === 'defaultrole'){
			if(!guild.roles.exists('name', txt)){
				message.channel.sendMessage(':warning: Unable to find the role `'+txt+'`');
			}
			else{
				mi_settings.defaultrole = txt;
				refresh('malicious_settings');
				message.channel.sendMessage(':white_check_mark: Successfully set the default role to `'+txt+'` and it is currently **'+mi_settings.defaultrolestatus+'**');
			}
		}
		else if(cmd[1] === 'logchannel'){
			if(message.mentions.channels.size != 1) message.channel.sendMessage(':warning: You did not tag a text-channel. The correct usage is `'+prefix+'set greetmsgchannel #<channelname>`');
			else{
				if(!message.guild.channels.exists('name', message.mentions.channels.first().name)){
					message.channel.sendMessage(':warning: Could not find the channel: '+message.mentions.channels.first());
					return;
				}
				mi_settings.logchannel = message.mentions.channels.first().name;
				refresh('malicious_settings');
				message.channel.sendMessage(':white_check_mark: Successfully set the logchannel to '+message.mentions.channels.first()+' and logging is currently **'+mi_settings.logchannelstatus+'**');
			}
		}
		else if(cmd[1] === 'about'){
			if(!message.guild.member(message.author).roles.exists('name', officer_role)){
				message.channel.sendMessage(':warning: You do not have permissions to do this.').then(msg=>{
					setTimeout(function(){ message.channel.bulkDelete([message, msg]); }, 7000);
				});
				return;
			}
			if(!squads.hasOwnProperty(message.author.id)){
				message.channel.sendMessage(':warning: You have not registered a squad yet.').then(msg=>{
					setTimeout(function(){ message.channel.bulkDelete([message, msg]); }, 7000);
				});
				return;
			}
			squads[message.author.id].about = txt;
			message.channel.sendMessage(':white_check_mark: Set the about for `'+squads[message.author.id].name+'` to ```'+squads[message.author.id].about+'```').then(msg=>{
				setTimeout(function(){ message.channel.bulkDelete([message, msg]); }, 10000);
			});
			refresh('squads');
		}
		else if(cmd[1].startsWith('reqs')){
			txt = message.content.substring(prefix.length+cmd[0].length + 6);
			if(!message.guild.member(message.author).roles.exists('name', officer_role)){
				message.channel.sendMessage(':warning: You do not have permissions to do this.').then(msg=>{
					setTimeout(function(){ message.channel.bulkDelete([message, msg]); }, 7000);
				});
				return;
			}
			if(!squads.hasOwnProperty(message.author.id)){
				message.channel.sendMessage(':warning: You have not registered a squad yet.').then(msg=>{
					setTimeout(function(){ message.channel.bulkDelete([message, msg]); }, 7000);
				});
				return;
			}
			squads[message.author.id].requirements = txt;
			message.channel.sendMessage(':white_check_mark: Set the requirements for `'+squads[message.author.id].name+'` to ```'+squads[message.author.id].requirements+'```').then(msg=>{
				setTimeout(function(){ message.channel.bulkDelete([message, msg]); }, 10000);
			});
			refresh('squads');
		}
		return;
	} //end set //done //done

	// #get
	if(cmd[0].toLowerCase() === 'get'){
		if(cmd[1] === 'logchannel'){
			message.channel.sendMessage('Logging is currently **'+mi_settings.logchannelstatus+'** in the '+message.guild.channels.find('name', mi_settings.logchannel)+' channel.');
		}
		else if(cmd[1] === 'greetmsg'){
			if(!message.guild.channels.exists('name', mi_settings.greetmsgchannel)){
				message.channel.sendMessage(':warning: The greet message is set to: ```'+mi_settings.greetmsg+'``` **but there is no channel associated with it yet. Set one by typing: `'+prefix+'set greetmsgchannel #<channelname>`**');
				return;
			}
			message.channel.sendMessage('The greet message is set to: ```'+mi_settings.greetmsg+'``` and it is currently **'+mi_settings.greetmsgstatus+'** in channel '+message.guild.channels.find('name', mi_settings.greetmsgchannel));
		}
		else if(cmd[1] === 'greetpm'){
			message.channel.sendMessage('The greet PM is set to: ```'+mi_settings.greetpm+'``` and it is currently **'+mi_settings.greetpmstatus+'**');
		}
		else if(cmd[1] === 'defaultrole'){
			message.channel.sendMessage('The default role is currently set to: `'+mi_settings.defaultrole+'` and it is currently **'+mi_settings.defaultrolestatus+'**');
		}
		else if(cmd[1] === 'byepm'){
			message.channel.sendMessage('The bye PM is set to: ```'+mi_settings.byepm+'``` and it is currently **'+mi_settings.byepmstatus+'**');
		}
		else{
			message.channel.sendMessage(':warning: Unable to identify keyword: `'+cmd[1]+'`');
		}
		return;
	} //end get //done

	// #toggle
	if(cmd[0].toLowerCase() === 'toggle'){
		if(cmd.length < 2) return;
		cmd[1] = cmd[1].toLowerCase();
		if(cmd[1] === 'greetmsg'){
			if(mi_settings.greetmsgstatus === 'enabled') mi_settings.greetmsgstatus = 'disabled';
			else mi_settings.greetmsgstatus = 'enabled';
			message.channel.sendMessage(':white_check_mark: Greet MSG is now **'+mi_settings.greetmsgstatus+'**');
		}
		else if(cmd[1] === 'greetpm'){
			if(mi_settings.greetpmstatus === 'enabled') mi_settings.greetpmstatus = 'disabled';
			else mi_settings.greetpmstatus = 'enabled';
			message.channel.sendMessage(':white_check_mark: Greet PM is now **'+mi_settings.greetpmstatus+'**');
		}
		else if(cmd[1] === 'byepm'){
			if(mi_settings.byepmstatus === 'enabled') mi_settings.byepmstatus = 'disabled';
			else mi_settings.byepmstatus = 'enabled';
			message.channel.sendMessage(':white_check_mark: Bye PM is now **'+mi_settings.byepmstatus+'**');
		}
		else if(cmd[1] === 'defaultrole'){
			if(mi_settings.defaultrolestatus === 'enabled') mi_settings.defaultrolestatus = 'disabled';
			else mi_settings.defaultrolestatus = 'enabled';
			message.channel.sendMessage(':white_check_mark: Default Role is now **'+mi_settings.defaultrolestatus+'**');
		}
		else if(cmd[1] === 'logchannel'){
			if(mi_settings.logchannelstatus === 'enabled') mi_settings.logchannelstatus = 'disabled';
			else mi_settings.logchannelstatus = 'enabled';
			message.channel.sendMessage(':white_check_mark: Logging is now **'+mi_settings.logchannelstatus+'**');
		}
		else{
			message.channel.sendMessage(':warning: Unrecognized keyword: `'+cmd[1]+'`');
		}
		refresh('malicious_settings');
	} //end toggle //done

	// #uinfo
	if(cmd[0].toLowerCase() === 'uinfo'){
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
			"**Nickname:** " + getNickname(user.id),
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
	}

	// #about
	if(cmd[0].toLowerCase() === 'about'){
		let time = process.uptime();
		let hours = Math.floor(time/3600);
		time = time - hours*3600;
		let minutes = Math.floor(time/60);
		let seconds = Math.floor(time - minutes * 60);
		message.channel.sendMessage([
	 		"```java",
	 		"Noble Experiment#9092. Created by dev#4317",
	 		"",
	 		"This bot is privately developed and maintained for the Malicious Intent gaming community. As such, most of my features and commands are disabled outside of the Malicious Intent server. If you have any questions or find any bugs, please message the owner.",
	 		"",
	 		"Uptime: " +hours + " hr, " + minutes + " min, " + seconds + " sec",
	 		"Servers: " + bot.guilds.size,
	 		"",
	 		"MI Server: <https://discord.gg/zgVcNGh>",
	 		"",
	 		"Invite this bot to your server: ",
	 		"https://discordapp.com/oauth2/authorize?&client_id=225345661590044672&scope=bot&permissions=0",
	 		"```"
	 	]);
	}

	// #help
	if(cmd[0].toLowerCase() === 'help'){
		let usr = message.author;
		let admin = [
			'**ADMIN COMMANDS**',
			'`'+prefix+'set [greetmsg|greetpm|byepm|greetmsgchannel|logchannel|defaultrole] [text]',
			'`       Sets the first parameter to the second parameter.`',
			'`'+prefix+'toggle [greetmsg|greetpm|byepm|defaultrole|logchannel]',
			'`       Toggles the first parameter`',
			'`'+prefix+'get [greetmsg|greetpm|byepm|defaultrole|logchannel|]',
			'`       Displays what the first parameter is set to and its status`',
			'`'+prefix+'approve @user',
			'`       Approves the tagged guest user to member status within guild`',
			'`'+prefix+'delete [tag|name|@captain]',
			'`       Deletes the squad and all related info in database`'
		]
		let management = [
			'**SQUAD MANAGEMENT COMMANDS**',
			'`'+prefix+'register <tag> <name>`\n       Registers your squad with the specified tag and name.',
			'`'+prefix+'set about <text>`\n       Sets your squad about section.',
			'`'+prefix+'set reqs <text>`\n       Sets your squad requirements',
			'`'+prefix+'drop @user`\n       Drops the tagged user from your squad',
			'`'+prefix+'invite @user`\n       Invites the tagged user to your squad',
			'`'+prefix+'approve @user`\n       Approves the tagged guest to member status in guild'
		];
		let general = [
			'**GENERAL USE COMMANDS**',
			'`'+prefix+'about`\n       Shows basic information about this bot',
			'`'+prefix+'list`\n       Lists out the squad index',
			'`'+prefix+'info [tag|name|@captain]`\n       Shows info for squad associated with keyword',
			'`'+prefix+'uinfo @user`\n       Shows the information for the tagged user',
			'*More coming soon...*'
		];
		if(message.guild.member(usr).roles.exists('name', admin_role)){
			usr.sendMessage(admin.concat(general));
		}
		else if(message.guild.member(usr).roles.exists('name', officer_role)){
			usr.sendMessage(management.concat(general));
		}
		else{
			usr.sendMessage(general);
		}
	}

}); //end of bot.on('message'...)

// #guildMemberAdd
// Checks to see whether guild has logging set and then greets/logs new member
bot.on('guildMemberAdd', (member)=>{
	if(settings.greetmsgstatus === 'enabled' && member.guild.channels.exists('name', settings.greetmsgchannel)){
		let greet = settings.greetmsg;
		if(greet.includes('@user')) greet = greet.replace('@user', ''+member);
		member.guild.channels.find('name', settings.greetmsgchannel).sendMessage(greet);
	}
	if(settings.greetpmstatus === 'enabled'){
		let greet = settings.greetpm;
		if(greet.includes('@user')) greet = greet.replace('@user', ''+member.user.username);
		member.sendMessage(greet);
	}
	if(settings.defaultrolestatus === 'enabled' && member.guild.roles.exists('name', settings.defaultrole)){
		let role = member.guild.roles.find('name', settings.defaultrole);
		member.addRole(role);
	}
	if(settings.logchannelstatus === 'enabled' && member.guild.channels.exists('name', settings.logchannel)){
		member.guild.channels.find('name', settings.logchannel).sendMessage(':white_check_mark: '+member+' ('+member.user.username+'#'+member.user.discriminator+') has joined the server.');
	}
}); //end of guildMemberAdd

// #guildMemberRemove
//
bot.on('guildMemberRemove', (member)=>{
	if(mi_settings.logchannelstatus === 'enabled' && member.guild.channels.exists('name', mi_settings.logchannel)){
		member.guild.channels.find('name', mi_settings.logchannel).sendMessage(':x: '+member+' ('+member.user.username+'#'+member.user.discriminator+') has left the server.');
	}
	if(settings.byepmstatus === 'enabled'){
		let byepm = mi_settings.byepm;
		if(byepm.includes('@user')) byepm = byepm.replace('@user', ''+member.user.username);
		member.sendMessage(byepm);
	}
}); //end guildMemberRemove

bot.login(token);


//returns a list of the squads for Malicious Intent in array
function getListOfSquads(serverId){
	let list = [];
	serverId = serverId || maliciousId;
	let tag_spaces, name_spaces, captain_spaces, points_spaces;
	let arr = Object.keys(squads);
	let guild = bot.guilds.find('id', serverId);
	list.push('**` TAG      NAME            CAPTAIN      SIZE`**');
	for(key in arr){
		var captain_user = guild.member(arr[key]);
		var display_name;
		let size = getSquadMembers(arr[key]).length;
		if(captain_user.nickname != undefined) display_name = captain_user.nickname;
		else display_name = captain_user.user.username;
		tag_spaces = '      ';
		tag_spaces = tag_spaces.substring(0, 7 - squads[arr[key]].tag.length);
		name_spaces = '                ';
		name_spaces = name_spaces.substring(0, 15-squads[arr[key]].name.length);
		captain_spaces = '          ';
		captain_spaces = captain_spaces.substring(0, 11-display_name.length);
		list.push("`["+squads[arr[key]].tag+"]"+tag_spaces+squads[arr[key]].name+name_spaces+" @"+display_name+captain_spaces+" "+size+"/"+squads[arr[key]].maxMembers+"`");
	}
	return list;
}

function getName(user){
	return user.username+'#'+user.discriminator;
}
//returns squad's ID if true, null if belongs to no squad
function checkIsInSquad(userId, serverId){
	if(userId === undefined) return null;
	serverId = serverId || maliciousId;
	let arr = Object.keys(squads);
	let guild = bot.guilds.find('id', serverId);
	for(key in arr){
		if(guild.member(userId).roles.exists('name', squads[arr[key]].name)){
			return arr[key];
		}
	}
	return null;
}

//returns array of squad Ids that userId was invited to
//returns null if server Id was no in bot.guilds
function getInvites(userId, serverId){
	if(userId === undefined) return [];
	serverId = serverId || maliciousId;
	let arr = Object.keys(squads);
	let guild = bot.guilds.find('id', serverId);
	if (guild === null) return null;
	let invites = [];
	for(key in arr){
		 if(squads[arr[key]].invites.indexOf(userId) !==  -1) invites.push(arr[key]);
	}
	return invites;
}

//returns array of squad members ids
function getSquadMembers(squadId, serverId){
	serverId = serverId || maliciousId;
	if(!squads.hasOwnProperty(squadId)) return null;
	let list = [];
	let guild = bot.guilds.find('id', serverId);
	let role = squads[squadId].name;
	let members = [squads[squadId].captainId];
	members = members.concat(guild.members.filter(entry=>{
		if(entry.roles.exists('name', role) && !entry.roles.exists('name', officer_role)) return true;
		else return false;
	}).map(entry=>{
		return entry.id;
	}));
	return members;
}

//returns string - squad id
function getSquadId(keyword){
	if(keyword.startsWith('<@')) keyword = keyword.replace(/\D/g,'');
	else if(keyword[0] === '[' || keyword[0] === '<' || keyword[0] === '"' || keyword[0] === "'" || keyword[0] === '('){
		keyword = keyword.substring(1, keyword.length-1);
	}
	keyword = keyword.toLowerCase();
	let target = null;
	let arr = Object.keys(squads);
	for(key in arr){
		if(squads[arr[key]].name.toLowerCase() === keyword || squads[arr[key]].tag.toLowerCase() === keyword || squads[arr[key]].captainId === keyword){
			target = arr[key];
		}
	}
	return target;
}

//returns string - nickname
function getNickname(userId, serverId){
	serverId = serverId || maliciousId;
	let guild = bot.guilds.find('id', serverId);
	if(!guild.members.exists('id', userId)) return 'not found';
	if(guild.member(userId).nickname !== null) return guild.member(userId).nickname;
	else return guild.member(userId).user.username;
}
