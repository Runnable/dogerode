'use strict'

const setCallback = require('dogstatsy/test/fixtures/DogStatsD')
const Docker = require('dockerode')
let docker = new Docker({
  host: 'http://localhost',
  port: 4244
})
const dogerode = require('..')

docker = dogerode(docker, {
  service: 'dogerode_test',
  port: 8126
})

const dockerMock = require('docker-mock')
dockerMock.listen(4244)

describe('dogerode', function () {
  it('should histogram', function (done) {
    const stat = 'node.dockerode.dial'
    setCallback(stat, '|h', function (err, stat, val, tags) {
      if (err) {
        return done(err)
      }
      if (stat && tags.path !== '/containers/json') {
        done(new Error('mismatch'))
      } else {
        done()
      }
    })
    docker.listContainers(function () {})
  })
})
