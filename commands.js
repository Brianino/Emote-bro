var commands = {};

commands.setrun = function (com, reqinput = false, method) {
	try {
		this[com].reqinput = reqinput;
		this[com].run = method;
	} catch (e) {
		console.log(com + ': ' + e.message);
	}
};
commands.getperms = function (com) {
	var perm = 0;
	try {
		perm = this[com].permlevel;
		if (perm === undefined || perm === null) {
			perm = 11;
		}
	} catch (e) {
		console.log(com + " is invalid");
		perm = 11;
	}
	return perm;
};
commands.getflag = function (com) {
	try {
		return this[com].flag;
	} catch (e) {
		return null;
	}
};
commands.reqinput = function (com) {
	try {
		return this[com].reqinput;
	} catch (e) {
		return false;
		//console.log(e.message);
	}
};
commands.getusage = function (com) {
	try {
		return this[com].correctusage;
	} catch (e) {
		console.log(e.message);
	}
};
commands.help = {
	"description" : "Show all available commands",
	"permlevel" : 0,
	"flag" : "SEND_MESSAGES",
	"correctusage" : "help <command>",
	"reqinput" : true,
	"run" : function (msg, perm, prefix = ".", input = "") {
		//show help
		var embedobj = {};

		embedobj = {
			"title" : "All Available Commands",
			"color" : 0xFF0000,
			"fields" : []
		};
		if (input.length === 0) {
			for (var name in commands) {
				//verify perm level
				if (name != "setrun" && name != "getperms" && name != "reqinput" && name != "getusage" && name != "getflag") {
					if (commands[name].permlevel <= perm) {
						embedobj.fields.push({
							"name" : prefix + name,
							"value" : commands[name].description,
							"inline" : false
						});
					}
				}
			}
		} else {
			embedobj.title = input;
			try {
				embedobj.description = "Description: " + commands[input].description + "\n" +
				"Usage: " + prefix + commands[input].correctusage;
			} catch (e) {
				throw {
					"name" : "invalid usage",
					"message" : input + " is not a valid command"
				}
			}
		}
		msg.channel.send({embed: embedobj});
	}
};
commands.count = {
	"description" : "Display stored server count",
	"permlevel" : 0,
	"flag" : "SEND_MESSAGES",
	"correctusage" : "count",
	"reqinput" : false,
	"run" : function () {
		//display stored server count
	}
};
commands.disp = {
	"description" : "Display server at specified array index",
	"permlevel" : 1,
	"flag" : "SEND_MESSAGES",
	"correctusage" : "disp [index]",
	"reqinput" : false,
	"run" : function () {
		//display server at index
	}
};
commands.id = {
	"description" : "Search for a server by guild id",
	"permlevel" : 0,
	"flag" : "SEND_MESSAGES",
	"correctusage" : "id [server id]",
	"reqinput" : false,
	"run" : function () {
		//search for server by id
	},
};
commands.name = {
	"description" : "Search for a server by guild name",
	"permlevel" : 0,
	"flag" : "SEND_MESSAGES",
	"correctusage" : "name [server name]",
	"reqinput" : false,
	"run" : function () {
		//search for server by name
	}
};
commands.emote = {
	"description" : "Search for an emote",
	"permlevel" : 0,
	"flag" : "SEND_MESSAGES",
	"correctusage" : "emote [emote name]",
	"reqinput" : false,
	"run" : function () {
		//Search for an emote
	}
};
commands.edit = {
	"description" : "Edit server properties",
	"permlevel" : 1,
	"flag" : "MANAGE_MESSAGES",
	"correctusage" : "edit <server id> [property name] [new value]",
	"reqinput" : false,
	"run" : function () {
		//Edit server properties
	}
};
commands.props = {
	"description" : "Display server editable properties",
	"permlevel" : 1,
	"flag" : "MANAGE_MESSAGES",
	"correctusage" : "props",
	"reqinput" : false,
	"run" : function () {
		//Display server editable properties
	}
};
commands.read = {
	"description" : "Read server data from json file (coming soon)",
	"permlevel" : 1,
	"flag" : "SEND_MESSAGES",
	"correctusage" : "read [.json file attatched]",
	"reqinput" : false,
	"run" : function () {
		//Read server data from json file
	}
};
commands.add = {
	"description" : "Increase specified user perms",
	"permlevel" : 1,
	"flag" : "MANAGE_ROLES",
	"correctusage" : "add [user] <ammount to add>",
	"reqinput" : false,
	"run" : function () {
		//increase user perms
	}
};
commands.remove = {
	"description" : "Lower specified user perms",
	"permlevel" : 1,
	"flag" : "MANAGE_ROLES",
	"correctusage" : "remove [user] <ammount to subtract>",
	"reqinput" : false,
	"run" : function () {
		//lower user perms
	}
};
commands.blacklist = {
	"description" : "Add channels to blacklist to ignore them, or remove them from the blacklist",
	"permlevel" : 1,
	"flag" : "MANAGE_GUILD",
	"correctusage" : "blacklist [channel] <add/remove>",
	"reqinput" : false,
	"run" : function () {
		//blacklist channel or remove from blacklist
	}
};
commands.prefix = {
	"description" : "Change bot command prefix",
	"permlevel" : 2,
	"flag" : "MANAGE_GUILD",
	"correctusage" : "prefix [new prefix]",
	"reqinput" : false,
	"run" : function () {
		//change bot prefix
	}
};
commands.refresh = {
	"description" : "Refresh server list",
	"permlevel" : 9,
	"flag" : "SEND_MESSAGES",
	"correctusage" : "refresh",
	"reqinput" : false,
	"run" : function () {
		//run refresh function
	}
};
commands.log = {
	"description" : "Log global vars",
	"permlevel" : 10,
	"flag" : "SEND_MESSAGES",
	"correctusage" : "log",
	"reqinput" : false,
	"run" : function () {
		//log global vars
	}
};
commands.dead = {
	"description" : "Display dead servers that require invites",
	"permlevel" : 1,
	"flag" : "MANAGE_MESSAGES",
	"correctusage" : "dead",
	"reqinput" : false,
	"run" : function () {
		//Display dead servers that require invites
	}
};
commands.incomplete = {
	"description" : "Display information required for these servers to be listed",
	"permlevel" : 1,
	"flag" : "MANAGE_MESSAGES",
	"correctusage" : "incomplete",
	"reqinput" : false,
	"run" : function () {
		//Display required info for incomplete servers
	}
};
commands.quit = {
	"description" : "Shutdown bot",
	"permlevel" : 9,
	"flag" : "SEND_MESSAGES",
	"correctusage" : "shutdown",
	"reqinput" : false,
	"run" : function () {
		//shutdown bot
	}
};
commands.test = {
	"description" : "For Developer only",
	"permlevel" : 10,
	"flag" : "SEND_MESSAGES",
	"correctusage" : "",
	"reqinput" : true,
	"run" : function (msg, input) {
	}
}

module.exports = commands;
