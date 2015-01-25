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
  version: 'development'
});

var app = new KongServer(config, config.keys || {});

app.listen(process.env.port || config.port);
