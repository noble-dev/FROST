//help
//import the discord.js module
const Discord = require('discord.js');

//create instance of a Discord Client
const bot = new Discord.Client();
const token = 'MjI1MzQ1NjYxNTkwMDQ0Njcy.CrntFw.jHDKx9Mj2ExBa6twSz7lywTu2-o';
const prefix = 'fuzzy '
bot.on('ready', () => {

	console.log('I am ready!');

});

bot.on('message', message =>{

	if(message.content === 'fuzzy') {
		num = Math.floor((Math.random() * 100) + 1);
		if(num === 100){
			message.channel.sendMessage('I guess Fuzzy is pretty cute...');
		}
		else{
			message.channel.sendMessage('is a tsun');
		}
	}
	if(message.content.startsWith(prefix+'help')){
		var ids = message.member.id; 
		var msgArray = [];
		msgArray.push('Hello');
		msgArray.push('World');
		message.channel.sendMessage('<@'+ids+'>, I slid into your DMs :wink:');
		message.member.sendMessage(msgArray);
		//message.member.sendMessage('Hi, I am FuzzyBot. I am a bot made for private use if you know what i mean :wink: \n ```test```');
	}
	if(message.content == '/apply'){
		message.member.sendMessage('Hi, please reply to the following questions and your application will be forwarded to an officer: \n ```questions here```');

	}
});

bot.login(token);