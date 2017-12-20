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
