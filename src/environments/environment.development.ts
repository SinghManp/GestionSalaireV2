export const environment = {
    name: 'development',
    production: false,
    firebaseConfig: {
        apiKey: 'AIzaSyDn2UdYwoXEzn_3N166kCkAWH9-cgSJxxk',
        authDomain: 'gest-sal-dev.firebaseapp.com',
        databaseURL: 'https://gest-sal-dev-default-rtdb.europe-west1.firebasedatabase.app/',
        projectId: 'gest-sal-dev',
        storageBucket: 'gest-sal-dev.appspot.com',
        messagingSenderId: '890159545399',
        appId: '1:890159545399:web:ff780092470725430f13b2',
    },

    customCurrencyMaskConfig: {
        align: 'center',
        allowNegative: true,
        decimal: ',',
        precision: 2,
        prefix: '',
        suffix: ' $',
        thousands: ' ',
    },
};
