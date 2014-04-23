var setCallback = require('dogstatsy/test/fixtures/DogStatsD');
var Docker = require('dockerode');
var docker = new Docker({
  host: 'http://localhost',
  port: 4244
});
var dogerode = require('..');

docker = dogerode(docker, {
  service: 'dogerode_test',
  port: 8126
});

var dockerMock = require('docker-mock');
dockerMock.listen(4244);

describe('dogerode', function () {

  it('should histogram', function (done) {
    var stat = 'node.dockerode.dial';
    setCallback(stat, '|h', function (err, stat, val, tags) {
      if (stat !== stat || tags.path !== '/containers/json') {
        done(new Error('mismatch'));
      } else {
        done();
      }
    });
    docker.listContainers(function () {});
  });

});