var commands = {};

commands.setrun = function (com, method) {
	try {
		this[com].run = method;
	} catch (e) {
		return e.message;
	}
};
commands.help = {
	"description" : "Show all available commands",
	"permlevel" : 0,
	"run" : function (msg, perm) {
		//show help
		var embedobj = {};

		embedobj = {
			"title" : "All Available Commands",
			"color" : 0xFF0000,
			"fields" : []
		};
		for (var name in commands) {
			//verify perm level
			if (this[name].permlevel <= perm) {
				embedobj.fields.push({
					"name" : name,
					"value" : commands[name].description,
					"inline" : false
				});
			}
		}
		msg.channel.send({embed: embedobj});
	}
};
commands.count = {
	"description" : "Display stored server count",
	"permlevel" : 0,
	"run" : function () {
		//display stored server count
	}
};
commands.id = {
	"description" : "Search for a server by guild id",
	"permlevel" : 0,
	"run" : function () {
		//search for server by id
	},
};
commands.name = {
	"description" : "Search for a server by guild name",
	"permlevel" : 0,
	"run" : function () {
		//search for server by name
	}
};
commands.emote = {
	"description" : "Search for an emote",
	"permlevel" : 0,
	"run" : function () {
		//Search for an emote
	}
};
commands.refresh = {
	"description" : "Refresh server list",
	"permlevel" : 10,
	"run" : function () {
		//run refresh function
	}
};
commands.log = {
	"description" : "Log global vars",
	"permlevel" : 10,
	"run" : function () {
		//log global vars
	}
};
commands.disp = {
	"description" : "Display server at specified array index",
	"permlevel" : 1,
	"run" : function () {
		//display server at index
	}
};
commands.add = {
	"description" : "Increase specified user perms",
	"permlevel" : 1,
	"run" : function () {
		//increase user perms
	}
};
commands.remove = {
	"description" : "Lower specified user perms",
	"permlevel" : 1,
	"run" : function () {
		//lower user perms
	}
};
commands.blacklist = {
	"description" : "Add channels to blacklist to ignore them, or remove them from the blacklist",
	"permlevel" : 1,
	"run" : function () {
		//blacklist channel or remove from blacklist
	}
};
commands.prefix = {
	"description" : "Change bot command prefix",
	"permlevel" : 2,
	"run" : function () {
		//change bot prefix
	}
};
commands.quit = {
	"description" : "Shutdown bot",
	"permlevel" : 10,
	"run" : function () {
		//shutdown bot
	}
};

module.exports = commands;