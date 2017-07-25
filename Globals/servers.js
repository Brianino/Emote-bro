var serverfunc = (function () {
	var servers = [], obj = {};
	var sorted = false;

	obj.count = function () {
		return servers.length;
	}
	obj.server = function (index) {
		if (index >= servers.length && servers.length != 0) {
			index = servers.length - 1;
		} else if (servers.length == 0 || index < 0) {
			return null;
		}
		return servers[index];
	};
	obj.addserver = function (obj) {
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
		temp.id = obj.id;
		temp.name = obj.name;
		try {
			temp.link = obj.link;
		} catch (e) {
			console.log("Link Missing");
		}
		try {
			temp.icon = obj.icon;
		} catch (e) {
			console.log("Icon Missing");
		}
		large = Math.max(obj.emotes.managed.length, obj.emotes.unmanaged.length);
		for (var i = 0; i < large; i++) {
			if (i > obj.emotes.managed.length) {
				try {
					temp.emotes.managed.push({
						"id" : obj.emotes.managed[i].id,
						"name" : obj.emotes.managed[i].name
					});
				} catch (e) {
					temp.emotes.managed.push({
						"id" : "",
						"name" : obj.emotes.managed[i]
					});
				}
			}
			if (i > obj.emotes.unmanaged.length) {
				try {
					temp.emotes.unmanaged.push({
						"id" : obj.emotes.unmanaged[i].id,
						"name" : obj.emotes.unmanaged[i].name
					});
				} catch (e) {
					temp.emotes.unmanaged.push({
						"id" : "",
						"name" : obj.emotes.unmanaged[i]
					});
				}
			}
		}
		if (sorted) {
			//Enter right place
			try {
				index = obj.getserver(temp.id);
				servers.splice(index, 0, temp);
			} catch (e) {
				if (typeof(e) === 'number') {
					servers.splice(e, 0, temp);
				} else {
					console.log(e.message);
				}
			}
		} else {
			servers.push(temp);
		}
	};
	obj.fillservers = function (obj) {
		var test = "", count = 0, empty = true, temp = {}, large = 0;
		var temparr = [], temparr2 = [], index = 0;
		try {
			while (i < obj.length && empty) {
				if (obj[count].emotes.managed.length > 0) {
					test = obj[count].emotes.managed[0].id;
					empty = false;
				} else if (obj[count].emotes.unmanaged.length > 0) {
					test = obj[count].emotes.unmanaged[0].id;
					empty = false;
				}
				count++;
			}
			servers = obj;
		} catch (e) {
			for (var i = 0; i < obj.length; i++) {
				temp = {
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
				temp.id = obj.id;
				temp.name = obj.name;
				temp.link = obj.link;
				temp.icon = obj.icon;
				large = Math.max(obj.emotes.managed.length, obj.emotes.unmanaged.length);
				for (var j = 0; j < large; j++) {
					if (i > obj.emotes.managed.length) {
						try {
							temparr.push({
								"id" : obj.emotes.managed[i].id,
								"name" : obj.emotes.managed[i].name});
						} catch (e) {
							temparr.push({
								"id" : "",
								"name" : obj.emotes.managed[i]});
						}
					}
					if (i > obj.emotes.unmanaged.length) {
						try {
							temparr2.push({
								"id" : obj.emotes.unmanaged[i].id,
								"name" : obj.emotes.unmanaged[i].name});
						} catch (e) {
							temparr2.push({
								"id" : "",
								"name" : obj.emotes.unmanaged[i]});
						}
					}
				}
				temp.emotes.managed = temparr;
				temp.emotes.unmanaged = temparr2;
				if (sorted) {
					try {
						index = obj.getserver(temp.id);
						servers.splice(index, 0, temp);
					} catch (e) {
						if (typeof(e) === 'number') {
							servers.splice(e, 0, temp);
						} else {
							console.log(e.message);
						}
					}
				} else {
					servers.push(temp);
				}
			}
		}
	};
	obj.findbyid = function (id) {
		var pos = 0, lpos = 0, lim = servers.length - 1;
		if (!sorted) {
			//sort
			quicksort();
			sorted = true;
		}
		pos = Math.ceil(servers.length/2)
		while (true ) {
			if (pos === lim || pos === lpos) {
				if (servers[pos].id === id) {
					return pos;
				} else {
					throw pos;
				}
			}
			if (servers[pos].id === id) {
				return pos;
			} else if (servers[pos].id < id) {
				lpos = pos;
				pos = Math.ceil((lim - lpos) / 2) + lpos;
			} else {
				lim = pos;
				pos = Math.ceil((lim - lpos) / 2) + lpos;
				if (lim == pos) {
					pos = pos - 1;
				}
			}
		}
	};
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
	return obj;
})();

module.exports = serverfunc;