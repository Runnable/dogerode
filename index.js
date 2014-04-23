var Dogstatsy = require('dogstatsy');

module.exports = shim;

function shim (dockerode, opts) {
  var stats = new Dogstatsy(opts);
  var modem = dockerode.modem;
  modem._dial = modem.dial;
  modem.dial = dial;
  return dockerode;

  function dial (options, callback) {
    var reportTiming = stats.histogram('node.dockerode.dial');
    modem._dial(options, done);

    function done (err, payload) {
      reportTiming({
        path: filterPath(options.path),
        method: options.method,
        socketPath: modem.socketPath,
        host: modem.host,
        port: modem.post,
        version: modem.version,
        success: err == null,
        statusCode: err && err.statusCode
      });
      callback(err, payload);
    }
  }
}

var dockerNouns = [
  'images',
  'insert',
  'json',
  'history',
  'push',
  'tag',
  'containers',
  'top',
  'changes',
  'export',
  'start',
  'commit',
  'stop',
  'restart',
  'kill',
  'resize',
  'attach',
  'copy',
  'create',
  'auth',
  'build',
  'search',
  'info',
  'events',
];

var isDockerNoun = new RegExp(dockerNouns.join('|'));

function filterPath (path) {
  return '/' + path
    .split('?')[0] //ignore query string
    .split('/')
    .filter(function (fragment) {
      return isDockerNoun.test(fragment);
    })
    .join('/');
}
