var KongServer = require('./index.js'),
    _ = require('lodash'),
    config = {};

try {
  config = require(process.env.KONG_CONFIG || './kongconfig.json');
} catch(ex) {
  console.error("Could not load kongconfig.json file - please ensure that one is present or set KONG_CONFIG=file\n%s", ex.message);
};

_.defaults(config, {
  port: 3000,
  version: 'development',
  keys: process.env.KONG_KEYS || './kongkeys.json'
});

var keys = {};

try {
	keys = require(config.keys);
} catch(ex) {
	console.error("Could not load " + config.keys + " file - please ensure that it is present or set KONG_KEYS=file");
}

var app = new KongServer(config, keys);

app.listen(process.env.port || config.port);
