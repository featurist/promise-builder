# promise-builder

Builds up promises step by step.

# example

```JavaScript

var builder = require('promise-builder')(
  {
    zero:  () => 0,
    add:   (x, p) => Promise.resolve(p + x),
    minus: (x, p) => p - x
  }
);

builder.zero().add(1).add(3).then(n => n * 2).minus(1).then(console.log);

// -> Logs '7'

```
