const prefix = "frost "
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

exports.help = help;