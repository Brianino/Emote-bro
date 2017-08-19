const config = require('./../config.js');
const crypto = require('crypto');

var serverfunc = (function () {
	var servers = [], obj = {}, incomplete = [];
	var deadlist = [], sorted = true;
	var fs = require('fs');

	readjsonfile();
	readdeadlistfile();
	readincompletelistfile();
	obj.count = function () {
		return servers.length;
	};
	obj.server = function (index) {
		if (index >= servers.length && servers.length != 0) {
			index = servers.length - 1;
		} else if (servers.length == 0 || index < 0) {
			return null;
		}
		return servers[index];
	};
	obj.updateserver = function (id, prop, input) {
		var index = 0, emotearr = [], isdeadlist = false, newserver = false;
		var found = false, counter = 0, temp = {};
		var pattD = /(https?:\/\/)?discord\.gg\/[A-Za-z0-9]+/;
		var pattI = /https?:\/\/cdn\.discordapp\.com\/(icons|avatars)\/[A-Za-z0-9]+\/[A-Za-z0-9]+/;

		//https://cdn.discordapp.com/icons
		try {
			index = obj.findbyid(id);
			found = true;
		} catch (e) {
			if (typeof(e) === 'number') {
				while (counter < deadlist.length && !found) {
					if (deadlist[counter].id == id) {
						found = true;
						isdeadlist = true;
						index = counter;
					}
					counter++;
				}
			}
		}
		if (!found) {
			counter = 0;
			while (counter < incomplete.length && !found) {
				if (incomplete[counter].id == id) {
					found = true;
					index = counter;
				}
				counter++;
			}
			if (!found) {
				incomplete.push({
					"id" : id,
					"name" : "",
					"link" : "",
					"icon" : "",
					"linkreq" : null,
					"emotes" : {
						"managed" : [{
							"id" : 0,
							"name" : ""
						}],
						"unmanaged" : [{
							"id" : 0,
							"name" : ""
						}]
					}
				});
				index = incomplete.length - 1;
			} else {
				found = false;
			}
			newserver = true;
		}
		if (prop === 'link') {
			//check for discord.gg
			if (!pattD.test(input)) {
				throw {
					"name" : "invalid link",
					"message" : input + " is not a valid discord link"
				};
			}
		} else if (prop === 'icon') {
			//check for https
			if (!pattI.test(input)) {
				throw {
					"name" : "invalid link",
					"message" : input + " is not a valid icon link"
				};
			}
		}
		if (prop === 'name' || prop === 'link' || prop === 'icon' || prop === 'linkreq') {
			if (prop === 'linkreq') {
				if (input === 'true') {
					input = true;
				} else if (input === 'false') {
					input = false;
				} else {
					throw {
						"name" : "invalid input",
						"message" : input + " needs to be true/false for " + prop
					}
				}
			}
			try {
				if (!isdeadlist) {
					servers[index][prop] = input;
					if (!checkinfo(servers[index])) {
						incomplete.push(servers[index]);
						servers.splice(index, 1);
						writeincompletelistfile();
					} else if (servers[index].linkreq && servers[index].link.length === 0) {
						obj.deadlistserver(index);
					}
					writejsonfile();
				} else if (!newserver) {
					deadlist[index][prop] = input;
					if (!checkinfo(deadlist[index])) {
						incomplete.push(deadlist[index]);
						deadlist.splice(index, 1);
						writeincompletelistfile();
					} else if (prop === 'link') {
						temp = deadlist[index];
						deadlist.splice(index, 1);
						obj.addserver(temp);
						writejsonfile();
					} else if (!deadlist[index].linkreq) {
						temp = deadlist[index];
						deadlist.splice(index, 1);
						obj.addserver(temp);
						writejsonfile();
					}
					writedeadlistfile();
				} else {
					incomplete[index][prop] = input;
					checkincomplete();
				}
			} catch (e) {
				console.log(e.message);
			};
		} else if (prop === 'managed' || prop === 'unmanaged') {
			emotearr = checkemoteinput(input);
			try {
				if (!isdeadlist) {
					servers[index].emotes[prop] = emotearr;
					if (!checkinfo(servers[index])) {
						incomplete.push(servers[index]);
						servers.splice(index, 1);
						writeincompletelistfile();
					}
					writejsonfile();
				} else if (!newserver) {
					deadlist[index].emotes[prop] = emotearr;
					if (!checkinfo(deadlist[index])) {
						incomplete.push(deadlist[index]);
						deadlist.splice(index, 1);
						writeincompletelistfile();
					}
					writedeadlistfile();
				} else {
					incomplete[index].emotes[prop] = emotearr;
					checkincomplete();
				}
			} catch (e) {
				console.log(e.message);
			};
		} else {
			throw {
				"name" : "invalid server property",
				"message" : prop + " is not an accessable property"
			};
		}
	};
	obj.getprops = function () {
		return [{
			"prop" : "name",
			"type" : "text"
		}, {
			"prop" : "link",
			"type" : "discord.gg link"
		}, {
			"prop" : "icon",
			"type" : "http link"
		}, {
			"prop" : "linkreq",
			"type" : "true/false"
		}, {
			"prop" : "managed",
			"type" : "global emotes (separate with space)"
		}, {
			"prop" : "unmanaged",
			"type" : "local emotes (separate with space)"
		}]
	};
	obj.checkprop = function (prop) {
		var temp = obj.getprops();
		for (var i = 0; i < temp.length; i++) {
			if (prop === temp[i].prop) {
				return true;
			}
		}
		return false;
	};
	obj.prop = function (index, prop) {
		if (index >= servers.length && servers.length != 0) {
			index = servers.length - 1;
		} else if (servers.length == 0 || index < 0) {
			return null;
		}
		try {
			return servers[index][prop];
		} catch (e) {
			console.log(index + ", " + prop + ": " + e.message);
		}
	};
	obj.addserver = function (server) {
		var large = 0, id = 0;
		var pattD = /(https?:\/\/)?discord\.gg\/[A-Za-z0-9]+/;
		var pattI = /https?:\/\/cdn\.discordapp\.com\/(icons|avatars)\/[A-Za-z0-9]+\/[A-Za-z0-9]+/;
		var temp = {
			"id" : 0,
			"name" : "",
			"link" : "",
			"icon" : "",
			"linkreq" : null,
			"emotes" : {
				"managed" : [],
				"unmanaged" : []
			}
		}
		if (typeof(server.id) === 'string') {
			id = parseInt(server.id);
		} else {
			id = server.id;
		}
		temp.id = id;
		temp.name = server.name;
		if (server.id === undefined || server.name === undefined) {
			throw {
				"name" : "Missing information",
				"message" : "missing server id or name"
			};
		}
		try {
			temp.link = server.link;
			if (!pattD.test(temp.link)) {
				console.log(temp.name + " link: " + server.link);
				temp.link = "";
			}
		} catch (e) {
			console.log(temp.name + " link missing");
		}
		try {
			temp.linkreq = server[i].linkreq;
			if (temp.linkreq === undefined) {
				if (server.link === "") {
					temp.linkreq = false;
				} else {
					temp.linkreq = true;
				}
			}
		} catch (e) {
			if (server.link === "") {
				temp.linkreq = false;
			} else {
				temp.linkreq = true;
			}
			//console.log("Unable to determin if link is required");
		}
		try {
			temp.icon = server.icon;
			if (!pattI.test(temp.icon)) {
				console.log(temp.name + " icon: " + server.icon);
				temp.icon = "";
			}
		} catch (e) {
			console.log(temp.name + " icon missing");
		}
		large = Math.max(server.emotes.managed.length, server.emotes.unmanaged.length);
		for (var i = 0; i < large; i++) {
			if (i < server.emotes.managed.length) {
				try {
					temp.emotes.managed.push({
						"id" : server.emotes.managed[i].id,
						"name" : server.emotes.managed[i].name
					});
					if (temp.emotes.managed[temp.emotes.managed.length - 1].name === undefined) {
						temp.emotes.managed[temp.emotes.managed.length - 1].id = -1;
						temp.emotes.managed[temp.emotes.managed.length - 1].name = server.emotes.managed[i];
					}
				} catch (e) {
					temp.emotes.managed.push({
						"id" : -1,
						"name" : server.emotes.managed[i]
					});
				}
			}
			if (i < server.emotes.unmanaged.length) {
				try {
					temp.emotes.unmanaged.push({
						"id" : server.emotes.unmanaged[i].id,
						"name" : server.emotes.unmanaged[i].name
					});
					if (temp.emotes.unmanaged[temp.emotes.unmanaged.length - 1].name === undefined) {
						temp.emotes.unmanaged[temp.emotes.unmanaged.length - 1].id = -1;
						temp.emotes.unmanaged[temp.emotes.unmanaged.length - 1].name = server.emotes.unmanaged[i];
					}
				} catch (e) {
					temp.emotes.unmanaged.push({
						"id" : -1,
						"name" : server.emotes.unmanaged[i]
					});
				}
			}
		}
		if (sorted) {
			//Enter right place
			try {
				index = obj.findbyid(temp.id);
				servers[index] = temp;
			} catch (e) {
				if (typeof(e) === 'number') {
					if (e < servers.length) {
						servers.splice(e, 0, temp);
					} else {
						servers.push(temp);
					}
				} else {
					if (e === 'first') {
						servers.push(temp);
					} else {
						console.log(e.message);
					}
				}
			}
		} else {
			servers.push(temp);
		}
	};
	obj.fillservers = function (serverlist) {
		if (typeof(serverlist[0].emotes.managed[0]) === 'object') {
			servers = serverlist;
			sorted = false;
		} else {
			for (var i = 0; i < serverlist.length; i++) {
				try {
					obj.addserver(serverlist[i]);
				} catch (e) {
					console.log("error adding server " + serverlist[i].name);
					console.log("error: " + e.message);
				}
			}
		}
	};
	obj.findbyid = function (id) {
		var pos = 0, min = 0, max = servers.length - 1;
		var count = 0, e = {};

		if(max === -1) {
			throw "first";
		}
		if (!sorted) {
			//sort
			bublesort();
			sorted = true;
		}
		while (count < 30) {
			if (max < min) {
				if (servers[pos].id < id) {
					throw pos + 1;
				} else if (servers[pos].id > id) {
					throw pos;
				} else {
					e = {
						"name" : "Error finding by id",
						"message" : "Error finding: " + id
					}
					throw e;
				}
			}
			pos = Math.floor((max + min)/2);
			if (servers[pos].id == id) {
				return pos;
			} else if (servers[pos].id < id) {
				min = pos + 1;
			} else {
				max = pos - 1;
			}
			count++;
		}
	};
	obj.deadlistserver = function (index) {
		if (index >= servers.length || index < 0) {
			throw {
				"name" : "Invalid index",
				"message" : "Index does not exist"
			}
		} else {
			deadlist.push(servers[index]);
			servers.splice(index, 1);
			writedeadlistfile();
			writejsonfile();
		}
	};
	obj.getdeadlist = function () {
		if (deadlist.length > 0) {
			return deadlist;
		} else {
			return null;
		}
	};
	obj.getincomplete = function () {
		if (incomplete.length > 0) {
			return incomplete;
		} else {
			return null;
		}
	};
	obj.getincompleteprops = function () {
		var res = [], maxemotes = 0, useid = false;

		for (var i = 0; i < incomplete.length; i++) {
			maxemotes = Math.max(incomplete[i].emotes.managed.length, incomplete[i].emotes.unmanaged.length);
			if (maxemotes === 0 && incomplete[i].name === "") {
				res.push({
					"identifier" : incomplete[i].id,
					"missing" : "server name and emotes"
				});
			} else if (incomplete[i].name === "") {
				res.push({
					"identifier" : incomplete[i].id,
					"missing" : "server name"
				});
			} else if (maxemotes === 0) {
				res.push({
					"identifier" : incomplete[i].name,
					"missing" : "server emotes"
				});
			} else {
				throw {
					"name" : "Server not moved from incomplete",
					"message" : "server " + incomplete.name + " should not be in incomplete"
				};
			}
		}
		return res;
	}
	obj.write = writejsonfile;
	obj.read = readjsonfile;
	function bublesort () {
		var swap = false, counter = 0, temp = {};

		do {
			swap = false;
			for (var i = 0; i < servers.length - 1 - counter; i++) {
				if (servers[i].id > servers[i + 1].id) {
					temp = servers[i];
					servers[i] = servers[i + 1];
					servers[i + 1] = temp;
					swap = true;
				}
			}
			counter++;
		} while (swap && counter < servers.length);
	};
	function checkemoteinput (input) {
		var arr = input.split(" "), res = [], temp = "";
		var patt = /<:[A-Za-z0-9_]{2,}:\d+>/;
		var patt2 = /:[A-Za-z0-9_]{2,}:/;
		var patt3 = /:\d+>/;
		var emoteleft = true;

		//<:[A-Za-z0-9_]{2,}:\\d+>
		if (arr.length > 1) {
			for (var i = 0; i < arr.length; i++) {
				console.log(arr[i]);
				if (patt.test(arr[i])) {
					console.log("emote: " + patt2.exec(arr[0]) + " : " + patt3.exec(arr[0]));
					temp = String(patt3.exec(arr[i]));
					res.push({
						"id" : temp.substring(1, temp.length - 1),
						"name" : patt2.exec(arr[i])
					});
				} else if (patt2.test(arr[i])) {
					console.log("emote: " + arr[i]);
					res.push({
						"id" : -1,
						"name" : arr[i]
					});
				}
			}
		} else {
			while (input.length > 0 && emoteleft) {
				//replace each emote with "" untill string empty
				if (patt.test(arr[0])) {
					console.log("emote: " + patt2.exec(arr[0]) + " : " + patt3.exec(arr[0]));
					emoteleft = true;
					temp = String(patt3.exec(arr[0]));
					console.log("Type: " + typeof(temp));
					res.push({
						"id" : temp.substring(1, temp.length - 1),
						"name" : patt2.exec(arr[0])
					});
					arr[0] = arr[0].substring(patt.exec(arr[0]), arr[0].length);
				} else if (patt2.test(arr[0])) {
					console.log("emote: " + patt2.exec(arr[0]));
					emoteleft = true;
					res.push({
						"id" : -1,
						"name" : patt2.exec(arr[0])
					});
					arr[0] = arr[0].substring(patt2.exec(arr[0]), arr[0].length);
				} else {
					emoteleft = false;
				}
			}
		}
		return res;
	}
	function checkincomplete() {
		var missininfo = false, maxemotes = 0, temp = {};

		for (var i = 0; i < incomplete.length; i++) {
			if (checkinfo(incomplete[i])) {
				if (incomplete[i].link.length > 0 || !incomplete[i].linkreq) {
					temp = incomplete[i];
					incomplete.splice(i, 1);
					obj.addserver(temp);
					writejsonfile();
				} else {
					temp = incomplete[i];
					incomplete.splice(i, 1);
					deadlist.push(temp);
					writedeadlistfile();
				}
				writeincompletelistfile();
			}
		}
	};
	function checkinfo(server) {
		var missininfo = false, maxemotes = 0, temp = "";

		maxemotes = Math.max(server.emotes.managed.length, server.emotes.unmanaged.length);
		temp = server.name;
		if (temp.length === 0) {
			missininfo = true;
		} else if (maxemotes === 0) {
			missininfo = true;
		}
		if (!missininfo) {
			return true;
		} else {
			return false;
		}
	};
	function writejsonfile() {
		/*
		* WRITE AND STORE SERVER DATA TO FILE
		*/
		const cipher = crypto.createCipher('aes256', config.password);
		let ciphertext = cipher.update(JSON.stringify(servers), 'utf8', 'hex');
		ciphertext += cipher.final('hex')
		fs.writeFile("Files/ServerList.json", ciphertext, function(err) {
			if(err) {
				return console.log(err.message);
			}
			console.log("Servers saved!");
		});
	};
	function readjsonfile() {
		/*
		* READ AND STORE SERVER DATA FROM A FILE
		*/
		const decipher = crypto.createDecipher('aes256', config.password);
		var temp = {};
		fs.readFile("Files/ServerList.json", "utf8", function read(err, data) {
			if(err) {
				return console.log(err.message);
			}
			console.log("Servers loaded!");
			try {
				temp = JSON.parse(data);
			} catch (e) {
				let plaintext = decipher.update(data, 'hex', 'utf8');
				plaintext += decipher.final('utf8');
				temp = JSON.parse(plaintext);
			};
			obj.fillservers(temp);
		});
	};
	function writedeadlistfile() {
		/*
		* WRITE AND STORE DEAD SERVER DATA TO FILE
		*/
		const cipher = crypto.createCipher('aes256', config.password);
		let ciphertext = cipher.update(JSON.stringify(deadlist), 'utf8', 'hex');
		ciphertext += cipher.final('hex')
		fs.writeFile("Files/DeadList.json", ciphertext, function(err) {
			if(err) {
				return console.log(err.message);
			}
			console.log("Dead Servers saved!");
		});
	};
	function readdeadlistfile() {
		/*
		* READ AND STORE DEAD SERVER DATA FROM A FILE
		*/
		const decipher = crypto.createDecipher('aes256', config.password);
		var temp = {};
		fs.readFile("Files/DeadList.json", "utf8", function read(err, data) {
			if(err) {
				return console.log(err.message);
			}
			console.log("Dead servers loaded!");
			try {
				temp = JSON.parse(data);
			} catch (e) {
				let plaintext = decipher.update(data, 'hex', 'utf8');
				plaintext += decipher.final('utf8');
				temp = JSON.parse(plaintext);
			};
			deadlist = temp;
		});
	};
	function writeincompletelistfile() {
		/*
		* WRITE AND STORE INCOMPLETE SERVER DATA TO FILE
		*/
		const cipher = crypto.createCipher('aes256', config.password);
		let ciphertext = cipher.update(JSON.stringify(deadlist), 'utf8', 'hex');
		ciphertext += cipher.final('hex')
		fs.writeFile("Files/Incompletelist.json", ciphertext, function(err) {
			if(err) {
				return console.log(err.message);
			}
			console.log("Incomplete Servers saved!");
		});
	};
	function readincompletelistfile() {
		/*
		* READ AND STORE INCOMPLETE SERVER DATA FROM A FILE
		*/
		const decipher = crypto.createDecipher('aes256', config.password);
		var temp = {};
		fs.readFile("Files/Incompletelist.json", "utf8", function read(err, data) {
			if(err) {
				return console.log(err.message);
			}
			console.log("Incomplete servers loaded!");
			try {
				temp = JSON.parse(data);
			} catch (e) {
				let plaintext = decipher.update(data, 'hex', 'utf8');
				plaintext += decipher.final('utf8');
				temp = JSON.parse(plaintext);
			};
			incomplete = temp;
		});
	};
	return obj;
})();

module.exports = serverfunc;
