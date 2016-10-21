//import the discord.js module
const Discord = require('discord.js');
var fs = require('fs');
var sys = require('util');
var jsonfile = require('jsonfile');


//// GLOBAL VARIABLES /////
const bot = new Discord.Client();
const token = 'MjI1MzQ1NjYxNTkwMDQ0Njcy.CrntFw.jHDKx9Mj2ExBa6twSz7lywTu2-o';
const devId = "133352797776248832"; // dev's id
const prefix = '~';
var squads, settings, seversettings;

//FILE PATHS
const serversettingspath = './etc/server_settings.json';
const squadspath = './etc/MI_squads.json';
const settingspath = './etc/serversettings.json';

function refresh(path){
	try{
		if(path === 'squads'){
			jsonfile.writeFileSync(squadspath, squads);
			squads = jsonfile.readFileSync(squadspath);
		}
		else if(path === 'settings'){
			jsonfile.writeFileSync(settingspath, settings);
			settings = jsonfile.readFileSync(settingspath);
		}
		else if(path === 'oldsettings'){
			jsonfile.writeFileSync(serversettingspath, serversettings);
			serversettings = jsonfile.readFileSync(serversettingspath);
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
		settings = jsonfile.readFileSync(settingspath);
		serversettings = jsonfile.readFileSync(serversettingspath);
	}
	catch(err){
		console.log('Could not read one or more files...');
	 	console.log(err);
	}
	console.log('Ready for commands...');
}); //end of bot.on('ready'...)

//#message
bot.on('message', message=>{
	if(message.author.bot) return; //ignores other bots
	if(message.content[0] !== prefix) return; //ignores if doesn't start with prefix
	var cmd = message.content.substring(1).split(' ');
	var guild = message.guild;
	if(cmd[0] === 'ping'){
		message.channel.sendMessage('pong!');
		return;
	}
	if(cmd[0] === 'test'){

	}
	if(cmd[0].startsWith('set')){

		return;
	} //end set

	if(cmd[0].startsWith('get')){
		if(cmd[1] === 'logchannel'){
			message.channel.sendMessage(serversettings[message.guild.id][0].logchannel);
		}
		return;
	} //end get

	if(cmd[0].startsWith('toggle')){
		if(cmd.length > 2 && (cmd[2] != 'on' || cmd[2] != 'off' || cmd[2] != 'true' || cmd[2] != 'false'))
			message.channel.sendMessage(":warning: Sorry, didn't recognize `"+message.content.substring(0, message.content.indexOf(cmd[2]))+"`**`"+cmd[2]+"`**. Please specify `"+message.content.substring(0, message.content.indexOf(cmd[2]))+"`**`[on|off|true|false]`**.");
		if(cmd[1] === 'logchannel'){
			if(cmd.length > 2){
				if(cmd[2] === 'on') settings[guild.id].logstatus = true;
				else if(cmd[2] === 'off') settings[guild.id].logstatus = false;
			}
			else settings[guild.id].logchannelstatus = !settings[guild.id].logchannelstatus;
		}
		else if(cmd[1] === 'defaultrole'){
			if(cmd.length > 2){
				if(cmd[2] === 'on') settings[guild.id].defaultrolestatus = true;
				else if(cmd[2] === 'off') settings[guild.id].defaultrolestatus = false;
			}
			else settings[guild.id].defaultrolestatus = !settings[guild.id].defaultrolestatus;
		}
		else if(cmd[1] === 'greetmsg'){
			if(cmd.length > 2){
				if(cmd[2] === 'on') settings[guild.id].greetmsgstatus = true;
				else if(cmd[2] === 'off') settings[guild.id].greetmsgstatus = false;
			}
			else settings[guild.id].greetmsgstatus = !settings[guild.id].greetmsgstatus;
		}
		else if(cmd[1] === 'greetpm'){
			if(cmd.length > 2){
				if(cmd[2] === 'on') settings[guild.id].greetpmstatus = true;
				else if(cmd[2] === 'off') settings[guild.id].greetpmstatus = false;
			}
			else settings[guild.id].greetpmstatus = !settings[guild.id].greetpmstatus;
		}
		else if(cmd[1] === 'byemsg'){
			if(cmd.length > 2){
				if(cmd[2] === 'on') settings[guild.id].byemsgstatus = true;
				else if(cmd[2] === 'off') settings[guild.id].byemsgstatus = false;
			}
			else settings[guild.id].byemsgstatus = !settings[guild.id].byemsgstatus;
		}
		else if(cmd[1] === 'byepm'){
			if(cmd.length > 2){
				if(cmd[2] === 'on') settings[guild.id].byepmstatus = true;
				else if(cmd[2] === 'off') settings[guild.id].byepmstatus = false;
			}
			else settings[guild.id].byepmstatus = !settings[guild.id].byepmstatus;
		}
		return;
	} //end toggle


}); //end of bot.on('message'...)


// #guildCreate
// Creates the guild profile inside of settings with basic information.
bot.on('guildCreate', (guild)=>{
	jsonfile.readFile(settings, function(err, obj){
		if(err) return console.log('Could not read '+settings);
		obj[guild.id] = {};
		obj[guild.id].name = guild.name;
		obj[guild.id].id = guild.id;
		obj[guild.id].joined = guild.joinDate;
		obj[guild.id].logstatus = 0;
		obj[guild.id].greetmsgstatus = 0;
		obj[guild.id].greetpmstatus = 0;
		obj[guild.id].byepmstatus = 0;
		obj[guild.id].byemsgstatus = 0;
		obj[guild.id].defaultrolestatus = 0;
		obj[guild.id].defaultrole = [];
		console.log('Bot was invited to '+guild.name);
		jsonfile.writeFile(settings, obj, function(err){
			if(err) return console.log('Could not write to ' + settings);
		});
	});
}); //end of guildCreate

// #guildMemberAdd
// Checks to see whether guild has logging set and then greets/logs new member
bot.on('guildMemberAdd', (guild, member)=>{
	jsonfile.readFile(settings, function(err, obj){
		if(err) return console.log('Could not read '+settings);
		let logChannelEnabled = obj[guild.id].hasOwnProperty('logstatus') && obj[guild.id].logstatus === 1;
		let hasLogChannel = obj[guild.id].hasOwnProperty('logchannel') && guild.channels.exists('name', obj[guild.id].logchannel);
		let greetPmEnabled = obj[guild.id].hasOwnProperty('greetpmstatus') && obj[guild.id].greetpmstatus === 1 && obj[guild.id].hasOwnProperty('greetpm');
		let hasGreetMsgChannel = obj[guild.id].hasOwnProperty('greetmsgchannel') && guild.channels.exists('name', obj[guild.id].greetmsgchannel);
		let greetMsgEnabled = obj[guild.id].hasOwnProperty('greetmsgenabled') && obj[guild.id].greetmsgstatus === 1 && obj.hasOwnProperty('greetmsg');
		let defaultRoleEnabled = obj[guild.id].hasOwnProperty('defaultrolestatus') && obj[guild.id].defaultrolestatus === 1 && obj.hasOwnProperty('defaultrole');
		if(obj.hasOwnProperty(guild.id)){ //if settings has guild profile
			if(hasLogChannel && logChannelEnabled){
				guild.channels.find('name', obj[guild.id].logchannel).sendMessage(':white_check_mark: '+member+' ('+member.user.username+'#'+member.user.discriminator+') has joined the server.');
			}//end hasLogChannel
			if(greetPmEnabled){
				let greetpm = obj[guild.id].greetpm;
				if(greetpm.includes('@user')) greetpm = greetpm.replace('@user', member.user.username+'#'+member.user.discriminator);
				member.sendMessage(greetpm);
			}
			if(greetMsgEnabled && hasGreetMsgChannel){
				let greetmsg = obj[guild.id].greetmsg;
				if(greetmsg.includes('@user')) greetmsg = greetmsg.replace('@user', '<@'+member.id+'>');
				guild.channels.find('name', obj[guild.id].greetmsgchannel).sendMessage(greetmsg);
			}
			if(defaultRoleEnabled){
				let roles = obj[guild.id].defaultrole;
				let deletedRole = false;
				for(key in roles){
					if(guild.roles.exists('name', roles[key])) member.addRole(guild.roles.find('name', roles[key]));
					else{
						console.log('Could not find the role '+roles[key]+'. Deleting from defaultroles');
						obj[guild.id].defaultrole = obj[guild.id].defaultrole.splice(obj[guild.id].defaultrole.indexOf(roles[key]), 1);
						deletedRole = true;
					}
				}
				if(deletedRole) jsonfile.writeFile(settings, obj, function(err){
					if(err) return console.log('Could not find '+settings);
				});
			}
		}
	}); //end readFile
}); //end of guildMemberAdd

// #guildMemberRemove
//
bot.on('guildMemberRemove', (guild, member)=>{
	jsonfile.readFile(settings, function(err, obj){
		if(err) return console.log('Could not read '+settings);
		let logChannelEnabled = obj[guild.id].hasOwnProperty('logstatus') && obj[guild.id].logstatus === 1;
		let hasLogChannel = obj[guild.id].hasOwnProperty('logchannel') && guild.channels.exists('name', obj[guild.id].logchannel);
		let byePmEnabled = obj[guild.id].hasOwnProperty('byepmstatus') && obj[guild.id].byepmstatus === 1 && obj[guild.id].hasOwnProperty('byepm');
		let byeMsgEnabled = obj[guild.id].hasOwnProperty('byemsgstatus') && obj[guild.id].byepmstatus === 1 && obj[guild.id].hasOwnProperty('byemsg');
		let hasByeMsgChannel = obj[guild.id].hasOwnProperty('byemsgchannel') && guild.channels.exists('name', obj[guild.id].byemsgchannel);
		if(logChannelEnabled && hasLogChannel){
			guild.channels.find('name', obj[guild.id].logchannel).sendMessage(':x: '+member+' ('+member.user.username+'#'+member.user.discriminator+') has left the server.');
		}
		if(byePmEnabled){
			let byepm = obj[guild.id].byepm;
			if(byepm.includes('@user')) byepm = byepm.replace('@user', member.user.username+'#'+member.user.discriminator);
			member.sendMessage(byepm);
		}
		if(byeMsgEnabled && hasByeMsgChannel){
			let byemsg = obj[guild.id].byemsg;
			if(byemsg.includes('@user')) byemsg = byemsg.replace('@user', '<@'+member.id+'> ('+member.user.username+'#'+member.user.discriminator+')');
			guild.channels.find('name', obj[guild.id].byemsgchannel).sendMessage(byemsg);
		}
	}); //end readFile
}); //end guildMemberRemove

bot.login(token);
