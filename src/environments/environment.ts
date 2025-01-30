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
