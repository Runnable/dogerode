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
        targetType: options.targetType || 'unknown',
        method: options.method,
        socketPath: modem.socketPath,
        dockerHost: modem.host,
        port: modem.post,
        dockerVersion: modem.version,
        success: err == null,
        statusCode: err && err.statusCode,
        errorCode: err && err.code
      });
      callback(err, payload);
    }
  }
}

var dockerNouns = [
  'attach',
  'auth',
  'build',
  'changes',
  'containers',
  'commit',
  'copy',
  'create',
  'events',
  'exec',
  'export',
  'history',
  'images',
  'info',
  'insert',
  'json',
  'kill',
  'load',
  'logs',
  'pause',
  'push',
  'resize',
  'restart',
  'search',
  'start',
  'stop',
  'tag',
  'top',
  'unpause',
  'version',
  'wait',
  '_ping',
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
