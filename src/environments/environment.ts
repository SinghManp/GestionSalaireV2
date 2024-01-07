export const environment = {
  name: 'production',
  production: true,
  firebaseConfig: {
    apiKey: 'AIzaSyCpd4iS6mOzJUAxWpsOWi0_N-2yK41Oi78',
    authDomain: 'gestion-salaire.firebaseapp.com',
    databaseURL: 'https://gestion-salaire.firebaseio.com',
    projectId: 'gestion-salaire',
    storageBucket: 'gestion-salaire.appspot.com',
    messagingSenderId: '369158844795',
    appId: '1:369158844795:web:1a25a83f43d108c9940dde',
    measurementId: 'G-BW72511RFR',
  },

  // name: 'development',
  // production: false,
  // firebaseConfig: {
  //   apiKey: 'AIzaSyDn2UdYwoXEzn_3N166kCkAWH9-cgSJxxk',
  //   authDomain: 'gest-sal-dev.firebaseapp.com',
  //   databaseURL:
  //     'https://gest-sal-dev-default-rtdb.europe-west1.firebasedatabase.app/',
  //   projectId: 'gest-sal-dev',
  //   storageBucket: 'gest-sal-dev.appspot.com',
  //   messagingSenderId: '890159545399',
  //   appId: '1:890159545399:web:ff780092470725430f13b2',
  // },

  customCurrencyMaskConfig: {
    align: 'center',
    allowNegative: true,
    decimal: ',',
    precision: 2,
    prefix: '',
    suffix: ' €',
    thousands: ' ',
  },
};
