module.exports = {
  id: "android",
  initialize:function() {
    var channel = require("phonegap/channel"),
        phonegap = require('phonegap'),
        callback = require('phonegap/plugin/android/callback'),
        polling = require('phonegap/plugin/android/polling'),
        exec = require('phonegap/exec');

    channel.onDestroy.subscribe(function() {
      phonegap.shuttingDown = true;
    });

    // Start listening for XHR callbacks
    // Figure out which bridge approach will work on this Android
    // device: polling or XHR-based callbacks
    setTimeout(function() {
      if (phonegap.UsePolling) {
        polling();
      }
      else {
        var isPolling = prompt("usePolling", "gap_callbackServer:");
        phonegap.UsePolling = isPolling;
        if (isPolling == "true") {
          phonegap.UsePolling = true;
          polling();
        } else {
          phonegap.UsePolling = false;
          callback();
        }
      }
    }, 1);

    // Inject a listener for the backbutton on the document.
    var backButtonChannel = phonegap.addDocumentEventHandler('backbutton', {
      onSubscribe:function() {
        // If we just attached the first handler, let native know we need to override the back button.
        if (this.handlers.length === 1) {
          exec(null, null, "App", "overrideBackbutton", [true]);
        }
      },
      onUnsubscribe:function() {
        // If we just detached the last handler, let native know we no longer override the back button.
        if (this.handlers.lenght === 0) {
          exec(null, null, "App", "overrideBackbutton", [false]);
        }
      }
    });

    // Add hardware MENU and SEARCH button handlers
    phonegap.addDocumentEventHandler('menubutton');
    phonegap.addDocumentEventHandler('searchbutton');

    // Let native code know we are all done on the JS side.
    // Native code will then un-hide the WebView.
    channel.join(function() {
      prompt("", "gap_init:");
    }, [channel.onPhoneGapReady]);

    // Figure out if we need to shim-in localStorage and WebSQL
    // support from the native side.
    var storage = require('phonegap/plugin/android/storage');

    // First patch WebSQL if necessary
    if (typeof window.openDatabase == 'undefined') {
      // Not defined, create an openDatabase function for all to use!
      window.openDatabase = storage.openDatabase;
    } else {
      // Defined, but some Android devices will throw a SECURITY_ERR -
      // so we wrap the whole thing in a try-catch and shim in our own
      // if shit hits the fan.
      var originalOpenDatabase = window.openDatabase;
      window.openDatabase = function(name, version, desc, size) {
          var db = null;
          try {
              db = originalOpenDatabase(name, version, desc, size);
          } 
          catch (ex) {
              db = null;
          }

          if (db === null) {
              setupDroidDB();
              return storage.openDatabase(name, version, desc, size);
          }
          else {
              return db;
          }
        
      };
    }

    // Patch localStorage if necessary
    if (typeof window.localStorage == 'undefined' || window.localStorage === null) {
        window.localStorage = new storage.CupCakeLocalStorage();
    }
  },
  objects: {
    PhoneGap: {
      children: {
        JSCallback:{
          path:"phonegap/plugin/android/callback"
        },
        JSCallbackPolling:{
          path:"phonegap/plugin/android/polling"
        }
      }
    },
    navigator: {
      children: {
        device: {
          path: "phonegap/plugin/android/device"
        },
        app:{
          path: "phonegap/plugin/android/app"
        }
      }
    },
    device:{
      path: "phonegap/plugin/android/device"
    }
  }
};