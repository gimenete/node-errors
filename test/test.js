var errors = require('../')
var assert = require('assert')
var _ = require('underscore')

describe('Test the whole thing', function() {

  it('calls success if no errors', function(done) {
    var error = null
    var foo = '!!'

    var callback = function(err) {
      assert.fail('The callback function should not be called')
    }

    errors.with(callback)
      .on(error)
        .internal('There was an internal error %s', foo)
      .success(function() {
        done()
      })
  })

  it('calls callback with error', function(done) {
    var error = new Error('test')
    var foo = '!!'

    var callback = function(err) {
      assert.ok(err)
      assert.ok(err.isInternal())
      assert.equal(err.type, 'internal')
      assert.ok(err.root)
      assert.equal(err.root, error)
      assert.equal(err.message, 'There was an internal error !!')
      assert.ok(errors.isCustomError(err))
      done()
    }

    errors.with(callback)
      .on(error)
        .internal('There was an internal error %s', foo)
      .success(function() {
        assert.fail('The success function should not be called')
      })
  })

  it('calls callback on unmet condition', function(done) {
    var foo = '!!'
    var obj = null

    var callback = function(err) {
      assert.ok(err)
      assert.ok(err.isNotFound())
      assert.equal(err.type, 'notFound')
      assert.equal(err.root, undefined)
      assert.equal(err.message, 'Object not found !!')
      done()
    }

    errors.with(callback)
      .when(!obj)
        .notFound('Object not found %s', foo)
      .success(function() {
        assert.fail('The success function should not be called')
      })
  })

  it('lets chaining conditions', function(done) {
    var error = new Error('test')
    var foo = '!!'
    var obj = null

    var callback = function(err) {
      assert.ok(err)
      assert.ok(err.isInternal())
      assert.equal(err.type, 'internal')
      assert.ok(err.root)
      assert.equal(err.root, error)
      assert.equal(err.message, 'There was an internal error !!')
      done()
    }

    errors.with(callback)
      .on(error)
        .internal('There was an internal error %s', foo)
      .when(!obj)
        .notFound('Object not found %s', foo)
      .success(function() {
        assert.fail('The success function should not be called')
      })
  })

  it('has the ability to define custom error types', function(done) {
    var error = new Error('test')
    var foo = '!!'
    var length = errors.types().length

    errors.defineErrorType('external')
    assert.ok(errors.types().indexOf('external') >= 0)
    assert.equal(errors.types().length, length+1)

    var callback = function(err) {
      assert.ok(err)
      assert.ok(err.isExternal())
      assert.equal(err.type, 'external')
      assert.ok(err.root)
      assert.equal(err.root, error)
      assert.equal(err.message, 'There was an external error !!')
      done()
    }

    errors.with(callback)
      .on(error)
        .external('There was an external error %s', foo)
      .success(function() {
        assert.fail('The success function should not be called')
      })
  })

  it('has the ability of listening to error events', function(done) {
    var error = new Error('test')
    var foo = '!!'

    errors.once('internal', function(err) {
      assert.ok(err)
      assert.ok(err.isInternal())
      assert.equal(err.type, 'internal')
      assert.ok(err.root)
      assert.equal(err.root, error)
      assert.equal(err.message, 'There was an internal error !!')
      done()
    })

    var callback = function(err) {
      assert.ok(err)
      assert.ok(err.isInternal())
      assert.equal(err.type, 'internal')
      assert.ok(err.root)
      assert.equal(err.root, error)
      assert.equal(err.message, 'There was an internal error !!')
    }

    errors.with(callback)
      .on(error)
        .internal('There was an internal error %s', foo)
      .success(function() {
        assert.fail('The success function should not be called')
      })
  })

  it('tests the nook function on success with a callback function', function(done) {
    var error = null
    var foo = '!!'

    var callback = function(err) {
      assert.fail('The callback function should not be called')
    }

    errors.nook(callback, function(arg) {
      assert.equal(arg, foo)
      done()
    })(error, foo)
  })

  it('tests the nook function on success with arguments', function(done) {
    var error = null
    var foo = '!!'
    var bar = '$$'

    var callback = function(err, arg1, arg2) {
      assert.ifError(err)
      assert.equal(arg1, foo)
      assert.equal(arg2, bar)
      done()
    }

    errors.nook(callback, foo)(error, foo, bar)
  })

  it('tests the nook function on failure with a callback function', function(done) {
    var error = new Error('test')
    var foo = '!!'

    var callback = function(err) {
      assert.ok(err)
      done()
    }

    errors.nook(callback, function(arg) {
      assert.fail('The success function should not be called')
    })(error, foo)
  })

  it('tests creating custom errors directly', function() {
    var foo = '!!'
    var err = errors.request('Invalid argument %s', foo)
    assert.ok(err)
    assert.equal(err.message, 'Invalid argument !!')
  })

  it('tests creating custom errors directly with a root object', function() {
    var error = new Error('test')
    var err = errors.internal('Invalid argument', error)
    assert.ok(err)
    assert.equal(err.message, 'Invalid argument')
    assert.equal(err.root, error)
  })

})
