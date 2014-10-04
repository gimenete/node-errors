var util = require('util')
var events = require('events')

function CustomError(constr) {
  Error.captureStackTrace(this, constr || this)
}

util.inherits(CustomError, Error)

CustomError.prototype.name = 'CustomError'

function IfError(callback) {
  this.callback = callback
}

IfError.prototype.on = function(err) {
  this.lastCondition = !!err
  this.err = err
  return this
}

IfError.prototype.when = function(condition) {
  this.lastCondition = !!condition
  this.err = undefined
  return this
}

IfError.prototype.success = function(callback) {
  if (this.finished) return
  callback()
}

function Errors() {
  events.EventEmitter.call(this)
}

util.inherits(Errors, events.EventEmitter)

exports = module.exports = new Errors()

var types = []

exports.types = function() {
  return types
}

exports.defineErrorType = function(type) {
  types.push(type)
  var capitalize = type.substring(0, 1).toUpperCase()+type.substring(1)
  CustomError.prototype['is'+capitalize] = function() {
    return this.type === type
  }
  IfError.prototype[type] = function() {
    if (this.finished) return this
    if (this.lastCondition) {
      this.finished = true
      // var args = Array.prototype.slice.call(arguments)
      var error = new CustomError()
      error.message = util.format.apply(null, arguments)
      error.root = this.err
      error.type = type
      this.callback.call(null, error)

      exports.emit(type, error)
    }
    this.errorType = type
    this.errorArguments = arguments
    return this
  }
}

;['internal','forbidden','request','notFound'].forEach(exports.defineErrorType)

exports.with = function(callback) {
  return new IfError(callback)
}

exports.nook = function(callback, success) {
  return function() {
    var args = Array.prototype.slice.call(arguments)
    var err = args.shift()
    if (err) return callback(err)
    if (typeof success !== 'function') {
      return callback.apply(null, [null].concat(args))
    }
    success.apply(null, args)
  }
}

exports.isCustomError = function(err) {
  return err instanceof CustomError
}
