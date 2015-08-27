module.exports = function(server, notify) {
  server.post('/push/gitlab', function(req, res, next) {
    notify(req.body);
    res.send(200, null);
    return next();
  });
};
