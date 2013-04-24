/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict"

const {classes: Cc, interfaces: Ci, utils: Cu} = Components;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
XPCOMUtils.defineLazyModuleGetter(this, 'Services', 'resource://gre/modules/Services.jsm');

var EXPORTED_SYMBOLS = ['utils'];

var utils = {
  getContentFromURL: function getContentFromURL(url) {
    var ioService = Cc['@mozilla.org/network/io-service;1'].getService(Ci.nsIIOService);
    var scriptableStream = Cc['@mozilla.org/scriptableinputstream;1'].getService(Ci.nsIScriptableInputStream);

    var channel = ioService.newChannel(url, null, null);
    var input = channel.open();
    scriptableStream.init(input);
    var str = scriptableStream.read(input.available());
    scriptableStream.close()
    input.close();

    var utf8Converter = Components.classes["@mozilla.org/intl/utf8converterservice;1"].
    getService(Components.interfaces.nsIUTF8ConverterService);
    return utf8Converter.convertURISpecToUTF8 (str, "UTF-8");
  },

  exposeReadOnly: function exposeReadOnly(obj) {
    if (null == obj) {
      return obj;
    }

    if (typeof obj !== "object") {
      return obj;
    }

    if (obj["__exposedProps__"]) {
      return obj;
    }

    // If the obj is a navite wrapper, can not modify the attribute.
    try {
      obj.__exposedProps__ = {};
    } catch (e) {
      return;
    }

    var exposedProps = obj.__exposedProps__;
    for (let i in obj) {
      if (i === "__exposedProps__") {
        continue;
      }

      if (i[0] === "_") {
        continue;
      }

      exposedProps[i] = "r";

      exposeReadOnly(obj[i]);
    }

    return obj;
  },

  md5: function md5(str) {
    var data = str.split('');
    var ch = Cc["@mozilla.org/security/hash;1"]
               .createInstance(Ci.nsICryptoHash);
    ch.init(ch.MD5);
    ch.update(data, data.length);
    var hash = ch.finish(true);

    // return the two-digit hexadecimal code for a byte
    function toHexString(charCode) {
      return ("0" + charCode.toString(16)).slice(-2);
    }

    // convert the binary hash data to a hex string.
    return [toHexString(hash.charCodeAt(i)) for (i in hash)].join("");
  },

  getChromeFileURI: function getChromeFileURI(uri) {
    let fileURI = Services.io.newURI(uri, null, null);
    if (!(fileURI instanceof Ci.nsIFileURL)) {
      return null;
    }

    return fileURI;
  }
};

