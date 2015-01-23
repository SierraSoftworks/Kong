module.exports = function(server, notify) {
  server.post('/push/gitlabci', function(req, res) {
    server.notify(req.body);
  });
};
