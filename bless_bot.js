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
const prefix = '!';
const chooseclasschannel = 'choose-your-class';

//#ready
bot.on('ready', ()=>{
	console.log('Bless ready for commands...');
}); //end of bot.on('ready'...)

//#message
bot.on('message', message=>{
	try{
		///// PERMS CHECKS //////
		if(message.author.bot) return; //ignores other bot
		if(message.channel.type === 'dm' || message.channel.type === 'group') return;
		if(message.channel === message.guild.channels.find('name', chooseclasschannel)){
			if(!message.content.startsWith(prefix+'class')){
				message.channel.sendMessage(message.author+', you can only use the `!class` command here. Please see the pinned message for more information.').then(msg=>{
					message.delete();
					msg.delete(10000);
				});
			}
		}
		if(message.content[0] !== prefix) return; //ignores if doesn't start with prefix
		var cmd = message.content.substring(1).split(' ');
		/////////////////////////
		if(cmd[0].toLowerCase() === 'class'){
			if(message.channel !== message.guild.channels.find('name', chooseclasschannel)){
				message.channel.sendMessage(':warning: '+message.author+', this command is only available in the '+message.guild.channels.find('name', chooseclasschannel)+' channel.').then(msg=>{
					bulkDelete(message.channel, [msg, message], 5000);
				});
				return;
			}
			if(cmd.length === 1){
				message.channel.sendMessage(message.author+', here is a list of available classes:\n`Guardian | Berserker | Ranger | Paladin | Assassin | Mage | Warlock | Mystic`').then(msg=>{
					bulkDelete(message.channel, [msg, message], 10000);
				});
				return;
			}
			let target = cmd[1].charAt(0).toUpperCase() + cmd[1].toLowerCase().slice(1);
			let exist = message.guild.roles.exists('name', target);
			if(exist){
				message.guild.member(message.author).addRole(message.guild.roles.find('name', target)).then(m=>{
					message.channel.sendMessage(':white_check_mark: '+m+', you have been assigned the `'+target+'` class role.').then(msg=>{
						bulkDelete(message.channel, [msg, message], 10000);
					});
				});
			}
			else{
				message.channel.sendMessage(':warning: '+message.author+', the class `'+target+'` does not exist. Here is a list of available classes:\n`Guardian | Berserker | Ranger | Paladin | Assassin | Mage | Warlock | Mystic`').then(msg=>{
					bulkDelete(message.channel, [msg, message], 10000);
				});
			}
			return;
		}
		if(cmd[0] === 'set'){
			message.channel.sendMessage('Type `'+prefix+'class [Guardian|Ranger|Berserker|Assassin|Mage|Warlock|Mystic|Paladin]` to have that class role assigned to you.\n*Example: `!class Ranger`*\nOnce done, you should have access to the class-access only text channels and the class role.');
		}
	}
	catch(err){

	}
});


bot.login(token);

function bulkDelete(channel, messages, time){
	setTimeout(function(){ channel.bulkDelete(messages)}, time);
}
