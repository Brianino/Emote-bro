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

	};
	return globals;
})();

module.exports = globalfunc;