var searches = (function () {
	var userqueue = [], obj = {};

	obj.addusertoqueue = function (id, channel, searchresult, type) {
		var found = false, i = 0;
		while (!found && i < userqueue.length) {
			if (userqueue[i].id === id) {
				found = true;
				userqueue[i].channel = channel;
				userqueue[i].type = type;
				userqueue[i].res = searchresult;
				userqueue[i].list = {};
				userqueue[i].msg = {};
				userqueue[i].page = 0;
			}
			i++;
		}
		if (!found) {
			userqueue.push({
				"id" : id,
				"channel" : channel,
				"type" : type,
				"res" : searchresult,
				"list" : {},
				"msg" : {},
				"page" : 0,
				"timecount" : 0
			})
		}
	};
	obj.updateuser = function (id, msg = {}, islist = false, page = 0) {
		for (var i = 0; i < userqueue.length; i++) {
			if (userqueue[i].id === id) {
				if (islist) {
					userqueue[i].list = msg;
					userqueue[i].page = page;
				} else {
					try {
						if (userqueue[i].msg.deletable) {
							userqueue[i].msg.delete();
						}
					} catch (e) {}
					userqueue[i].msg = msg;
				}
			}
		}
		throw {
			"name" : "Object Error",
			"message" : "Unable to find user in queue"
		}
	}
	obj.getusersearch = function (id) {
		for (var i = 0; i < userqueue.length; i++) {
			if (userqueue[i].id === id) {
				return {
					"res" : userqueue[i].res,
					"type" : userqueue[i].type,
					"list" : userqueue[i].list,
					"msg" : userqueue[i].msg,
					"page" : userqueue.page
				};
			}
		}
		return null;
	};
	obj.removeuser = function (id) {
		for (var i = 0; i < userqueue.length; i++) {
			if (userqueue[i].id === id) {
				userqueue.splice(i, 1);
				return true;
			}
		}
		return false;
	};
	obj.verifysearchchannel = function (id, channel) {
		for (var i = 0; i < userqueue.length; i++) {
			if (userqueue[i].id === id) {
				if (userqueue[i].channel === channel) {
					return true;
				} else {
					return false;
				}
			}
		}
		return false;
	};
	obj.searching = function () {
		if (userqueue.length > 0) {
			return true;
		} else {
			return false;h
		}
	};
	obj.deadlistserver = function (index) {
		var found = false, counter = 0;
		for (var i = 0; i < userqueue.length; i++) {
			while (counter < userqueue[i].res.length && !found) {
				if (userqueue[i].res[j] == index) {
					userqueue[i].splice(j, 1);
					found = true;
				}
				counter++;
			}
			found = false;
			counter = 0;
		}
	};
	obj.timeadd = function (id) {
		for (var i = 0; i < userqueue.length; i++) {
			if (userqueue[i].id === id) {
				userqueue[i].timecount++;
				return true;
			}
		}
		return false;
	};
	obj.timesub = function (id) {
		for (var i = 0; i < userqueue.length; i++) {
			if (userqueue[i].id === id) {
				userqueue[i].timecount--;
				if (userqueue[i].timecount == 0) {
					return true;
				} else {
					return false;
				}
			}
		}
		throw {
			"name" : "Invalid call",
			"message" : "cannot subtract timecount from non queued user"
		}
	};
	function getuser (id) {
		for (var i = 0; i < userqueue.length; i++) {
			if (userqueue[i].id === id) {
				return i;
			}
		}
		return -1;
	};
	return obj;
})();