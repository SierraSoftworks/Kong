module.exports = function(server, notify) {
  server.post('/push/gitlab', function(req, res) {
    notify(req.body);
  });
};
