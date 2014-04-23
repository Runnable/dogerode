# dogerode

  A shim for DataDog stats from dockerode.

## Installation

```
$ npm install dogerode
```

## Example

```js

var Docker = require('dockerode');
var docker = new Docker({socketPath: '/var/run/docker.sock'});
var dogerode = require('dogerode');

docker = dogerode(docker, {
  service: 'docker_client'
});

var container = docker.getContainer('71501a8ab0f8');

container.start(function (err, data) {
  console.log(data);
});

```