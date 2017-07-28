var serverfunc = (function () {
	var servers = [], obj = {};
	var sorted = true;
	var fs = require('fs');

	readjsonfile();
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
			console.log("new version not saved!!!!!!!");
			servers = serverlist;
		}
		for (var i = 0; i < serverlist.length; i++) {
			if (serverlist[i].id == 214249708711837696) {
				console.log("Mum's house is here");
			}
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
		var pos = 0, min = 0, lim = servers.length - 1;
		var count = 0, e = {};

		if(lim === -1) {
			throw "first";
		}
		if (!sorted) {
			//sort
			quicksort();
			sorted = true;
		}
		//pos = Math.floor(servers.length/2);
		while (count < 30) {
			if (lim < min) {
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
			pos = Math.floor((lim + min)/2);
			if (id === 214249708711837696) {
				console.log(min + "<" + pos + "<" + lim);
				console.log(servers[pos].id === id);
				console.log(servers[pos].id > id);
				console.log(servers[pos].id < id);
			}
			if (servers[pos].id === id) {
				return pos;
			} else if (servers[pos].id < id) {
				min = pos + 1;
			} else {
				lim = pos - 1;
			}
			count++;
		}
	};
	obj.write = writejsonfile;
	function quicksort (min = 0, max = (servers.length - 1)) {
		var pointer = min, temp = {};

		if ((max - min) < 1) {
			return 1;
		}
		for (var i = min + 1; i <= max; i++) {
			if (servers[pointer].id > servers[i].id) {
				temp = servers[i];
				servers[i] = servers[pointer];
				servers[pointer] = temp;
				pointer = i;
			}
		}
		if ((pointer - min) >= 2) {
			quicksort(min, pointer - 1);
		}
		if ((max - pointer) >= 2) {
			quicksort(pointer + 1, max);
		}
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
	return obj;
})();

module.exports = serverfunc;