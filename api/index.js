var _ = require('lodash'),
	path = require('path'),
	fs = require('fs'),
    log = require('debug')('kong:api:log'),
    debug = require('debug')('kong:api:debug');

module.exports = function(server) {
	var directory = path.resolve(__dirname, "providers");
	_.each(fs.readdirSync(directory), function(file) {
		log("loading route definitions in %s", file);
		require(path.resolve(directory, file))(server);
	});
};