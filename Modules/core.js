var servers = require('./.../Globals/servers.js');
var core = {}

core.count = function (msg) {
	try {
		msg.reply(servers.count());
		return true;
	} catch (e) {
		console.log(e.message);
		return false;
	}
};
core.log = function () {
	try {
		console.log("Prefix: " + servers.p());
		console.log("Servers: " + servers.count());
		console.log("Search In Progress: " + servers.searching());
	}
}