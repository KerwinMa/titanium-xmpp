/*
 * Single Window Application Template:
 * A basic starting point for your application.  Mostly a blank canvas.
 *
 * In app.js, we generally take care of a few things:
 * - Bootstrap the application with any data we need
 * - Check for dependencies like device type, platform version or network connection
 * - Require and open our top-level UI component
 *
 */


//bootstrap and check dependencies
if(Ti.version < 1.8) {
	alert('Sorry - this application template requires Titanium Mobile SDK 1.8 or later');
}

// This is a single context application with mutliple windows in a stack
(function() {
	//determine platform and form factor and render approproate components
	var osname = Ti.Platform.osname, version = Ti.Platform.version, height = Ti.Platform.displayCaps.platformHeight, width = Ti.Platform.displayCaps.platformWidth;

	//considering tablet to have one dimension over 900px - this is imperfect, so you should feel free to decide
	//yourself what you consider a tablet form factor for android
	var isTablet = osname === 'ipad' || (osname === 'android' && (width > 899 || height > 899));

	var Window;
	if(isTablet) {
		Window = require('ui/tablet/ApplicationWindow');
	} else {
		// Android uses platform-specific properties to create windows.
		// All other platforms follow a similar UI pattern.
		if(osname === 'android') {
			Window = require('ui/handheld/android/ApplicationWindow');
		} else {
			Window = require('ui/handheld/ApplicationWindow');
		}
	}
	new Window().open();

	var debug= function(a){
		Ti.API.debug("Handled:"+a);
	}

	function setupCon(oCon) {
	    oCon.registerHandler('message',debug);
	    oCon.registerHandler('presence',debug);
	    oCon.registerHandler('iq',debug);
	    oCon.registerHandler('onconnect',debug);
	    oCon.registerHandler('onerror',debug);
	    oCon.registerHandler('status_changed',debug);
	    oCon.registerHandler('ondisconnect',debug);
	
	    ///oCon.registerIQGet('query', NS_VERSION, handleIqVersion);
	    //oCon.registerIQGet('query', NS_TIME, handleIqTime);
	}

	
	Ti.include("xmpp/JSJaC.js");
	JSJaC.load();
	var con = new JSJaCConnection({oDbg: new JSJaCConsoleLogger(4)});

    setupCon(con);	
  
  	// setup args for connect method
    oArgs = new Object();
    oArgs.host = "jabberes.org";
    oArgs.domain = "jabberes.org";
    oArgs.username = "marjo";
    oArgs.resource = 'jsjac_simpleclient';
    oArgs.pass = "marjo83";
    oArgs.register = false;
    con.connect(oArgs);

	

})();
