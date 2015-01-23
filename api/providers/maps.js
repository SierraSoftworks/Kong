var _ = require('lodash');

module.exports = function(server) {
  server.get('/api/maps', function(req, res, next) {
    res.json(_.map(server.maps.maps, function(map) {
      return _.at(map, 'source', 'target', 'when', 'map')
    }));
    return next();
  });
};