function promiseBuilder(delegate, promiseFactory) {

  function Proxy(promise) { this.promise = promise; }

  methodsOf(delegate).forEach(function(method) {
    defineProxyMethod(Proxy, method, delegate)
  })

  Proxy.prototype.then = function(onFulfilled, onRejected) {
    return new Proxy(this.promise.then(onFulfilled, onRejected))
  }

  Proxy.prototype.catch = function(onRejected) {
    return new Proxy(this.promise.catch(onRejected))
  }

  return new Proxy((promiseFactory || global.Promise).resolve())
}

function methodsOf(object) {
  var props = []
  var obj = object
  do {
    props = props.concat(Object.getOwnPropertyNames(obj))
  } while (obj = Object.getPrototypeOf(obj))
  return props.filter(function (p) {
    return p !== 'constructor' && typeof object[p] == 'function'
  })
}

function defineProxyMethod(Proxy, method, delegate) {
  Proxy.prototype[method] = function() {
    var args = [].slice.apply(arguments)
    return new Proxy(this.promise.then(function(result) {
      return delegate[method].apply(delegate, args.concat([result]))
    }))
  }
}

module.exports = promiseBuilder;
