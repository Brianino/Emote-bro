var commands = {};

commands.setrun = function (com, reqinput = false, method) {
	try {
		this[com].reqinput = reqinput;
		this[com].run = method;
	} catch (e) {
		return e.message;
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
	"correctusage" : "help",
	"reqinput" : false,
	"run" : function (msg, perm, prefix = ".") {
		//show help
		var embedobj = {};

		embedobj = {
			"title" : "All Available Commands",
			"color" : 0xFF0000,
			"fields" : []
		};
		for (var name in commands) {
			//verify perm level
			if (name != "setrun" && name != "getperms" && name != "reqinput" && name != "getusage") {
				if (commands[name].permlevel <= perm) {
					embedobj.fields.push({
						"name" : prefix + name,
						"value" : commands[name].description,
						"inline" : false
					});
				}
			}
		}
		msg.channel.send({embed: embedobj});
	}
};
commands.count = {
	"description" : "Display stored server count",
	"permlevel" : 0,
	"correctusage" : "count",
	"reqinput" : false,
	"run" : function () {
		//display stored server count
	}
};
commands.id = {
	"description" : "Search for a server by guild id",
	"permlevel" : 0,
	"correctusage" : "id [server id]",
	"reqinput" : false,
	"run" : function () {
		//search for server by id
	},
};
commands.name = {
	"description" : "Search for a server by guild name",
	"permlevel" : 0,
	"correctusage" : "name [server name]",
	"reqinput" : false,
	"run" : function () {
		//search for server by name
	}
};
commands.emote = {
	"description" : "Search for an emote",
	"permlevel" : 0,
	"correctusage" : "emote [emote name]",
	"reqinput" : false,
	"run" : function () {
		//Search for an emote
	}
};
commands.refresh = {
	"description" : "Refresh server list",
	"permlevel" : 10,
	"correctusage" : "refresh",
	"reqinput" : false,
	"run" : function () {
		//run refresh function
	}
};
commands.log = {
	"description" : "Log global vars",
	"permlevel" : 10,
	"correctusage" : "log",
	"reqinput" : false,
	"run" : function () {
		//log global vars
	}
};
commands.disp = {
	"description" : "Display server at specified array index",
	"permlevel" : 1,
	"correctusage" : "disp [index]",
	"reqinput" : false,
	"run" : function () {
		//display server at index
	}
};
commands.add = {
	"description" : "Increase specified user perms",
	"permlevel" : 1,
	"correctusage" : "add [user id] <ammount to add>",
	"reqinput" : false,
	"run" : function () {
		//increase user perms
	}
};
commands.remove = {
	"description" : "Lower specified user perms",
	"permlevel" : 1,
	"correctusage" : "remove [user id] <ammount to subtract>",
	"reqinput" : false,
	"run" : function () {
		//lower user perms
	}
};
commands.blacklist = {
	"description" : "Add channels to blacklist to ignore them, or remove them from the blacklist",
	"permlevel" : 1,
	"correctusage" : "blacklist [channel id] <add/remove>",
	"reqinput" : false,
	"run" : function () {
		//blacklist channel or remove from blacklist
	}
};
commands.prefix = {
	"description" : "Change bot command prefix",
	"permlevel" : 2,
	"correctusage" : "prefix [new prefix]",
	"reqinput" : false,
	"run" : function () {
		//change bot prefix
	}
};
commands.quit = {
	"description" : "Shutdown bot",
	"permlevel" : 10,
	"correctusage" : "shutdown",
	"reqinput" : false,
	"run" : function () {
		//shutdown bot
	}
};
commands.test = {
	"description" : "For Developer only",
	"permlevel" : 10,
	"correctusage" : "",
	"reqinput" : true,
	"run" : function (msg, input) {
		msg.channel.send(eval(input));
	}
}

module.exports = commands;
