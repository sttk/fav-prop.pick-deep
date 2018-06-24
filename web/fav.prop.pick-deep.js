(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g=(g.fav||(g.fav = {}));g=(g.prop||(g.prop = {}));g.pickDeep = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

var setDeep = require('@fav/prop.set-deep');
var assignDeep = require('@fav/prop.assign-deep');
var isArray = require('@fav/type.is-array');
var isPlainObject = require('@fav/type.is-plain-object');

function pickDeep(src, pickedPropPaths) {
  if (!isArray(pickedPropPaths)) {
    return {};
  }

  var dest = {};

  for (var i = 0, n = pickedPropPaths.length; i < n; i++) {
    pickDeepEach(dest, src, pickedPropPaths[i]);
  }

  return dest;
}

function pickDeepEach(dest, src, pickedPropPath) {
  if (!isArray(pickedPropPath) || !pickedPropPath.length) {
    return;
  }

  var parent = getEnumOwnPropDeep(src, pickedPropPath.slice(0, -1));
  if (parent == null) {
    return;
  }

  var lastProp = pickedPropPath[pickedPropPath.length - 1];
  if (!isEnumOwnPropDesc(parent, lastProp)) {
    return;
  }

  var value = parent[lastProp];
  if (isPlainObject(value)) {
    value = assignDeep({}, value);
  }

  setDeep(dest, pickedPropPath, value);
}

function getEnumOwnPropDeep(obj, propPath) {
  for (var i = 0, n = propPath.length; i < n; i++) {
    var prop = propPath[i];
    if (!isEnumOwnPropDesc(obj, prop)) {
      return undefined;
    }
    obj = obj[prop];
  }
  return obj;
}

function isEnumOwnPropDesc(obj, prop) {
  if (isArray(prop)) {
    // This function doesn't allow to use an array as a property.
    return false;
  }

  var desc = Object.getOwnPropertyDescriptor(Object(obj), prop);
  return Boolean(desc && desc.enumerable);
}

module.exports = pickDeep;

},{"@fav/prop.assign-deep":2,"@fav/prop.set-deep":6,"@fav/type.is-array":7,"@fav/type.is-plain-object":8}],2:[function(require,module,exports){
'use strict';

var isPlainObject = require('@fav/type.is-plain-object');
var enumOwnProps = require('@fav/prop.enum-own-props');

function assignDeep(dest /* , ...src */) {
  if (!isPlainObject(dest)) {
    dest = {};
  }

  for (var i = 1, n = arguments.length; i < n; i++) {
    assignDeepEach(dest, arguments[i]);
  }
  return dest;
}

function assignDeepEach(dest, src) {
  var props = enumOwnProps(src);
  for (var i = 0, n = props.length; i < n; i++) {
    var prop = props[i];
    var srcValue = src[prop];

    if (isPlainObject(srcValue)) {
      var destValue = dest[prop];

      if (!isPlainObject(destValue)) {
        try {
          dest[prop] = destValue = {};
        } catch (e) {
          // If a property is read only, TypeError is thrown,
          // but this function ignore it.
        }
      }

      assignDeepEach(destValue, srcValue);
      continue;
    }

    try {
      dest[prop] = srcValue;
    } catch (e) {
      // If a property is read only, TypeError is thrown,
      // but this function ignore it.
    }
  }
}

module.exports = assignDeep;

},{"@fav/prop.enum-own-props":4,"@fav/type.is-plain-object":8}],3:[function(require,module,exports){
'use strict';

function enumOwnKeys(obj) {
  switch (typeof obj) {
    case 'object': {
      return Object.keys(obj || {});
    }
    case 'function': {
      return Object.keys(obj);
    }

    // Cause TypeError on Node.js v0.12 or earlier.
    case 'string': {
      return Object.keys(new String(obj));
    }
    default: {
      return [];
    }
  }
}

module.exports = enumOwnKeys;

},{}],4:[function(require,module,exports){
'use strict';

var enumOwnKeys = require('@fav/prop.enum-own-keys');
var enumOwnSymbols = require('@fav/prop.enum-own-symbols');

function enumOwnProps(obj) {
  return enumOwnKeys(obj).concat(enumOwnSymbols(obj));
}

module.exports = enumOwnProps;

},{"@fav/prop.enum-own-keys":3,"@fav/prop.enum-own-symbols":5}],5:[function(require,module,exports){
'use strict';

function enumOwnSymbols(obj) {
  /* istanbul ignore if */
  if (typeof Symbol !== 'function') {
    return [];
  }

  switch (typeof obj) {
    case 'object': {
      obj = obj || {};
      break;
    }
    case 'function': {
      break;
    }
    default: {
      return [];
    }
  }

  var symbols = Object.getOwnPropertySymbols(obj);
  for (var i = symbols.length - 1; i >= 0; i--) {
    var descriptor = Object.getOwnPropertyDescriptor(obj, symbols[i]);
    if (!descriptor.enumerable) {
      symbols.splice(i, 1);
    }
  }
  return symbols;
}

module.exports = enumOwnSymbols;

},{}],6:[function(require,module,exports){
'use strict';

var isArray = require('@fav/type.is-array');

function setDeep(obj, propPath, value) {
  if (arguments.length < 3) {
    return;
  }

  if (!isArray(propPath)) {
    return;
  }

  if (!canHaveProp(obj)) {
    return;
  }

  var i, last = propPath.length - 1;

  for (i = 0; i < last; i++) {
    var existentProp = propPath[i];
    if (isArray(existentProp)) {
      // This function doesn't allow to use an array as a property.
      return;
    }

    var child = obj[existentProp];
    if (!canHaveProp(child)) {
      break;
    }
    obj = child;
  }

  for (var j = last; j > i; j--) {
    var nonExistentProp = propPath[j];
    if (isArray(nonExistentProp)) {
      // This function doesn't allow to use an array as a property.
      return;
    }

    var parent = {};
    parent[nonExistentProp] = value;
    value = parent;
  }

  try {
    var graftedProp = propPath[i];
    if (isArray(graftedProp)) {
      // This function doesn't allow to use an array as a property.
      return;
    }
    obj[graftedProp] = value;
  } catch (e) {
    // If a property is read only, TypeError is thrown,
    // but this function ignores it.
  }
}

function canHaveProp(obj) {
  switch (typeof obj) {
    case 'object': {
      return (obj != null);
    }
    case 'function': {
      return true;
    }
    default: {
      return false;
    }
  }
}

module.exports = setDeep;

},{"@fav/type.is-array":7}],7:[function(require,module,exports){
'use strict';

function isArray(value) {
  return Array.isArray(value);
}

function isNotArray(value) {
  return !Array.isArray(value);
}

Object.defineProperty(isArray, 'not', {
  enumerable: true,
  value: isNotArray,
});

module.exports = isArray;

},{}],8:[function(require,module,exports){
'use strict';

function isPlainObject(value) {
  if (typeof value !== 'object') {
    return false;
  }

  if (Object.prototype.toString.call(value) !== '[object Object]') {
    return false;
  }

  switch (Object.getPrototypeOf(value)) {
    case Object.prototype: {
      return true;
    }
    case null: {
      return true;
    }
    default: {
      return false;
    }
  }
}

function isNotPlainObject(value) {
  return !isPlainObject(value);
}

Object.defineProperty(isPlainObject, 'not', {
  enumerable: true,
  value: isNotPlainObject,
});

module.exports = isPlainObject;

},{}]},{},[1])(1)
});
