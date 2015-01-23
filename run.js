var KongServer = require('./index.js'),
    _ = require('lodash'),
    config = {};

try {
  config = require(process.env.CONFIG || './.kongconfig.json');
} catch(ex) {
  console.error("Could not load .kongconfig.json file - please ensure that one is present or set CONFIG=file");
};

_.defaults(config, {
  port: 3000,
  version: 'development'
});

var app = new KongServer(config);

app.listen(process.env.PORT || config.port);
