'use strict'

var promiseBuilder = require('../')
var expect = require('chai').expect

describe('promise-builder', function() {

  var builder, log

  beforeEach(function() {
    log = ''
  })

  context('with an ES5 object as the language', function() {

    beforeEach(function() {
      builder = promiseBuilder({
        x: function() {
          log += 'x'
          return Promise.resolve()
        },
        y: function() {
          log += 'y'
          return Promise.reject(Error('ouch'))
        },
        z: function() {
          log += 'z'
        },
        a: function() {
          log += 'a'
          return this.x()
        },
        b: function() {
          log += 'b'
          throw Error('omg')
        },
        c: function() {
          log += 'c'
          return Promise.resolve('!')
        },
        d: function(arg) {
          log += arg
          return Promise.resolve()
        }
      })
    })

    itBehavesLikePromiseBuilder()

  })

  class Language {
    x() {
      log += 'x'
      return Promise.resolve()
    }
    y() {
      log += 'y'
      return Promise.reject(Error('ouch'))
    }
    z() {
      log += 'z'
    }
    a() {
      log += 'a'
      return this.x()
    }
    b() {
      log += 'b'
      throw Error('omg')
    }
    c() {
      log += 'c'
      return Promise.resolve('!')
    }
    d(arg) {
      log += arg
      return Promise.resolve()
    }
  }

  class LanguageSubclass extends Language {}

  context('with an ES6 class instance as the language', function() {

    beforeEach(function() {
      builder = promiseBuilder(new Language())
    })

    itBehavesLikePromiseBuilder()

  })

  context('with an ES6 subclass instance as the language', function() {

    beforeEach(function() {
      builder = promiseBuilder(new LanguageSubclass())
    })

    itBehavesLikePromiseBuilder()

  })

  function itBehavesLikePromiseBuilder() {

    it('is a promise', function() {
      return builder
        .then(function() {
          expect(log).to.equal('')
        })
    })

    it('returns promises', function() {
      return builder.x()
        .then(function() {
          expect(log).to.equal('x')
        })
    })

    it('passes the result to the callback', function() {
      return builder.c()
        .then(function(result) {
          expect(result).to.equal('!')
        })
    })

    it('returns catchable promises', function() {
      return builder.y()
        .then(function() {
          expect.fail('y is rejected!')
        })
        .catch(function() {
          expect(log).to.equal('y')
        })
    })

    it('calls an error callback passed to then', function() {
      return builder.y()
        .then(function() {
          expect.fail('y is rejected!')
        }, function() {
          expect(log).to.equal('y')
        })
    })

    it('executes promises multiple times in the same chain', function() {
      return builder.x().x().x()
        .then(function() {
          expect(log).to.equal('xxx')
        })
    })

    it('executes promises when the language returns undefined', function() {
      return builder.z()
        .then(function() {
          expect(log).to.equal('z')
        })
    })

    it('sets "this" to the language definition object', function() {
      return builder.a()
        .then(function() {
          expect(log).to.equal('ax')
        })
    })

    it('passes the result to the next step', function() {
      return builder.c().d()
        .then(function() {
          expect(log).to.equal('c!')
        })
    })

    it('rejects promises that throw', function() {
      return builder.b()
        .then(function() {
          expect.fail('b throws!')
        })
        .catch(function(e) {
          expect(e.message).to.equal('omg')
        })
    })

    it('does not execute promises after a rejected promise', function() {
      return builder.x().y().z()
        .then(function() {
          expect.fail('y is rejected!')
        })
        .catch(function(e) {
          expect(e.message).to.equal('ouch')
          expect(log).to.equal('xy')
        })
    })

  }

  it('accepts a Promise implementation', function() {
    var y = undefined
    var SpecialPromise = function() {}
    SpecialPromise.resolve = function() { return Promise.resolve(321) }
    var builder = promiseBuilder({
      a: function(x) {
        y = x
        return y
      }
    }, SpecialPromise)
    return builder.a()
      .then(function(result) {
        expect(y).to.equal(321)
      })
  })

})
