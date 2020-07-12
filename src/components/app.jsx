import React from 'react';
import { Device }  from 'framework7/framework7-lite.esm.bundle.js';
import {
  App,
  View,
} from 'framework7-react';
import cordovaApp from '../js/cordova-app';
import routes from '../js/routes';

import io from 'socket.io-client';

export default class extends React.Component {
  constructor() {
    super();

    this.state = {
      // Framework7 Parameters
      f7params: {
        id: 'com.paviel.app', // App bundle ID
        name: 'Paviel', // App name
        theme: 'auto', // Automatic theme detection


        socket: io('http://64.225.125.57:3000'),
        // App routes
        routes: routes,


        // Input settings
        input: {
          scrollIntoViewOnFocus: Device.cordova && !Device.electron,
          scrollIntoViewCentered: Device.cordova && !Device.electron,
        },
        // Cordova Statusbar settings
        statusbar: {
          iosOverlaysWebView: true,
          androidOverlaysWebView: false,
        },
      },

    }
  }
  render() {
    return (
      <App params={ this.state.f7params }>

        {/* Your main view, should have "view-main" class */}
        <View main className="safe-areas" url="/" />

      </App>
    );
  }

  componentDidMount() {
    this.$f7ready((f7) => {
      // Init cordova APIs (see cordova-app.js)
      if (Device.cordova) {
        cordovaApp.init(f7);
      }
      // Call F7 APIs here
    });
  }
}