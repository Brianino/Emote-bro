var serverfunc = (function () {
	var servers = [], obj = {};
	var deadlist = [], sorted = true;
	var fs = require('fs');

	readjsonfile();
	readdeadlistfile();
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
		var index = 0, emotearr = [], isdeadlist = false;
		var found = false, counter = 0, temp = {};
		var pattD = /(https?:\/\/)?discord\.gg\/[A-Za-z0-9]+/;
		var pattI = /https?:\/\/cdn\.discordapp\.com\/icons\/[A-Za-z0-9]+\/[A-Za-z0-9]+/;

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
			throw {
				"name" : "server not found",
				"message" : "could not find server: " + id
			};
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
			try {
				if (!isdeadlist) {
					servers[index][prop] = input;
				} else {
					deadlist[index][prop] = input;
					if (prop === 'link') {
						temp = deadlist[index];
						deadlist.splice(index, 1);
						obj.addserver(temp);
					}
				}
			} catch (e) {
				console.log(e.message);
			}
		} else if (prop === 'managed' || prop === 'unmanaged') {
			emotearr = checkemoteinput(input);
			if (!isdeadlist) {
				servers[index].emotes[prop] = emotearr;
			} else {
				deadlist[index].emotes[prop] = emotearr;
			}
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
	}
	obj.prop = function (index, prop) {
		if (index >= servers.length && servers.length != 0) {
			index = servers.length - 1;
		} else if (servers.length == 0 || index < 0) {
			return null;
		}
		return servers[index][prop];
	};
	obj.checkprop = function (prop) {
		for (var name in servers[0]) {
			if (name === prop) {
				return true;
			} else if (typeof(servers[0][prop]) === 'object' || typeof(servers[0][prop]) === 'array') {
				return nestedcheckprop(servers[0][prop]);
			}
		}
	};
	obj.addserver = function (server) {
		var large = 0, id = 0;
		var temp = {
			"id" : 0,
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
		}
		if (typeof(serverlist[i].id) === 'string') {
			id = parseInt(server.id);
		} else {
			id = server.id;
		}
		temp.id = id;
		temp.name = server.name;
		if (server.id === undefined || server.name === undefined) {
			throw {
				"name" : "Missing information"
				"message" : "missing server id or name"
			};
		}
		try {
			temp.link = server.link;
			if (server.link === undefined) {
				console.log("Link Missing");
				temp.link = "";
			}
		} catch (e) {
			console.log("Link Missing");
		}
		try {
			temp.linkreq = serverList[i].linkreq;
			if (server.linkreq === undefined) {
				if (temp.link === "") {
					temp.linkreq = false;
				} else {
					temp.linkreq = true;
				}
			}
		} catch (e) {
			if (temp.link === "") {
				temp.linkreq = false;
			} else {
				temp.linkreq = true;
			}
			console.log("Unable to determin if link is required");
		}
		try {
			temp.icon = server.icon;
			if (server.icon === undefined) {
				console.log("Icon Missing");
				temp.icon = "";
			}
		} catch (e) {
			console.log("Icon Missing");
		}
		large = Math.max(server.emotes.managed.length, server.emotes.unmanaged.length);
		for (var i = 0; i < large; i++) {
			if (i < server.emotes.managed.length) {
				try {
					temp.emotes.managed.push({
						"id" : server.emotes.managed[i].id,
						"name" : server.emotes.managed[i].name
					});
				} catch (e) {
					temp.emotes.managed.push({
						"id" : -1,
						"name" : server.emotes.managed[i]
					});
				}
			}
			if (i < obj.emotes.unmanaged.length) {
				try {
					temp.emotes.unmanaged.push({
						"id" : server.emotes.unmanaged[i].id,
						"name" : server.emotes.unmanaged[i].name
					});
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
				servers.splice(index, 0, temp);
			} catch (e) {
				if (typeof(e) === 'number') {
					if (e > 0) {
						servers.splice(e, 0, temp);
					} else {
						servers.unshift(temp);
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
		}
		for (var i = 0; i < serverlist.length; i++) {
			obj.addserver(serverlist[i]);
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
					throw pos;
				} else if (servers[pos].id > id) {
					throw pos - 1;
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
		}
	};
	obj.getdeadlist = function () {
		if (deadlist.length > 0) {
			return deadlist;
		} else {
			return null;
		}
	};
	obj.write = writejsonfile;
	obj.read = readjsonfile;
	function bublesort () {
		var swap = false, counter = 0, temp = {};

		do {
			swap = false;
			for (var i = 0; i < servers.length; i++) {
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
		var arr = input.split(" "), res = [];
		var patt = /<:[A-Za-z0-9_]{2,}:\d+>/;
		var patt2 = /:[A-Za-z0-9_]{2,}:/;

		//<:[A-Za-z0-9_]{2,}:\\d+>
		if (arr.length > 1) {
			for (var i = 0; i < arr.length; i++) {
				if (patt.test(arr[i])) {
					console.log("emote: " + arr[1].split(patt2.exec(arr[i]))[0] + " : " +
						arr[1].replace(patt, patt2.exec(arr[i])));
					res.push({
						"id" : arr[1].split(patt2.exec(arr[i]))[0],
						"name" : arr[1].replace(patt, patt2.exec(arr[i]))
					});
				} else if (patt2.test(arr[i])) {
					res.push({
						"id" : "",
						"name" : arr[i]
					});
				} else {
					throw {
						"name" : "Invalid emote",
						"message" : arr[1] + " is not a valid emote input"
					};
				}
			}
		} else {
			while (input.length > 0) {
				//replace each emote with "" untill string empty
			}
		}
		return res;
	}
	function nestedcheckprop (subserver, prop) {
		if (typeof(subserver) === 'object') {
			for (var name in subserver) {
				if (name === prop) {
					return true;
				}
			}
		} else if (typeof(subserver) === 'array') {
			return nestedcheckprop(subserver[0], prop);
		} else {
			throw {
				"name" : "Invalid Parameter",
				"message" : "Invalid parameter passed to nestedcheckprop"
			};
		}
		return false;
	};
	function writejsonfile() {
		/*
		* WRITE AND STORE SERVER DATA TO FILE
		*/
		fs.writeFile("Files/ServerList.json", JSON.stringify(servers), function(err) {
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
		fs.readFile("Files/ServerList.json", "utf8", function read(err, data) {
			if(err) {
				return console.log(err.message);
			}
			console.log("Servers loaded!");
			obj.fillservers(JSON.parse(data));
		});
	};
	function writedeadlistfile() {
		/*
		* WRITE AND STORE SERVER DATA TO FILE
		*/
		fs.writeFile("Files/DeadList.json", JSON.stringify(deadlist), function(err) {
			if(err) {
				return console.log(err.message);
			}
			console.log("Servers saved!");
		});
	};
	function readdeadlistfile() {
		/*
		* READ AND STORE SERVER DATA FROM A FILE
		*/
		fs.readFile("Files/DeadList.json", "utf8", function read(err, data) {
			if(err) {
				return console.log(err.message);
			}
			console.log("Servers loaded!");
			deadlist = JSON.parse(data);
		});
	};
	return obj;
})();

module.exports = serverfunc;
