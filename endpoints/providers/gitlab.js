module.exports = function(server, notify) {
  server.post('/push/gitlab', function(req, res, next) {
    notify(req.body);
    res.status(200);
    return next();
  });
};
