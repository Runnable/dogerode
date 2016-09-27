'use strict'

const Dogstatsy = require('dogstatsy')

module.exports = shim

function shim (dockerode, opts) {
  const stats = new Dogstatsy(opts)
  const modem = dockerode.modem
  modem._dial = modem.dial
  modem.dial = dial
  return dockerode

  function dial (options, callback) {
    const reportTiming = stats.histogram('node.dockerode.dial')
    modem._dial(options, done)

    function done (err, payload) {
      const tags = {
        path: filterPath(options.path),
        targetType: opts.targetType || 'unknown',
        method: options.method,
        socketPath: modem.socketPath,
        dockerHost: modem.host,
        port: modem.post,
        dockerVersion: modem.version,
        success: err === null || err === undefined,
        statusCode: err && err.statusCode,
        errorCode: err && err.code
      }
      const allTags = Object.assign(opts.datadogTags || {}, tags)
      reportTiming(allTags)
      callback(err, payload)
    }
  }
}

const dockerNouns = [
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
  'update',
  'unpause',
  'version',
  'wait',
  '_ping'
]

const isDockerNoun = new RegExp(dockerNouns.join('|'))

function filterPath (path) {
  return '/' + path
    .split('?')[0] // ignore query string
    .split('/')
    .filter(function (fragment) {
      return isDockerNoun.test(fragment)
    })
    .join('/')
}
