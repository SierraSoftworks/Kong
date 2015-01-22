var KongServer = require('./index.js');

var config = {
  version: process.env.VERSION || 'development',
  port: process.env.PORT || 3000,
  keyFile: process.env.KEYFILE || '.kongkeys.json'
};

var app = new KongServer(config);

app.listen(config.port);
