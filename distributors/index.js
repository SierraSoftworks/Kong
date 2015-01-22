function DistributionProvider(server) {
}

DistributionProvider.prototype.register = function(name, distributor) {
  if(~Object.keys(DistributionProvider.prototype).indexOf(name) || Object.keys(this).indexOf(name)) throw new Error("Cannot register a distributor with the name " + name + " as this name is reserved");
  this[name] = distributor;
};

module.exports = DistributionProvider;
