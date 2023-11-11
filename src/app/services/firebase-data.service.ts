import { Injectable } from '@angular/core';
import { getDatabase, ref, set, get, child } from 'firebase/database';
@Injectable({
  providedIn: 'root',
})
export class FirebaseDataService {
  constructor() {}

  getSuppliersNames() {
    return new Promise((resolve) => {
      get(child(ref(getDatabase()), 'suppliersNames')).then((snapshot) => {
        console.log('snapshot', snapshot.val());
        const checkoutNames = snapshot.val() ? snapshot.val() : [];
        resolve(checkoutNames);
      });
    });
  }

  updateSuppliersNames(list: String[]) {
    set(ref(getDatabase(), 'suppliersNames'), list);
  }

  getCheckoutNames() {
    return new Promise((resolve) => {
      get(child(ref(getDatabase()), 'checkoutNames')).then((snapshot) => {
        console.log('snapshot', snapshot.val());
        const checkoutNames = snapshot.val() ? snapshot.val() : [];
        resolve(checkoutNames);
      });
    });
  }

  updateCheckoutNames(list: String[]) {
    set(ref(getDatabase(), 'checkoutNames'), list);
  }
}
