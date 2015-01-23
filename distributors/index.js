var fs = require('fs'),
    path = require('path'),
    _ = require('lodash');

function DistributionProvider(server) {
}

DistributionProvider.prototype.register = function(name, distributor) {
  if(~Object.keys(DistributionProvider.prototype).indexOf(name) || Object.keys(this).indexOf(name)) throw new Error("Cannot register a distributor with the name " + name + " as this name is reserved");
  this[name] = distributor.bind(null, server);
};

DistributionProvider.prototype.registerAll = function() {
  var directory = path.resolve(__dirname, "providers");

  _.each(fs.readdirSync(directory), function(filename) {
    if(/\.js$/.test(filename)) this.register(
      filename.replace(/(.+)\.js$/, function(_, name) { return name; }),
      require(path.resolve(directory, filename)));
    }, this);
  };

module.exports = DistributionProvider;
