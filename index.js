function promiseBuilder(delegate, promiseFactory) {

  function Proxy(promise) { this.promise = promise; }

  methodsOf(delegate).forEach(function(method) {
    defineProxyMethod(Proxy, method, delegate);
  })

  Proxy.prototype.then = function(onFulfilled, onRejected) {
    return new Proxy(this.promise.then(onFulfilled, onRejected));
  };

  Proxy.prototype.catch = function(onRejected) {
    return new Proxy(this.promise.catch(onRejected));
  };

  return new Proxy((promiseFactory || global.Promise).resolve());
}

function methodsOf(obj) {
  var methods = [];
  var propertyNames = Object.getOwnPropertyNames(Object.getPrototypeOf(obj));
  for (var i = 0; i < propertyNames.length; i++) {
    var name = propertyNames[i];
    if (obj[name] !== obj.constructor) methods.push(name);
  }
  for (var name in obj) {
    methods.push(name);
  }
  return methods;
}

function defineProxyMethod(Proxy, method, delegate) {
  Proxy.prototype[method] = function() {
    var args = [].slice.apply(arguments);
    return new Proxy(this.promise.then(function(result) {
      return delegate[method].apply(delegate, args.concat([result]));
    }));
  }
}

module.exports = promiseBuilder;
