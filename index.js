const Discord = require('discord.js');
const config = require('./config.js');
const commands = require('./commands.js');
const globals = require('./Globals/global.js');
const servers = require('./Globals/servers.js');
const searchqueue = require('./Globals/searches.js');

const bot = new Discord.Client();

bot.on('ready', () => {
	try {
		globals.setowner(config.owner);
	} catch (e) {
		console.log(e.message);
	}
	linkcommands();
	console.log("Ready");
});

function linkcommands () {
	//Assings the functions for each command
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
		} else {
			throw {
				"name" : "invalid usage",
				"message" : str + " is not a valid index"
			};
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
			};
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
			};
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
			searchqueue.addusertoqueue(msg.author.id, msg.channel.id, found, 'name');
			timer(60, msg.author.id);
			disppage(msg, 0);
		}
	});
	commands.setrun("emote", true, function (msg, str) {
		var count = servers.count, temp = {}, found = false;
		var lim = 0, counter = 0, res = [];
		var patt = /<:[A-Za-z0-9_]{2,}:\d+>/;
		var patt2 = /:[A-Za-z0-9_]{2,}:/;

		if (msg.deletable) {
			msg.delete();
		}
		if (str == null || str == undefined || typeof(str) != 'string') {
			throw {
				"name" : "invalid usage",
				"message" : "invalid input: " + str
			};
		}
		if (patt.test(str)) {
			str = patt2.exec(str);
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
		if (!found) {
			msg.reply("unable to find server");
		} else if (res.length === 1) {
			dispserver(msg, res[0]);
		} else {
			searchqueue.addusertoqueue(msg.author.id, msg.channel.id, res, 'emote');
			timer(60, msg.author.id);
			disppage(msg, 0);
		}
	});
	commands.setrun("edit", true, function (msg, str) {
		var id = parseInt(str.split(" ")[0]), prop = str.split(" ")[1];
		var input = str.split(" ").splice(0, 2).join(" ");
		if (msg.deletable) {
			msg.delete();
		}
		if (str.split(" ")[0] === 'link') {
			prop = 'link';
			id = 0;
		}
		if (id === NaN) {
			throw {
				"name" : "invalid usage",
				"message" : "invalid id: " + str.split(" ")[0]
			};
		}
		if (!servers.checkprop(str)) {
			throw {
				"name" : "invalid usage",
				"message" : "invalid id: " + str.split(" ")[1]
			};
		}
		if (prop === 'link') {
			bot.fetchlink(input).then((invite) => {
				servers.updateserver(invite.guild.id, 'name', invite.guild.name);
				servers.updateserver(invite.duild.id, 'link', invite.url);
			})
		} else {
			try {
				servers.updateserver(id, prop, input);
			} catch (e) {
				console.log(e.name);
				msg.reply(e.message);
			}
		}
	});
	commands.setrun("probs", false, function(msg) {
		var embedobj = {}, obj = [];
		if (msg.deletable) {
			msg.delete();
		}
		obj = servers.getprops();
		embedobj = {
			"title" : "Editable Properties",
			"description" : "The server properties that can be edited",
			"color" : 0xFF0000,
			"fields" : []
		};
		for (var i = 0; i < obj.length; i++) {
			embedobj.fields.push({
				"name" : obj[i].prop,
				"value" : obj[i].type
			});
		};
		msg.channel.send({embed: embedobj}).then((msg) => {
			msgtimer(30, msg);
		});
	});
	commands.setrun("read", true, function (msg, str) {
		var attachments = Array.from(msg.attachments), url = "";
		const fs = require('fs');
		if (msg.deletable) {
			msg.delete();
		}
		if (attachments.length == 1) {
			if (attachments[0].filename.includes(".json")) {
				url = new URL(attachments[0].url);
				console.log(msg.author.username + " uploaded a json file");
			} else {
				throw {
					"name" : "invalid usage",
					"message" : "not a json file"
				};
			}
		} else {
			throw {
				"name" : "invalid usage",
				"message" : "too many attachments"
			};
		}
		fs.readFile(url, "utf8", function read(err, data) {
			if(err) {
				return console.log(err.message);
			}
			console.log("Loaded update file!");
			try {
				readobj(JSON.parse(data));
			} catch (e) {
				console.log(e.message);
				throw {
					"name" : "invalid usage",
					"message" : e.message
				};
			}
		});
	});
	commands.setrun("add", true, function (msg, str) {
		var parts = str.split(" "), id = 0;
		var lvl = 0;

		if (msg.deletable) {
			msg.delete();
		}
		try {
			id = getuser(msg, parts[0]);
		} catch (e) {
			throw {
				"name" : "invalid usage",
				"message" : e.message
			};
		}
		if (parts.length > 1) {
			lvl = parseInt(parts[1]);
			if (lvl == NaN) {
				throw {
					"name" : "invalid usage",
					"message" : "invalid amount: " + parts[1]
				};
			}
		} else {
			lvl = 1;
		}
		globals.increaseperms(msg.author.id, id, msg.guild.id, lvl);
	});
	commands.setrun("remove", true, function (msg, str) {
		var parts = str.split(" "), id = 0;
		var lvl = 0;

		if (msg.deletable) {
			msg.delete();
		}
		try {
			id = getuser(msg, parts[0]);
		} catch (e) {
			throw {
				"name" : "invalid usage",
				"message" : e.message
			};
		}
		if (parts.length > 1) {
			lvl = parseInt(parts[1]);
			if (lvl == NaN) {
				throw {
					"name" : "invalid usage",
					"message" : "invalid amount: " + parts[1]
				};
			}
		} else {
			lvl = 1;
		}
		globals.removeperms(msg.author.id, id, msg.guild.id, lvl);
	});
	commands.setrun("blacklist", true, function (msg, str) {
		var parts = str.split(" "), channel = "";

		if (msg.deletable) {
			msg.delete();
		}
		//get channel
		channel = getchannel(msg, parts[0]);
		if (parts.length > 1) {
			if (parts[1] === 'add') {
				//run add
				globals.blacklistadd(channel);
			} else if (parts[1] === 'remove') {
				//run remove
				globals.blacklistremove(channel);
			} else {
				throw {
					"name" : "invalid usage",
					"message" : "invalid sub command: " + parts[1]
				};
			}
		} else {
			//run add
			globals.blacklistadd(channel);
		}
	});
	commands.setrun("prefix", true, function (msg, str) {
		if (msg.deletable) {
			msg.delete();
		}
		if (str.length > 0) {
			if (!str.includes(" ")) {
				if (!str.includes("\n") && !str.includes("\r")) {
					globals.newprefix(msg.auid.id, str);
					return null;
				}
			}
		}
		throw {
			"name" : "invalid usage",
			"message" : "invalid prefix: " + str
		}
	});
	commands.setrun("refresh", false, function (msg) {
		if (msg.deletable) {
			msg.delete();
		}
		servers.read();
	});
	commands.setrun("log", false, function (msg) {
		if (msg.deletable) {
			msg.delete();
		}
		try {
			console.log("Prefix: " + globals.p(msg.guild.id));
			console.log("Servers: " + servers.count());
			console.log("Search In Progress: " + searchqueue.searching());
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
	var temp = [], startswithp = false;

	prefix = globals.p(message.guild.id);
	startswithp = message.content.startsWith(prefix);
	console.log(message.content);
	if (!runcheck(message, startswithp)) {
		if (startswithp) {
			console.log(msg.author.username + " tried " + com);
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
			if (hasperms(msg, com)) {
				perms = globals.getperms(message.author.id, message.guild.id);
				if (commands.reqinput(com)) {
					for (var i = 0; i < sections.length; i++) {
						if (sections[i] === "" || sections[i] === null || sections[i] === undefined) {
							sections.splice(i, 1);
							i--;
						}
					}
					try {
						if (com === 'help') {
							if (sections.length == 0) {
								content = "";
							} else {
								content = sections.join(" ")
							}
							commands[com].run(message, perms, prefix, content);
						} else if (com === 'test') {
							commands[com].run(message, content.substring(content.search("\n") + 2));
						} else {
							commands[com].run(message, sections.join(" "));
						}
					} catch (e) {
						console.log(e.message);
						if (e.name === 'invalid usage') {
							message.reply("correct usage is `" + prefix + commands.getusage(com) + "`");
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
							message.reply("correct usage is `" + prefix + commands.getusage(com) + "`");
						}  else {
							console.log("Error running: " + com);
							console.log(e.message);
							message.reply("Invalid input, please try `" + prefix +
								"[command] <input>`, or `" + prefix + "help` to see the commands");
						}
					}
				}
			}
		} else {
			checklink(msg.content);
		}
	}
});

function runcheck (msg, startswithp) {
	var parts = [], page = 0, input = 0, obj = {};

	if (msg.content.length < 1) {
		return true;
	}
	if (searchqueue.verifychannel(msg.author.id, msg.channel.id) && !startswithp) {
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
					timer(60, msg.author.id);
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
				obj = searchqueue.getusersearch(msg.author.id);
				if (obj != null) {
					try {
						obj.msg.delete()
					} catch (e) {}
					timer(60, msg.author.id);
					dispserver(msg, obj.res[(obj.page * obj.lim) + input]);
				}
			}
			return true;
		}
	} else {
		if (!globals.verifychannel(msg.channel.id)) {
			if (globals.getperms(msg.author.id, msg.guild.id) <= 0) {
				return true;
			}
		}
	}
	return false;
};

function hasperms(msg, com) {
	var perms = globals.getperms(message.author.id, message.guild.id);
	if (perms == 0) {
		if (hasflag(msg, 'MANAGE_GUILD') || hasflag(msg, 'MANAGE_ROLES')) {
			globals.increaseperms(config.owner, msg.author.id, msg.guild.id, 2);
		} else if (hasflag(msg, 'MANAGE_MESSAGES') || hasflag(msg, 'MANAGE_CHANNELS')) {
			globals.increaseperms(config.owner, msg.author.id, msg.guild.id, 1);
		}
	}
	if (hasflag(msg, commands.getflag(com))) {
		if (perms >= commands.getperms(com)) {
			return true;
		} else {
			if (msg.deletable) {
				msg.delete();
			}
			msg.reply("Missing Perm Level: " + commands.getperms(com));
		}
	} else {
		if (commands.getflag(com) != null) {
			if (msg.deletable) {
				msg.delete();
			}
			msg.reply("Missing Flag: " + commands.getflag(com));
		}
	}
	return false;
};

function hasflag(msg, flag = "SEND_MESSAGES") {
	var flags = msg.member.permissions.FlAGS;

	try {
		return flags[flag]
	} catch (e) {
		console.log(e.message);
		return false;
	}
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
		"fields" : [],
		"footer" : {
			"text" : "ID: " + server.id
		}
	};
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
	if (server.link !== "") {
		bot.fetchlink(server.link).then((invite) => {
			if (server.name != invite.guild.name) {
				servers.updateserver(invite.guild.id, 'name', invite.guild.name);
				embedobj.title = invite.guild.name + "(Updated Name)";
			}
			msg.channel.send({embed: embedobj}).then((msg) => {
				searchqueue.updateuser(user, msg);
				msgtimer(60, msg);
			});
		}).catch(e => {
			embedobj.description = "Dead Invite Link";
			searchqueue.deadlistserver(index);
			servers.deadlistserver(index);
		});
	} else {
		embedobj.description = "Request Invite";
		msg.channel.send({embed: embedobj}).then((msg) => {
			searchqueue.updateuser(user, msg);
			msgtimer(60, msg);
		});
	}
};

function disppage (msg, page) {
	var lim = 10, user = msg.author.id, obj = searchqueue.getusersearch(user);
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
		if (obj.type === 'name') {
			server = servers.server(obs.res[i]);
			embedobj.fields.push({
				"name" : i + " - " + server.name,
				"value" : "ID: " + server.id,
				"inline" : false
			});
		} else if (obj.type === 'emote') {
			server = servers.server(obs.res[i].index);
			embedobj.fields.push({
				"name" : i + " - " + server.name,
				"value" : "Global Matches: " + obj.res[i].managed + 
				"\nLocal Matches: " + obj.res[i].unmanaged,
				"inline" : false
			});
		} else {
			throw {
				"name" : "invalid type",
				"message" : "search type not recognised"
			}
		}
	}
	msg.channel.send({embed: embedobj}).then((msg) => {
		searchqueue.updateuser(user, msg, true, page, lim);
	});
};

function readobj (obj) {
	var server = {}, found = 0;

	server = {
		"id" : "",
		"name" : "",
		"link" : "",
		"icon" : "",
		"emotes" : {
			"managed" : [{
				"id" : "",
				"name" : ""
			}],
			"unmanaged" : [{
				"id" : "",
				"name" : ""
			}]
		}
	}
	for (var name in obj) {
		if (typeof(obj[name]) != 'array' && typeof(obj[name]) != 'object') {
			for (var prop in server) {
				if (name === prop) {
					server[prop] = obj[prop];
				}
			}
		} else {
			if (name === 'managed' || name === 'unmanaged') {
				if (typeof(obj[name]) === 'array') {
					server.emotes[name] = obj[name];
					found++;
				} else {
					throw {
						"name" : "Invalid JSON",
						"message" : name + " Is not an array"
					}
				}
			} else {
				if (typeof(obj[name]) === 'object' || typeof(obj[name]) === 'array') {
					found = nestedreadobj(server, obj[name]) + found;
				}
			}
		}
	}
	if (found < 2) {
		throw {
			"name" : "Missing Emote Array",
			"message" : "Could not find managed or unmanaged emote array"
		}
	}
	servers.addserver(server);

	function nestedreadobj (server, obj) {
		var found = 0;
		for (var name in obj) {
			if (name === 'managed' || name === 'unmanaged') {
				if (typeof(obj[name]) === 'array') {
					server.emotes[name] = obj[name];
					found++;
				} else {
					throw {
						"name" : "Invalid JSON",
						"message" : name + " Is not an array"
					}
				}
			} else {
				if (typeof(obj[name]) === 'object' || typeof(obj[name]) === 'array') {
					found = nestedreadobj(server, obj[name]) + found;
				}
			}
		}
		return found;
	};
};

function getuser(msg, input) {
	var mentions = Array.from(msg.mentions.members);
	var members = Array.from(msg.guild.members);
	var bestmatch = input.length + 1, bestmatchi = -1, temp = 0;

	if (mentions.length > 0) {
		return mentions[0].id;
	} else if (mentions.length > 1) {
		throw {
			"name" : "invalid usage",
			"mention" : "too many mentions"
		};
	} else {
		for (var i = 0; i < members.length; i++) {
			if (input == members[i].id) {
				return members[i].id;
			} else if (input === members[i].nickname) {
				return members[i].id;
			} else if (input === members[i].user.username) {
				return members[i].id;
			} else if (members[i].nickname.includes(input) || members[i].user.username.includes(input)) {
				temp = Math.min(members[i].nickname.length - input.length, members[i].user.username.length - input.length);
				if (temp < bestmatch) {
					bestmatchi = i;
					bestmatch = temp;
				}
			}
		}
		if (bestmatchi > -1) {
			return members[bestmatchi].id;
		} else {
			throw {
				"name" : "member not found",
				"message" : "member doesnt exist, or not in this server"
			}
		}
	}
};

function getchannel(msg, input) {
	var mentions = Array.from(msg.mentions.channels);
	var channels = Array.from(msg.guild.channels);
	var bestmatch = input.length + 1, bestmatchi = -1, temp = 0;

	if (mentions.length > 0) {
		return mentions[0].id;
	} else if (mentions.length > 1) {
		throw {
			"name" : "invalid usage",
			"mention" : "too many mentions"
		};
	} else {
		for (var i = 0; i < channels.length; i++) {
			if (input == channels[i].id) {
				return channels[i].id;
			} else if (input === channels[i].name) {
				return channels[i].id;
			} else if (channels.name.includes(input)) {
				temp = channels.name.length;
				if (temp < bestmatch) {
					bestmatchi = i;
					bestmatch = temp;
				}
			}
		}
		if (bestmatchi > -1) {
			return channels[bestmatchi].id;
		} else {
			throw {
				"name" : "channel not found",
				"message" : "channel doesnt exist"
			}
		}
	}
};

function checklink (input) {
	var patt = /(https?:\/\/)?discord\.gg\/[A-Za-z0-9]+/, link = "";
	var index = 0, link = "";

	while (patt.test(input)) {
		index = input.find(patt);
		link = patt.exec(input);
		bot.fetchlink(link).then((invite) => {
			var server = {}, deadlist = [], incomplete = [], max = 0;
			var counter = 0, found = false;

			servers.updateserver(invite.guild.id, 'name', invite.guild.name);
			try {
				server = servers.findbyid(invite.guild.id);
			} catch (e) {
				if (typeof(e) === 'number') {
					server.link = "";
					deadlist = servers.getdeadlist();
					incomplete = servers.getincomplete();
					if (deadlist === null) {
						deadlist = [];
					}; if (incomplete === null) {
						incomplete = [];
					};
					max = Math.max(deadlist.length, incomplete.length);
					while (counter < max && !found) {
						if (counter < deadlist.length) {
							if (deadlist[counter].id == invite.guild.id) {
								found = true;
								server = deadlist[counter];
							}
						}
						if (counter < incomplete.length && !found) {
							if (incomplete[counter].id == invite.guild.id) {
								found = true;
								server = incomplete[counter];
							}
						}
						counter++;
					}
				} else {
					console.log(e.message);
				}
			}
			if (!found || !patt.test(server.link)) {
				//If no existing link or server to test against
				servers.updateserver(invite.guild.id, 'link', invite.url);
			} else {
				bot.fetchlink(server.link).then((oldinv) => {
					try {
						if (oldinv.maxAge < invite.maxAge) {
							servers.updateserver(invite.guild.id, 'link', invite.url);
						} else if (oldinv.maxAge === invite.maxAge) {
							if (oldinv.maxUses <= invite.maxUses) {
								servers.updateserver(invite.guild.id, 'link', invite.url);
							} else {
								console.log(server.name + " has a link with more uses");
							}
						} else {
							console.log(server.name + " has a longer lasting link");
						}
					} catch (e) {
						console.log(e.message);
						servers.updateserver(invite.guild.id, 'link', invite.url);
					}
				}).catch(e => {
					console.log(e.message);
					servers.updateserver(invite.guild.id, 'link', invite.url);
				});
			}
		});
		index = index + link.length;
		input = input.substring(index, input.length);
	}
};

function timer (seconds, id) {
	return new Promise(function(resolve, reject) {
		var time = seconds * 1000, userid = id;
		var obj = {};

		searchqueue.timeadd(userid);
		setTimeout(function(userid) {
			if (searchqueue.timesub(userid)) {
				obj = searchqueue.getusersearch(userid);
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
				searchqueue.removeuser(userid);
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

bot.login(config.token); //Bot Token
