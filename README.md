# Kong
**A flexible notification distribution framework on Node.js**

Kong, named after those ridiculous bouncy toys you get for your dog, was designed
to make the process of notification distribution as flexible as possible. Many systems
these days provide the ability to install Web Hooks to be notified of events as they
occur.

Kong's primary design goal was to offer a service which allows almost anybody to deploy
a web hook consumer in a matter of minutes, while allowing them to tailor it to work
exactly as they require. To this end, it provides a powerful Handlebars based transform
engine and easily customizable conditional engine - allowing you to choose which events
are sent to any distribution services.

## A Quick Example
Kong uses JSON to configure your service, you define rules in map files which determine
the conditions under which notifications are sent. You then describe how you would like
to generate the notification you'll be sending using Handlebars templates - couldn't be
simpler.

```json
{
  "source": "gitlab",
  "target": "pushover",
  "when": {
    "build_status": "failed"
  },
  "map": {
    "user": "{{keys.pushover.user}}",
    "title": "{{source.project_name}}",
    "message": "Build Failed",
    "timestamp": "{{timestamp source.build_finished_at}}",
    "url": "{{source.gitlab_url}}/builds/{{source.build_id}}",
    "url_title": "View Build Log"
  }
}
```

In this example, anything sent to the `/push/gitlab` endpoint will be forwarded to your
[PushOver](https://pushover.net) distributor if the `build_status` property is `"failed"`.
We've then grabbed the application and user tokens from the `keys.pushover` store (which
you should place in a secure location on your server to keep your tokens safe), while grabbing
other details from the `source` notification. You'll also notice that we're using a Handlebar
helper method called `timestamp` to convert the JSON Date string provided by
`source.build_finished_at` into a UNIX timestamp (which is what PushOver expects).

## Configuring Kong
Kong uses a couple of configuration files to setup everything. The first is `KONG_CONFIG`
which by default is stored in `kongconfig.json`. If you'd like to store your configuration
file somewhere else then simply set `process.env.KONG_CONFIG = "/path/to/config.json"`.

When setting up Kong for the first time, just copy the `kongconfig.example.json` file and
tweak it to suit your requirements.

## Endpoints
Kong represents callable API methods which are intended to be consumed by Web Hook sources
as Endpoints. These endpoints generally take the form of a POST method made accessible at
`/push/:source`, where source is the name of the service pushing the notification.

If your service simply executes a **HEAD/GET/POST/PUT** request and expects a **200 Success**
response then you shouldn't need to define a custom endpoint for your service. Kong will
automatically extract the parameters and present them to your map templates.

If however you need custom logic for handling your service's logging requirements
(WebSockets for example) then you can define one in `endpoints/providers`. Here's
a quick example of a custom endpoint handler which emits notifications an a `:source`
determined by its filename. If you wish to emit on custom sources then simply use
`server.notify(source, notification)` instead of the provided `notify` method.

```javascript
module.exports = function(server, notify) {
	server.post('/push/myservice', function(req, res, next) {
		notify(req.body);
		return next();
	});	
};
```

## Distributors
Keep in mind that Kong is effectively a router for your notifications. With this in mind,
you'll need to have a way to forward your notifications to services that can do something
with them. Usually a distributor is nothing more than a method which can push the notification
to a remote service by handling any API specific logic.

Depending on how the service works it can be either a good or bad idea to add API specific
information to the notification before it is sent. Generally you should do some validation
to ensure any required fields are present, however keep in mind that maps are intended to
be where most of your configuration happens - so if you foresee a situation in which you
may need to change a value, rather set it in your maps (or make it overridable) than in
your distributor.

Here's a quick PushBullet distributor example which automatically uses the Application Token
and User Token provided in `KONG_KEYS` unless alternatives are provided by the map. You'll
notice that the function returns a Q promise object, this is used to allow Kong to easily
manage distribution receipts for debugging and logging purposes.

```javascript
var restify = require('restify'),
  _ = require('lodash'),
    Q = require('q');

var api = restify.createJsonClient({
  url: 'https://api.pushover.net'
});

module.exports = function(server, notification) {
  var defered = Q.defer();

  _.defaults(notification, {
    token: server.keys.pushover.token,
    user: server.keys.pushover.user
  });

  api.post("/1/messages.json", notification, function(err, req, res, obj) {
    if(err) return defered.reject(err);
    defered.resolve(obj);
  });

  return defered.promise;
};
```