var searches = (function () {
	var userqueue = [], obj = {};

	obj.addusertoqueue = function (id, channel, searchresult) {
		var found = false, i = 0;
		while (!found && i < userqueue.length) {
			if (userqueue[i].id === id) {
				found = true;
				userqueue[i].res = searchresult;
				timer(60, id);
			}
			i++;
		}
		if (!found) {
			userqueue.push({
				"id" : id,
				"channel" : channel,
				"res" : searchresult,
				"timecount" : 0
			})
			timer(60, id);
		}
	};
	obj.getusersearch = function (id) {
		for (var i = 0; i < userqueue.length; i++) {
			if (userqueue[i].id === id) {
				return userqueue[i].res;
			}
		}
		return [];
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
			return false;
		}
	}
	function getuser (id) {
		for (var i = 0; i < userqueue.length; i++) {
			if (userqueue[i].id === id) {
				return i;
			}
		}
		return -1;
	};
	function timer (seconds, id) {
		return new Promise(function(resolve, reject) {
			var time = seconds * 1000, userid = id;
			var index = 0;

			index = getuser(userid);
			userqueue[index].timecount++;
			setTimeout(function(userid, index) {
				userqueue[index].timecount--;
				if (userqueue[index].timecount === 0) {
					console.log("Timer Done");
					obj.removeuser(userid);
				}
				resolve("Solved");
			});
		});
	};
	return obj;
})();