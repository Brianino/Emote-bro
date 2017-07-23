const Discord = require('discord.js');
const config = require('./config.js');
const globals = require('./global.js');

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
	readsettingsjsonfile();
	readuserjsonfile();
	readgcljsonfile();
	readjsonfile();
	console.log("Ready");
});

bot.on('message', defaultMessageEvent);

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

function altMessageEvent(message) {
	if (message.content.length > 0) {
		if (message.author.id == aId && message.channel.id == cId) {
			if (parseInt(message.content) > 0 && parseInt(message.content) <= arrF.length) {
				disp(message, parseInt(message.content) - 1, true);
			} else if (tolc(message.content) === "all") {
				var limit = 10;
				if (arrF.length <= limit) {
					limit = arrF.length;
				}
				for (var i = 0; i < limit; i++) {
					disp(message, i, true);
				}
			} else if (tolc(message.content) === "all global" && shg) {
				var limit = 10, counter = 0;
				if (arrF.length <= limit) {
					limit = arrF.length;
				}
				for (var i = 0; i < arrF.length && counter <= limit; i++) {
					if (arrF[i].hg) {
						disp(message, i, true);
						counter++;
					}
				}
				if (counter == 0) {
					message.reply("No Global Found");
				}
			} else {
				message.reply("Invalid Input");
			}
			if (message.deletable) {
				message.delete();
			}
			if (msgdelete.deletable) {
				msgdelete.delete();
			}
			arrF = [];
			aId = "";
			cId = "";
			shg = false;
			if (!dfm) {
				bot.removeListener('message', altMessageEvent);
				bot.on('message', defaultMessageEvent);
				dfm = true;
			}
		} else {
			//message.reply("Wait, bot in use");
			//defaultMessageEvent(message);
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
		console.log("The file was saved!");
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
		console.log("Data loaded!");
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
		console.log("Users were loaded!");
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
		console.log("Users were saved!");
	});
}

function readgcljsonfile() {
	/*
	* READ AND STORE VALID GUILDS AND CHANNELS FROM A TXT FILE
	*/
	fs.readFile("Files/Guilds.json", "utf8", function read(err, data) {
		if(err) {
			return console.log(err.message);
		}
		console.log("Whitelisted Guilds were loaded!");
		gcl = JSON.parse(data);
	});
}

function writegcljsonfile() {
	/*
	* WRITE VALID GUILDS AND CHANNELS TO A TXT FILE
	*/
	fs.writeFile("Files/Guilds.json", JSON.stringify(gcl), function(err) {
		if(err) {
			return console.log(err.message);
		}
		console.log("Whitelisted Guilds were saved!");
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
		prefix = JSON.parse(data).prefix;
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
	fs.writeFile("Settings.json", JSON.stringify(temp), function(err) {
		if(err) {
			return console.log(err.message);
		}
		console.log("Settings were saved!");
	});
}

function searchByServer(msg, input, isId) {
	var found = false;

	for (var i = 0; i < arr.length; i++) {
		if (isId) {
			if (arr[i].id == input) {
				found = true;
				arrF.push(arr[i]);
			}
		} else {
			if (strMatchStrict(arr[i].name, input)) {
				found = true;
				arrF.push(arr[i]);
			}
		}
	}
	//console.log(input + " " + found + ": " + arrF.length);
	if (found) {
		if (arrF.length == 1) {
			disp(msg, 0, true);
			arrF = [];
		} else if (arrF.length > 1) {
			aId = msg.author.id;
			cId = msg.channel.id;
			msg.reply("Found Servers: " + arrF.length + "\n Enter `[number]` or `all` (Limit for all 10)").then((rmsg) => {
				msgdelete = rmsg;
			});
			if (dfm) {
				bot.removeListener('message', defaultMessageEvent);
				dfm = false;
				bot.on('message', altMessageEvent);
				timer(30).then(function() {
					if (timecount == 0) {
						if(!dfm) {
							bot.removeListener('message', altMessageEvent);
							bot.on('message', defaultMessageEvent);
							dfm = true;
						}
						arrF = [];
						aId = "";
						cId = "";
					}
				});
			}
		}
	} else {
		msg.reply("Could Not Find Server");
	}
}

function searchByEmote(msg, input, all = false, aglobal = false) {
	var found = false, hg = false;
	var temp = {}, emotes = [];
	var patt = /<:[A-Za-z0-9_]{2,}:\d+>/

	//<:[A-Za-z0-9_]{2,}:\\d+>
	if (patt.test(input)) {
		console.log("Is Emote")
		input = input.replace(patt, /:[A-Za-z0-9_]{2,}:/.exec(input));
		console.log("New Str: " + input)
	}
	for (var i = 0; i < arr.length; i++) {
		for (var j = 0; j < arr[i].emotes.managed.length || j < arr[i].emotes.unmanaged.length; j++) {
			if (j < arr[i].emotes.managed.length) {
				if (strMatchStrict(arr[i].emotes.managed[j], input)) {
					found = true;
					hg = true;
					emotes.push({
						"name" : arr[i].emotes.managed[j],
						"global" : true
					});
				}
			}
			if (j < arr[i].emotes.unmanaged.length) {
				if (strMatchStrict(arr[i].emotes.unmanaged[j], input)) {
					found = true;
					emotes.push({
						"name" : arr[i].emotes.unmanaged[j],
						"global" : false
					});
				}
			}
		}
		if (found) {
			temp = {
				"id" : arr[i].id,
				"name" : arr[i].name,
				"link" : arr[i].link,
				"icon" : arr[i].icon,
				"emotes" : emotes,
				"hg" : hg
			};
			arrF.push(temp);
			emotes = [];
			temp = {};
			found = false;
		}
		hg = false;
	}
	//console.log(input + " " + found + ": " + arrF.length);
	if (arrF.length > 0) {
		if (arrF.length == 1) {
			shg = true;
			disp(msg, 0, true);
			arrF = [];
			shg = false;
		} else if (arrF.length > 1) {
			if (!all && !aglobal) {
				aId = msg.author.id;
				cId = msg.channel.id;
				shg = true;
				msg.reply("Found Servers: " + arrF.length + "\n Enter `[number]` or `all` or `all global` (Limit for all 10)").then((rmsg) => {
					msgdelete = rmsg;
				});
				bot.removeListener('message', defaultMessageEvent);
				dfm = false;
				bot.on('message', altMessageEvent);
				timer(30).then(function() {
					if (timecount == 0) {
						if(!dfm) {
							bot.removeListener('message', altMessageEvent);
							bot.on('message', defaultMessageEvent);
							dfm = true;
						}
						arrF = [];
						aId = "";
						cId = "";
						shg = false;
					}
				});
			} else if (all && !aglobal) {
				var limit = 10;
				if (arrF.length <= limit) {
					limit = arrF.length;
				}
				shg = true;
				for (var i = 0; i < limit; i++) {
					disp(msg, i, true);
				}
				shg = false;
			} else {
				var limit = 10, counter = 0;
				if (arrF.length <= limit) {
					limit = arrF.length;
				}
				shg = true;
				for (var i = 0; i < arrF.length && counter <= limit; i++) {
					if (arrF[i].hg) {
						disp(msg, i, true);
						counter++;
					}
				}
				shg = false;
				if (counter == 0) {
					msg.reply("No Global Found");
				}
			}
		}
	} else {
		msg.reply("Could Not Find Server");
	}
}

function disp(message, index, altarr = false) {
	var id = "", name = "", link = "", icon = "";
	var embedobj = "", temp = "", canDisp = false

	if (!altarr && arr.length > 0) {
		id = arr[index].id;
		name = arr[index].name;
		link = arr[index].link;
		icon = arr[index].icon;
		canDisp = true;
	}
	if (altarr && arrF.length > 0) {
		id = arrF[index].id;
		name = arrF[index].name;
		link = arrF[index].link;
		icon = arrF[index].icon;
		canDisp = true;
	}
	if (canDisp) {
		if (link == '') {
			link = "Request Link";
		}
		embedobj = {
			"title" : name,
			"description" : link,
			"color" : 0x0000FF,
			"thumbnail" : {
				"url" : icon,
				"height" : 50,
				"width" : 50
			},
			"fields" : []
		}
		if (!shg) {
			message.channel.send({embed: embedobj});
		} else {
			if (arrF[index].emotes.length < 6) {
				for (var i = 0; i < arrF[index].emotes.length; i++) {
					if (arrF[index].emotes[i].global) {
						temp = "Global";
					} else {
						temp = "Local";
					}
					embedobj.fields.push({
						"name" : arrF[index].emotes[i].name,
						"value" : temp,
						"inline" : true
					});
				}
			} else {
				if (arrF[index].hg) {
					temp = "Has Global Match";
				} else {
					temp = "No Global Match";
				}
				embedobj.fields.push({
					"name" : "Over 6 Matches",
					"value" : temp
				});
			}
			message.channel.send({embed: embedobj});
		}
	} else {
		message.channel.send("No Servers Stored");
	}
}

function strMatch(s1, s2) {
	/*
	* STRING MATCHING
	* CHECKS IF THE SHORTER STRING APPEARS IN THE LONGER STRING
	*/
	var short = "", long = "", len = 0;

	if (s1.length >= s2.length) {
		short = tolc(s2);
		long = tolc(s1);
	} else {
		short = tolc(s1);
		long = tolc(s2);
	}
	if (short.length > 0) {
		len = long.length - short.length + 1;
		for (var i = 0; i < len; i++) {
			if (short == long.substring(i, i + short.length)) {
				return true;
			}
		}
	}
	return false;
}

function strMatchStrict(s1, s2) {
	/*
	* STRICT STRING MATCHING
	* CHECKS IF S2 IS PRESENT IN S1
	*/
	var long = tolc(s1);
	var short = tolc(s2);
	var len = 0;

	if (s1.length < s2.length) {
		return false;
	}
	if (short.length > 0) {
		len = long.length - short.length + 1;
		for (var i = 0; i < len; i++) {
			if (short == long.substring(i, i + short.length)) {
				return true;
			}
		}
	}
	return false;
}

function tolc(str) {
	var temp = 0;
	for (var i = 0; i < str.length; i++) {
		if (str[i] >= 'A' && str[i] <= 'Z') {
			temp = (str[i].charCodeAt(0) - 65) + 97;
			str = str.substring(0, i) + String.fromCharCode(temp) + str.substring(i + 1, str.length);
		}
	}
	return str;
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

function logGlobals() {
	console.log("Servers: " + arr.length);
	console.log("Found Array: " + arrF.length);
	console.log("Default Event: " + dfm);
	console.log("Stored User ID: " + aId);
	console.log("Stored Channel ID: " + cId);
	console.log("Stored Guild ID: " + gId);
	console.log("Guild ID Not Empty: " + (gId != ''));
}

bot.login(config.token); //Bot Token