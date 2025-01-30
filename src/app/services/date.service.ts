import {Injectable} from '@angular/core';
import {isValid, parse, format} from 'date-fns';
import {fr} from 'date-fns/locale';

@Injectable({
    providedIn: 'root',
})
export class DateService {
    constructor() {
    }

    isDateValid(date: any) {
        return isValid(parse(date, 'yyyy-MM-dd', new Date()));
    }

    formatDate(date: any) {
        if (!this.isDateValid(date)) return date;
        return format(date, 'dd/MM/yyyy');
    }

    customDate(date: any, formatString: any) {
        return format(date, formatString);
    }

    getWeekNumber(date: any) {
        return format(date, 'ww - yyyy', {locale: fr});
    }

    getCurrentDate() {
        return format(new Date(), 'dd/MM/yyyy HH:mm:ss');
    }
}
