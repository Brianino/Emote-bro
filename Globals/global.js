var globalsfn = (function () {
	var globals = {}, prefix = {};
	var blacklist = [], perms = {};
	var msgstore = [], owner = 0;
	var fs = require('fs');

	readsettingsjsonfile();
	readchanneljsonfile();
	globals.newprefix = function (guild, pref) {
		if (pref != null && pref != '') {
			try {
				prefix[guild] = pref;
				console.log(guild + " set to " + pref);
				//writesettingsjsonfile();
			} catch (e) {
				console.log(e.message);
			}
			return true;
		}
		return false;
	};
	globals.p = function (server) {
		var pref = "";
		try {
			pref = prefix[server];
			if (pref === null || pref === undefined) {
				prefix[server] = '.';
				pref = '.';
				console.log("Prefix for " + server + " set to: " + pref)
				writesettingsjsonfile();
			}
		} catch (e) {
			console.log(e.message);
			pref = ".";
		}
		return pref;
	};
	globals.blacklistadd = function (channelid) {
		if (globals.verifychannel(checkchannel)) {
			blacklist.push(channelid);
			writechanneljsonfile();
		}
	};
	globals.blacklistremove = function (channelid) {
		for (var i = 0; i < blacklist.length; i++) {
			if (blacklist[i] == channelid) {
				blacklist.splice(i, 1);
				return true;
			}
		}
		return false;
	}
	globals.verifychannel = function (channelid) {
		//check channel is not blacklisted
		for (var i = 0; i < blacklist.length; i++) {
			if (blacklist[i] == channelid) {
				return false;
			}
		}
		return true;
	};
	globals.increaseperms = function (author, userid, guild, amount) {
		var level = 0, authorp = globals.getperms(author, guild);

		try {
			level = perms[userid][guild];
		} catch (e) {
			//console.log(e.message);
			level = 0;
		}
		if ((level + 1) < authorp) {
			if ((level + amount) >= authorp) {
				level = authorp - 1;
			} else {
				level = level + amount;
			}
			try {
				try {
					if (typeof(perms[userid]) != 'object') {
						perms[userid] = {};
					}
				} catch (e) {
					perms[userid] = {};
				}
				perms[userid][guild] = level;
				console.log("Updated user " + userid + " to " + level);
			} catch (e) {
				console.log(e.message);
			}
		}
		writesettingsjsonfile();
	};
	globals.removeperms = function (author, userid, guild, amount) {
		var level = 0, authorp = globals.getperms(author, guild);
		try {
			level = perms[userid][guild];
		} catch (e) {
			console.log(e.message);
			level = 0;
		}
		if (authorp > level) {
			if ((level - amount) < -1) {
				level = -1;
			} else {
				level = level - amount;
			}
			try {
				try {
					if (typeof(perms[userid]) != 'object') {
						perms[userid] = {};
					}
				} catch (e) {
					perms[userid] = {};
				}
				console.log("Updated user " + userid + " to " + level);
			} catch (e) {
				console.log(e.message);
			}
		}
		writesettingsjsonfile();
	};
	globals.getperms = function (userid, guild) {
		var res = 0;
		if (userid == owner) {
			return 10;
		}
		try {
			res = perms[userid][guild];
			console.log("perms: " + res);
			if (res == undefined) {
				res = 0;
			}
		} catch (e) {
			console.log(e.message);
			res = 0;
		}
		return res;
	};
	globals.setowner = function (userid) {
		if (owner === 0) {
			owner = userid;
		} else {
			throw 'Owner already set';
		}
	};
	function readsettingsjsonfile() {
		/*
		* READ SETTINGS FROM FILE
		*/
		var temp = {};
		fs.readFile("Files/Settings.json", "utf8", function read(err, data) {
			if(err) {
				return console.log(err.message);
			}
			console.log("Settings were loaded!");
			try {
				temp = JSON.parse(data);
				for (var name in temp.prefix) {
					prefix[name] = temp[name];
				}
				perms = temp.perms;
				if (perms == undefined) {
					perms = {};
				}
			} catch (e) {
				console.log(e.message);
			}
		});
	};
	function writesettingsjsonfile() {
		/*
		* WRITE SETTINGS TO FILE
		*/
		var temp = {
			"prefix" : prefix,
			"perms" : perms
		};
		fs.writeFile("Files/Settings.json", JSON.stringify(temp), function(err) {
			if(err) {
				return console.log(err.message);
			}
			console.log("Settings were saved!");
		});
	};
	function readchanneljsonfile() {
		/*
		* READ AND STORE CHANNEL BLACKLIST FROM A JSON FILE
		*/
		fs.readFile("Files/Channels.json", "utf8", function read(err, data) {
			if(err) {
				return console.log(err.message);
			}
			console.log("Whitelisted Guilds were loaded!");
			blacklist = JSON.parse(data);
		});
	};
	function writechanneljsonfile() {
		/*
		* WRITE CHANNEL BLACKLIST TO A JSON FILE
		*/
		fs.writeFile("Files/Channels.json", JSON.stringify(blacklist), function(err) {
			if(err) {
				return console.log(err.message);
			}
			console.log("Whitelisted Guilds were saved!");
		});
	};
	return globals;
})();

module.exports = globalsfn;
