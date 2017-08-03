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
	obj.prop = function (index, prop) {
		if (index >= servers.length && servers.length != 0) {
			index = servers.length - 1;
		} else if (servers.length == 0 || index < 0) {
			return null;
		}
		return servers[index][prop];
	};
	obj.addserver = function (server) {
		var large = 0;
		var temp = {
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
		temp.id = server.id;
		temp.name = server.name;
		if (server.id === undefined || server.name === undefined) {
			throw "Error: Missing vital server info";
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
						"id" : "",
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
						"id" : "",
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
					console.log(e.message);
				}
			}
		} else {
			servers.push(temp);
		}
	};
	obj.fillservers = function (serverlist) {
		var test = "", count = 0, empty = true, temp = {}, large = 0;
		var index = 0;

		if (typeof(serverlist[0].emotes.managed[0]) === 'object') {
			servers = serverlist;
			sorted = false;
		}
		for (var i = 0; i < serverlist.length; i++) {
			temp = {
				"id" : serverlist[i].id,
				"name" : serverlist[i].name,
				"link" : serverlist[i].link,
				"icon" : serverlist[i].icon,
				"emotes" : {
					"managed" : [],
					"unmanaged" : []
				}
			}
			large = Math.max(serverlist[i].emotes.managed.length, serverlist[i].emotes.unmanaged.length);
			for (var j = 0; j < large; j++) {
				if (j < serverlist[i].emotes.managed.length) {
					temp.emotes.managed.push({
						"id" : "",
						"name" : serverlist[i].emotes.managed[j]
					});
				}
				if (j < serverlist[i].emotes.unmanaged.length) {
					temp.emotes.unmanaged.push({
						"id" : "",
						"name" : serverlist[i].emotes.unmanaged[j]
					});
				}
			}
			if (sorted) {
				//console.log(id);
				try {
					index = obj.findbyid(temp.id);
					servers.splice(index, 0, temp);
				} catch (e) {
					if (typeof(e) === 'number') {
						if (e > -1) {
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
