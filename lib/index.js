// Generated by CoffeeScript 1.6.3
var domain;

domain = require('domain');

exports.context = function(context, domain) {
  if (domain == null) {
    domain = require('domain').active;
  }
  if (domain == null) {
    throw new Error('no active domain');
  }
  return domain.__context__ = context != null ? context() : {};
};

exports.cleanup = function(cleanup, context, domain) {
  if (context == null) {
    context = null;
  }
  if (domain == null) {
    domain = require('domain').active;
  }
  context = context || domain.__context__;
  if ((cleanup != null) && (context != null)) {
    cleanup(context);
  }
  if (domain != null) {
    return domain.__context__ = null;
  }
};

exports.onError = function(err, onError, context, domain) {
  if (context == null) {
    context = null;
  }
  if (domain == null) {
    domain = require('domain').active;
  }
  context = context || domain.__context__;
  if (onError != null) {
    onError(err, context);
  }
  return domain.__context__ = null;
};

exports.get = function(key, domain) {
  if (domain == null) {
    domain = require('domain').active;
  }
  if (domain == null) {
    throw new Error('no active domain');
  }
  return domain.__context__[key];
};

exports.set = function(key, value, domain) {
  if (domain == null) {
    domain = require('domain').active;
  }
  if (domain == null) {
    throw new Error('no active domain');
  }
  return domain.__context__[key] = value;
};

exports.run = function(options, func) {
  var cleanup, context, err, onError;
  if (!func) {
    func = options;
    options = {};
  }
  context = options.context, cleanup = options.cleanup, onError = options.onError;
  domain = options.domain || require('domain').active;
  if (!domain) {
    throw new Error('no active domain');
  }
  domain.on('dispose', function() {
    return exports.cleanup(cleanup, null, domain);
  });
  domain.on('error', function(err) {
    if (onError != null) {
      return exports.onError(err, onError, null, domain);
    } else {
      return exports.cleanup(cleanup, null, domain);
    }
  });
  exports.context(context, domain);
  try {
    domain.bind(func, true)();
  } catch (_error) {
    err = _error;
    domain.emit('error', err);
  }
  return domain;
};

exports.runInNewDomain = function(options, func) {
  var currentDomain;
  if (!func) {
    func = options;
    options = {};
  }
  currentDomain = require('domain').active;
  options.domain = require('domain').create();
  if (!options.detach && currentDomain) {
    currentDomain.add(options.domain);
    options.domain.on('error', function(err) {
      return currentDomain.emit('error', err);
    });
    currentDomain.on('dispose', function() {
      return options.domain.dispose();
    });
  }
  return exports.run(options, func);
};

exports.middleware = function(context, cleanup) {
  return function(req, res, next) {
    var _ref;
    if (typeof context !== 'function') {
      _ref = context, context = _ref.context, cleanup = _ref.cleanup;
    }
    domain = require('domain').active;
    exports.context(context, domain);
    res.on('finish', function() {
      return exports.cleanup(cleanup, null, domain);
    });
    req.__context__ = domain.__context__;
    return next();
  };
};

exports.middlewareOnError = function(onError) {
  return function(err, req, res, next) {
    if (typeof onError !== 'function') {
      onError = onError.onError;
    }
    if (onError != null) {
      exports.onError(err, onError, req.__context__);
    } else {
      exports.cleanup(onError, req.__context__);
    }
    req.__context__ = null;
    return next(err);
  };
};
