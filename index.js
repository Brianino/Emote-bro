const Discord = require('discord.js');
const config = require('./config.js');
const commands = require('./commands.js');
const globals = require('./Globals/global.js');
const servers = require('./Globals/servers.js');
const search = require('./Globals/searches.js');

var arr = [], arrF = [], dfm = true, timecount = [];
var cId = '', aId = '', shg = false, prefix = '';
var users = [], gcl = [], msgdelete = {};
var fs = require('fs');

const bot = new Discord.Client();

function timer(seconds, timer) {
	return new Promise(function(resolve, reject) {
		var time = seconds * 1000;
		timecount++;
		setTimeout(function() {
			if (timecount == 1) {
				timecount--;
				console.log("Timer Done");
			} else {
				timecount--;
				console.log("More recent Timer Active");
			}
			resolve("Solved");
		}, time);
	});
};

bot.on('ready', () => {
	globals.setowner(config.owner);
	linkcommands();
	console.log("Ready");
});

function linkcommands () {
	commands.setrun("count", false, function (msg) {
		if (msg.deletable) {
			msg.delete();
		}
		msg.reply(servers.count());
	});
	commands.setrun("disp", true, function (msg, str) {
		var index = parseInt(str);

		if (msg.deletable) {
			msg.delete();
		}
		if (index != NaN) {
			dispserver(msg, index);
		}
	});
	commands.setrun("id", true, function (msg, str) {
		var id = parseInt(str), index = 0;

		if (msg.deletable) {
			msg.delete();
		}
		if (id == NaN) {
			throw {
				"name" : "invalid usage",
				"message" : str + " is not a valid id"
			}
		}
		try {
			index = servers.findbyid(id);
		} catch (e) {
			console.log(e);
			index = -1;
		}
		console.log("Index: " + index);
		if (index > -1) {
			dispserver(msg, index);
		}
	});
	commands.setrun("name", true, function (msg, str) {
		var count = servers.count, temp = "", found = [];

		if (msg.deletable) {
			msg.delete();
		}
		if (str == null || str == undefined || typeof(str) != 'string') {
			throw {
				"name" : "invalid usage",
				"message" : "invalid input: " + str
			}
		}
		for (var i = 0; i < count; i++) {
			temp = servers.prop(i, 'name');
			if (temp.includes("str")) {
				found.push(i);
			}
		}
		if (found.length == 0) {
			msg.reply("unable to find server");
		} else if (found.length == 1) {
			dispserver(msg, found[0]);
		} else {
			search.addusertoqueue(msg.author.id, msg.channel.id, found, 'name');
			timer(60, msg.author.id);
			disppage(msg, 0);
		}
	});
	commands.setrun("emote", true, function (msg, str) {
		var count = servers.count, temp = {}, found = false;
		var lim = 0, counter = 0, res = [];

		if (msg.deletable) {
			msg.delete();
		}
		if (str == null || str == undefined || typeof(str) != 'string') {
			throw {
				"name" : "invalid usage",
				"message" : "invalid input: " + str
			}
		}
		for (var i = 0; i < count; i++) {
			temp = servers.server(i);
			lim = Math.max(server.emotes.managed.length, server.emotes.unmanaged.length);
			for (var j = 0; j < lim; j++) {
				if (j < server.emotes.managed.length) {
					if (server.emotes.managed[j].name.includes(str)) {
						if (!found) {
							res.push({
								"index" : i,
								"managed" : 0,
								"unmanaged" : 0
							});
						}
						res[res.length - 1].managed++;
						found = true;
					}
				}
				if (j < server.emotes.unmanaged.length) {
					if (server.emotes.unmanaged[j].name.includes(str)) {
						if (!found) {
							res.push({
								"index" : i,
								"managed" : 0,
								"unmanaged" : 0
							});
						}
						res[res.length - 1].unmanaged++;
						found = true;
					}
				}
			}
			found = true;
		}
		if (found.length == 0) {
			msg.reply("unable to find server");
		} else if (found.length == 1) {
			dispserver(msg, found[0]);
		} else {
			search.addusertoqueue(msg.author.id, msg.channel.id, found, 'name');
			timer(60, msg.author.id);
			disppage(msg, 0);
		}
	});
	commands.setrun("log", false, function (msg) {
		try {
			console.log("Prefix: " + globals.p(msg.guild.id));
			console.log("Servers: " + servers.count());
			console.log("Search In Progress: " + search.searching());
		} catch (e) {
			console.log(e.message);
		}
	});
	commands.setrun("quit", false, function (msg) {
		if(msg.deletable) {
			msg.delete().then(function() {
				bot.destroy().then(function() {
					process.exit();
				});
			});
		} else {
			bot.destroy().then(function() {
				process.exit();
			});
		}
	});
};

bot.on('message', (message) => {
	var content = '', sections = [], com = '', perms = 0, prefix = '';
	var temp = [];

	prefix = globals.p(message.guild.id);

	if (!runcheck) {
		if (message.content.startsWith(prefix)) {
			content = message.content.substring(prefix.length);
			temp = content.split("\n");
			for (var i = 0; i < temp.length; i++) {
				sections = sections.concat(temp[i].split(" "));
			}
			com = sections[0].toLowerCase();
			if (sections.length > 1) {
				sections.splice(0, 1);
			} else {
				sections.pop();
			}
			perms = globals.getperms(message.author.id);
			if (perms >= commands.getperms(com)) {
				if (commands.reqinput(com)) {
					for (var i = 0; i < sections.length; i++) {
						if (sections[i] === "" || sections[i] === null || sections[i] === undefined) {
							sections.splice(i, 1);
							i--;
						}
					}
					try {
						if (com === 'test') {
							commands[com].run(message, content.substring(content.search("\n") + 2));
						} else {
							commands[com].run(message, sections.join(" "));
						}
					} catch (e) {
						console.log(e.message);
						if (e.name === 'invalid usage') {
							message.reply("correct usage is " + commands.getusage(com));
						} else {
							console.log("Error running: " + com);
							console.log(e.message);
							message.reply("Invalid input, please try" + 
								" `.[command] [input]`, or `.help` to see the commands");
						}
					}
				} else {
					if (com === 'help') {
						try {
							commands[com].run(message, perms, prefix);
						} catch (e) {
							if (e.message === 'invalid usage') {
								message.reply("correct usage is " + commands.getusage(com));
							} else {
								console.log("Error running: " + com);
								console.log(e.message);
							}
						}
					} else {
						try {
							commands[com].run(message);
						}  catch (e) {
							if (e.message === 'invalid usage') {
								message.reply("correct usage is " + commands.getusage(com));
							}  else {
								console.log("Error running: " + com);
								console.log(e.message);
								message.reply("Invalid input, please try" + 
									" `.[command] [input]`, or `.help` to see the commands");
							}
						}
					}
				}
			}
		}
	}
});

function runcheck (msg) {
	var parts = [], page = 0, input = 0, obj = {};
	if (search.verifysearchchannel(msg.author.id)) {
		if (parseInt(msg.content) == NaN) {
			parts = msg.content.split(" ");
			if (parts(0) == 'page') {
				page = parseInt(parts(1));
				if (page == NaN || page == null || page == undefined) {
					msg.reply("Incorrect usage, try `page [page number]`");
				} else {
					if (msg.deletable) {
						msg.delete();
					}
					disppage(msg, page);
				}
			}
			return true;
		} else {
			input = parseInt(msg.content);
			if (input == NaN || input == null || input == undefined) {
				msg.reply("Incorrect usage, try `[server index]`");
			} else {
				if (msg.deletable) {
					msg.delete();
				}
				obj = search.getusersearch(msg.author.id);
				if (obj != null) {
					dispserver(msg, obj.res[input]);
				}
			}
			return true;
		}
	}
	return false;
};

function dispserver (msg, index) {
	var embedobj = {}, server = servers.server(index), lim = 0;
	var managed = [], unmanaged = [], str1 = "", str2 = "";

	console.log("Displaying: " + server.id);
	embedobj = {
		"title" : server.name,
		"description" : server.link,
		"color" : 0x0000FF,
		"thumbnail" : {
			"url" : server.icon,
			"height" : 50,
			"width" : 50
		},
		"fields" : []
	}
	lim = Math.max(server.emotes.managed.length, server.emotes.unmanaged.length);
	for (var i = 0; i < lim; i++) {
		if (i < server.emotes.managed.length) {
			managed.push(server.emotes.managed[i].name)
		}
		if (i < server.emotes.unmanaged.length) {
			unmanaged.push(server.emotes.unmanaged[i].name)
		}
	}
	if (managed.length > 0) {
		str1 = managed.join(" ");
	} else {
		str1 = "None";
	}
	if (unmanaged.length > 0) {
		str2 = unmanaged.join(" ");
	} else {
		str2 = "None";
	}
	embedobj.fields.push({
		"name" : "Global",
		"value" : str1,
		"inline" : false
	});
	embedobj.fields.push({
		"name" : "Local",
		"value" : str2,
		"inline" : false
	});
	bot.fetchlink(server.link).then((invite) => {
		msg.channel.send({embed: embedobj}).then((msg) => {
			msgtimer(60, msg);
		});
	}).catch(e => {
		embedobj.description = "Dead Invite Link";
		search.deadlistserver(index);
		obj.deadlistserver(index);
	});
};

function disppage (msg, page) {
	var lim = 10, user = msg.author.id, obj = search.getusersearch(user);
	var min = page * lim, max = min + lim;
	var maxpage = Math.floor(obj.res.length / lim);
	var server = {};

	if (page > maxpage) {
		page = maxpage;
		min = page * lim;
		max = obj.res.length - min;
	} else if (page == maxpage) {
		min = page * lim;
		max = obj.res.length - min;
	}
	embedobj = {
		"title" : "Severs Found",
		"description" : "Type `[Number]` For server info or `Page [Number]` for the next page",
		"color" : 0x0000FF,
		"fields" : []
	}
	for (var i = min; i <= max; i++) {
		if (obj.type == 'name') {
			server = servers.server(obs.res[i]);
			embedobj.fields.push({
				"name" : i + " - " + server.name,
				"value" : "ID: " + server.id,
				"inline" : false
			});
		} else {
			server = servers.server(obs.res[i].index);
			embedobj.fields.push({
				"name" : i + " - " + server.name,
				"value" : "Global Matches: " + obj.res[i].managed + 
				"\nLocal Matches: " + obj.res[i].unmanaged,
				"inline" : false
			});
		}
	}
	msg.channel.send({embed: embedobj}).then((msg) => {
		search.updateuser(user, msg, true, page);
	});
};

function timer (seconds, id) {
	return new Promise(function(resolve, reject) {
		var time = seconds * 1000, userid = id;
		var obj = {};

		search.timeadd(userid);
		setTimeout(function(userid) {
			if (search.timesub(userid)) {
				obj = search.getusersearch(userid);
				try {
					if (obj.list.deletable) {
						obj.list.delete();
					}
				} catch (e) {
					console.log(e.message);
				}
				try {
					if (obj.msg.deletable) {
						obj.msg.delete();
					}
				} catch (e) {
					console.log(e.message);
				}
				console.log("Timer Done");
				search.removeuser(userid);
			}
			resolve("Solved");
		});
	});
};

function msgtimer (seconds, msg) {
	return new Promise(function(resolve, reject) {
		var time = seconds * 1000;

		setTimeout(function() {
			try {
				if (msg.deletable) {
					msg.delete().then(() => {
						console.log("message " + msg.id + " deleted");
					});
				}
			} catch (e) {
				console.log(e.message);
			}
			console.log("Deleting message");
			resolve("Solved");
		});
	});
};

function defaultMessageEvent(message) {
	/*
	* FUNCTION THAT RUNS ON MESSAGE EVENT
	*/
	var defaultlink = "discord.gg/";
	var parts = message.content.split(" ");
	var lines = message.content.split("\n");
	var tempstrarr = [], linkcount = 0;

	if (verifygc(message)) {
		if (parts.length === 1) {
			if (tolc(message.content) == (prefix + "l")) {
				/*
				* LOAD JSON DATA FROM FILE
				*/
				if(message.deletable) {
					message.delete();
				}
				if (message.author.id == config.owner) {
					readjsonfile();
				} else {
					message.channel.send("Dont have the required permissions");
				}
			} else if (tolc(message.content) == (prefix + "count")) {
				/*
				* COUNT NUMBER OF SERVERS STORED
				*/
				if(message.deletable) {
					message.delete();
				}
				message.reply("Number Of Servers: " + arr.length);
			} else if (tolc(message.content) === (prefix + "log")) {
				/*
				* LOG STATUS OF GLOBAL VARIABLES
				*/
				if(message.deletable) {
					message.delete();
				}
				if (message.author.id == config.owner) {
					logGlobals();
				} else {
					message.channel.send("Dont have the required permissions");
				}
			} else if (tolc(message.content) === (prefix + "help")) {
				/*
				* LOG STATUS OF GLOBAL VARIABLES
				*/
				var helpmsg = "";
				if(message.deletable) {
					message.delete();
				}
				if (verifyUser(message.author.id)) {
					helpmsg = "```\n";
					helpmsg = helpmsg + prefix + "count -> Number of servers stored\n"
					helpmsg = helpmsg + prefix + "disp -> Dsiplay server at specific index\n"
					helpmsg = helpmsg + prefix + "id -> Search for server by ID\n"
					helpmsg = helpmsg + prefix + "name -> Search for server by name\n"
					helpmsg = helpmsg + prefix + "emote -> Search for emote\n"
					helpmsg = helpmsg + prefix + "add -> Add advanced permissions to user (add user by ID)\n"
					helpmsg = helpmsg + prefix + "blacklist -> Block commands from certain channels (add channel by ID)\n"
					helpmsg = helpmsg + prefix + "rblacklist -> Remove blacklisted channel (by ID)\n"
					helpmsg = helpmsg + prefix + "prefix -> Change bot command prefix\n"
					helpmsg = helpmsg + "```"
				} else {
					helpmsg = "```\n";
					helpmsg = helpmsg + prefix + "count -> Number of servers stored\n"
					helpmsg = helpmsg + prefix + "id -> Search for server by ID\n"
					helpmsg = helpmsg + prefix + "name -> Search for server by name\n"
					helpmsg = helpmsg + prefix + "emote -> Search for emote\n"
					helpmsg = helpmsg + "```"
				}
				message.channel.send(helpmsg);
			}
		} else if (parts.length === 2) {
			if (tolc(parts[0]) == (prefix + "disp")) {
				/*
				* DISPLAY SERVER AT SPECIFIED INDEX
				*/
				if(message.deletable) {
					message.delete();
				}
				if (verifyUser(message.author.id)) {
					var index = parseInt(parts[1]);
					if (index > arr.length - 1) {
						index = arr.length - 1;
					}
					if (index < 0) {
						index = 0;
					}
					disp(message, index);
				} else {
					message.channel.send("Dont have the required permissions");
				}
			} else if (tolc(parts[0]) == (prefix + "id")) {
				if (message.deletable) {
					message.delete();
				}
				console.log("Searching For: " + parts[1]);
				try {
					searchByServer(message, parts[1], true);
				} catch (e) {
					message.reply("Not a Valid ID");
					console.log(e);
				}
			} else if (tolc(parts[0]) == (prefix + "name")) {
				if (message.deletable) {
					message.delete();
				}
				if (cId == '') {
					var temp = "";
					parts[0] = "";
					temp = parts[1];
					console.log("Searching For: " + tolc(temp));
					try {
						searchByServer(message, temp, false);
					} catch (e) {
						message.reply("Not Valid: " + temp);
						console.log(e);
					}
				} else {
					message.reply("Search in use, please wait");
				}
			} else if (tolc(parts[0]) == (prefix + "emote")) {
				if (message.deletable) {
					message.delete();
				}
				if (cId == '') {
					var temp = "";
					parts[0] = "";
					temp = parts[1];
					console.log("Searching For: " + temp);
					try {
						searchByEmote(message, temp);
					} catch (e) {
						message.reply("Not Valid: " + temp);
						console.log(e);
					}
				} else {
					message.reply("Search in use, please wait");
				}
			} else if (tolc(parts[0]) == (prefix + "add")) {
				if (message.deletable) {
					message.delete();
				}
				if (verifyUser(message.author.id)) {
					users.push({
						"id" : parts[1],
						"admin" : false
					});
					console.log("Added User: " + parts[1]);
					writeuserjsonfile();
				} else {
					message.channel.send("Dont have the required permissions");
				}
			} else if (tolc(parts[0]) == (prefix + "remove")) {
				if (message.deletable) {
					message.delete();
				}
				if (verifyUser(message.author.id)) {
					var found = false, i = 0;
					while (!found && i < users.length) {
						if (users[i].id == parts[1]) {
							users.splice(i, 1);
							console.log("Removed User: " + parts[1]);
							found = true;
						}
						i++;
					}
					if (!found) {
						console.log("Unable To Remove User: " + parts[1]);
					} else {
						writeuserjsonfile();
					}
				} else {
					message.channel.send("Dont have the required permissions");
				}
			} else if (tolc(parts[0]) == (prefix + "blacklist")) {
				if (message.deletable) {
					message.delete();
				}
				if (verifyUser(message.author.id)) {
					var found = false, i = 0;
					var temp = [];
					while (!found && i < gcl.length) {
						if (gcl[i].id == message.guild.id) {
							gcl[i].channels.push(parts[1]);
							console.log("Blacklisted Channel: " + parts[1]);
							found = true;
						}
						i++;
					}
					if (!found) {
						gcl.push({
							"id" : message.guild.id,
							"channels" : []
						});
						gcl[gcl.length - 1].channels.push(parts[1]);
						console.log("Blacklisted Channel: " + parts[1]);
					}
					writegcljsonfile();
				} else {
					message.channel.send("Dont have the required permissions");
				}
			} else if (tolc(parts[0]) == (prefix + "rblacklist")) {
				if (message.deletable) {
					message.delete();
				}
				if (verifyUser(message.author.id)) {
					var found = false, i = 0, j = 0;
					if (message.deletable) {
						message.delete();
					}
					while (!found && i < gcl.length) {
						if (gcl[i].id == message.guild.id) {
							while (!found && j < gcl[i].channels.length) {
								if (gcl[i].channels[j] == parts[1]) {
									gcl[i].channels.splice(j, 1);
									console.log("Removed Channel: " + parts[1]);
									found = true;
								}
								j++;
							}
						}
						i++;
					}
					if (!found) {
						console.log("Channel not Blacklisted");
						message.channel.send("Channel Not Blacklisted");
					} else {
						writegcljsonfile();
					}
				} else {
					message.channel.send("Dont have the required permissions");
				}
			} else if (tolc(parts[0]) == (prefix + "prefix")) {
				if (message.deletable) {
					message.delete();
				}
				if (verifyUser(message.author.id)) {
					prefix = parts[1];
					writesettingsjsonfile();
				} else {
					message.channel.send("Dont have the required permissions");
				}
			}
		} else if (parts.length == 3) {
			if ((tolc(parts[0]) == (prefix + "emote")) && (tolc(parts[2]) == "all")) {
				if (message.deletable) {
					message.delete();
				}
				if (cId == '') {
					var temp = "";
					console.log("Searching For: " + parts[1]);
					try {
						searchByEmote(message, parts[1], true);
					} catch (e) {
						message.reply("Not Valid: " + temp);
						console.log(e);
					}
				} else {
					message.reply("Search in use, please wait");
				}
			}
			if (tolc(parts[0]) == (prefix + "name")) {
				if (message.deletable) {
					message.delete();
				}
				if (cId == '') {
					var temp = "";
					parts[0] = "";
					temp = parts.join(" ");
					temp = temp.substring(1, temp.length);
					console.log("Searching For: " + tolc(temp));
					try {
						searchByServer(message, temp, false);
					} catch (e) {
						message.reply("Not Valid: " + temp);
						console.log(e);
					}
				} else {
					message.reply("Search in use, please wait");
				}
			}
		} else if (parts.length == 4) {
			if ((tolc(parts[0]) == (prefix + "emote")) && (tolc(parts[2]) == "all") && (tolc(parts[3]) == "global")) {
				if (message.deletable) {
					message.delete();
				}
				if (cId == '') {
					var temp = "";
					console.log("Searching For: " + parts[1]);
					try {
						searchByEmote(message, parts[1], true, true);
					} catch (e) {
						message.reply("Not Valid: " + temp);
						console.log(e);
					}
				} else {
					message.reply("Search in use, please wait");
				}
			}
			if (tolc(parts[0]) == (prefix + "name")) {
				if (message.deletable) {
					message.delete();
				}
				if (cId == '') {
					var temp = "";
					parts[0] = "";
					temp = parts.join(" ");
					temp = temp.substring(1, temp.length);
					console.log("Searching For: " + tolc(temp));
					try {
						searchByServer(message, temp, false);
					} catch (e) {
						message.reply("Not Valid: " + temp);
						console.log(e);
					}
				} else {
					message.reply("Search in use, please wait");
				}
			}
		} else {
			if (tolc(parts[0]) == (prefix + "name")) {
				if (message.deletable) {
					message.delete();
				}
				if (cId == '') {
					var temp = "";
					parts[0] = "";
					temp = parts.join(" ");
					temp = temp.substring(1, temp.length);
					console.log("Searching For: " + tolc(temp));
					try {
						searchByServer(message, temp, false);
					} catch (e) {
						message.reply("Not Valid: " + temp);
						console.log(e);
					}
				} else {
					message.reply("Search in use, please wait");
				}
			}
		}
		if (message.author.id == config.owner) {
			if (message.content === (prefix + "quit")) {
				//SHUT DOWN BOT
				if(message.deletable) {
					message.delete().then(function() {
						bot.destroy().then(function() {
							process.exit();
						});
					});
				} else {
					bot.destroy().then(function() {
						process.exit();
					});
				}
			}
		}
	}
}

function writejsonfile() {
	/*
	* WRITE AND STORE JSON DATA TO FILE
	*/
	fs.writeFile("Files/ServerList.json", JSON.stringify(arr), function(err) {
		if(err) {
			return console.log(err);
		}
		//console.log("The file was saved!");
	});
}

function readjsonfile() {
	/*
	* READ AND STORE JSON DATA FROM A TXT FILE
	*/
	fs.readFile("Files/ServerList.json", "utf8", function read(err, data) {
		if(err) {
			return console.log(err.message);
		}
		//console.log("Data loaded!");
		arr = JSON.parse(data);
	});
}

function readuserjsonfile() {
	/*
	* READ AND STORE VALID USERS FROM A TXT FILE
	*/
	fs.readFile("Files/Users.json", "utf8", function read(err, data) {
		if(err) {
			return console.log(err.message);
		}
		//console.log("Users were loaded!");
		users = JSON.parse(data);
	});
}

function writeuserjsonfile() {
	/*
	* WRITE VALID USERS TO A TXT FILE
	*/
	fs.writeFile("Files/Users.json", JSON.stringify(users), function(err) {
		if(err) {
			return console.log(err);
		}
		//console.log("Users were saved!");
	});
}

function readgcljsonfile() {
	/*
	* READ AND STORE VALID GUILDS AND CHANNELS FROM A TXT FILE
	*/
	fs.readFile("Files/Channels.json", "utf8", function read(err, data) {
		if(err) {
			return console.log(err.message);
		}
		//console.log("Whitelisted Guilds were loaded!");
		gcl = JSON.parse(data);
	});
}

function writegcljsonfile() {
	/*
	* WRITE VALID GUILDS AND CHANNELS TO A TXT FILE
	*/
	fs.writeFile("Files/Channels.json", JSON.stringify(gcl), function(err) {
		if(err) {
			return console.log(err.message);
		}
		//console.log("Whitelisted Guilds were saved!");
	});
}

function readsettingsjsonfile() {
	/*
	* WRITE SETTINGS TO FILES
	*/
	var temp = {
		"prefix" : prefix,
	}
	fs.readFile("Files/Settings.json", "utf8", function read(err, data) {
		if(err) {
			prefix = '.';
			console.log("Prefix set to: " + prefix);
			return console.log(err.message);
		}
		console.log("Settings were loaded!");
		try {
			prefix = JSON.parse(data).prefix;
		} catch (e) {
			console.log(e.message);
			prefix = '.';
		}
		console.log("Prefix set to: " + prefix);
	});
}

function writesettingsjsonfile() {
	/*
	* WRITE SETTINGS TO FILES
	*/
	var temp = {
		"prefix" : prefix
	}
	fs.writeFile("Files/Settings.json", JSON.stringify(temp), function(err) {
		if(err) {
			return console.log(err.message);
		}
		//console.log("Settings were saved!");
	});
}

function verifyUser(input) {
	try {
		if (config.owner == input) {
			return true;
		}
		for (var i = 0; i < users.length; i++) {
			if (input == users[i].id) {
				return true;
			}
		}
	} catch (e) {
		console.log(e.message);
	}
	return false;
}

function verifygc(input) {
	try {
		if (input.author.id == config.owner) {
			return true;
		}
		if (gcl.length == 0) {
			return false;
		}
		for (var i = 0; i < gcl.length; i++) {
			if (input.guild.id == gcl[i].id) {
				for (var j = 0; j < gcl[i].channels.length; j++) {
					if (input.channel.id == gcl[i].channels[j]) {
						return false;
					}
				}
				return true;
			}
		}
		gcl.push({
			"id" : message.guild.id,
			"channels" : []
		});
		return true;
	} catch (e) {
		console.log(e.message);
	}
	return false;
}

bot.login(config.token); //Bot Token