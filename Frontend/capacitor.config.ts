

// import type { CapacitorConfig } from '@capacitor/cli';

// const config: CapacitorConfig = {
//   appId: 'com.hrms.app',
//   appName: 'HrBook',
//   webDir: 'dist/HR-app/browser',
  
//   plugins: {
//     SplashScreen: {
//       launchShowDuration: 0
//     },
  

//     StatusBar: {
//       style: 'DEFAULT',
//       backgroundColor: '#2b2e41',
//       overlaysWebView: false  // 🔥 Yahi fix hai — status bar web view ko overlap nahi karega
//     },
//     CameraPreview: {
//       toBack: true,
//       parent: 'cameraPreview',
//     }
//   }
// };

// export default config;

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.empowerlogics.hrbook',
  appName: 'HrBook',
  webDir: 'dist/HR-app/browser',
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    },
    CameraPreview: {
      toBack: true,
      parent: 'cameraPreview',
    }
  }
};

export default config;