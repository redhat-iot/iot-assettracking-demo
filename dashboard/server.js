//  OpenShift sample Node application
var express = require('express'),
    http = require('http'),
    request = require('request'),
    fs = require('fs'),
    app = express(),
    path = require("path"),
    appConfig = require('./config.js'),
    port = process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

// error handling
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something bad happened!');
});

// keycloak config server
app.get('/config.json', function (req, res, next) {
    res.json(appConfig);
});

app.use(express.static(path.join(__dirname, '/views')));
app.use('/app', express.static(path.join(__dirname, '/app')));
app.use('/bower_components', express.static(path.join(__dirname, '/bower_components')));

console.log("app config: " + JSON.stringify(appConfig));

http.createServer(app).listen(port);

console.log('HTTP Server running on http://%s:%s', ip, port);

module.exports = app;
