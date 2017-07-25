var config = require('./.../config.js');

var globals = (function () {
	var globals = {}, prefix = {};
	var blacklist = [];

	globals.newprefix = function (pref) {
		if (pref != null && pref != '') {
			prefix = pref;
			return true;
		}
		return false;
	};
	globals.p = function (server) {
		var pref = "";
		try {
			pref = prefix.[server];
		} catch (e) {
			prefix.[server] = '.';
			pref = '.';
		}
		return pref;
	};
	globals.blacklistadd = function (channelid) {
		if (globals.verifychannel(checkchannel)) {
			blacklist.push(channelid);
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
	return globals;
})();

module.exports = globalfunc;