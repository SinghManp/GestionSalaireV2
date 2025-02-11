import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {Checkout} from 'src/app/models/checkout.model';
import {OneWorkerWeek} from 'src/app/models/oneWorkerWeek.model';
import {Supply} from 'src/app/models/supply.model';
import {WorkerWeek} from 'src/app/models/workerWeek.model';
import {WorkerWeekService} from 'src/app/services/worker-week.service';
import {WorkersService} from 'src/app/services/workers.service';
import * as $ from 'jquery';
import {FirebaseDataService} from 'src/app/services/firebase-data.service';
import {DateService} from 'src/app/services/date.service';

@Component({
    selector: 'app-week-form',
    templateUrl: './week-form.component.html',
    styleUrls: ['./week-form.component.scss'],
})
export class WeekFormComponent implements OnInit, OnDestroy {
    workerWeekForm!: FormGroup;
    workers: any = [];
    payerName: string[] = [];
    list!: OneWorkerWeek[];
    checkoutList: any;
    suppliesList: any;
    weekSubscription!: Subscription;
    weekNumber: number = 1;
    checkoutTotal!: number;

    allPreviousSoldeTotal!: number;
    allCurrentSoldeTotal!: number;
    allSalary!: number;
    allExtraTotal!: number;
    allCashTotal!: number;
    allBankTotal!: number;
    allSuppliesTotal!: number;
    allCheckoutTotal!: number;
    allPaiementCashTotal!: number;
    allCashFromSuppliesTotal!: number;

    week!: WorkerWeek;

    checkoutNames: any = [];
    supplierNames: any = [];

    isNewYear: boolean = false;
    tryToSave: boolean = false;
    isSaved: boolean = false;
    openAt = new Date().toUTCString();

    timeoutList: any = [];

    minuteur = 0;

    constructor(
        private formBuilder: FormBuilder,
        private workWeekService: WorkerWeekService,
        private workersSerivce: WorkersService,
        private firebaseService: FirebaseDataService,
        private route: ActivatedRoute,
        private router: Router,
        private dateService: DateService
    ) {
    }

    async ngOnInit() {
        this.initForm();
        await this.initWorkers();

        this.firebaseService.getCheckoutNames().then((names: any) => {
            this.checkoutNames = names;
        });

        this.firebaseService.getSuppliersNames().then((names: any) => {
            this.supplierNames = names;
        });

        if (this.route.snapshot.params['id'] != undefined) {
            this.weekNumber = +this.route.snapshot.params['id'];
            this.workWeekService.getSingleWeek(this.weekNumber).then((week) => {
                this.existingItem(week);
            });
        } else {
            this.getLastWeek();
        }
        this.initKeyPress();
        setTimeout(() => {
            this.computeCheckoutTotal();
            this.computeSuppliesTotal();
        }, 500);
        this.workWeekService.openWeek(this.weekNumber);
        this.checkIfUserEditing();

        this.ifCloseWindow = this.ifCloseWindow.bind(this);
        window.addEventListener('beforeunload', this.ifCloseWindow);
    }

    ifCloseWindow(e: BeforeUnloadEvent) {
        if (typeof this.workWeekService.closeWeek === 'function') {
            this.workWeekService.closeWeek(this.weekNumber, !this.isSaved);
        }
        e.returnValue = '';
    }

    ngOnDestroy() {
        if (this.weekSubscription != undefined) {
            this.weekSubscription.unsubscribe();
        }
        this.workWeekService.closeWeek(this.weekNumber, !this.isSaved);

        this.clearAllTimeout();
        window.removeEventListener('beforeunload', this.ifCloseWindow);
    }

    async getLastWeek() {
        const workerWeek: any = await this.workWeekService.getLastWeek();

        if (!workerWeek || workerWeek.length === 0) {
            return;
        }

        // Assuming the last entry in workerWeek array is the last week.
        const lastWeek = workerWeek[workerWeek.length - 1];

        // Update weekNumber and handle year overflow.
        this.weekNumber = lastWeek.weekNumber + 1;

        if (this.weekNumber > this.nbWeeks(lastWeek.year)) {
            const newYear = lastWeek.year + 1;
            await this.workWeekService.getWeekListFromFirebase(newYear);
            this.weekNumber = 1;
            this.isNewYear = true;
            lastWeek.year = newYear;
        }

        this.week = lastWeek;
        this.existingItemNewWeek();
    }

    nbWeeks(year: any) {
        var d = new Date(Date.UTC(year, 11, 28));
        var dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        var result = Math.ceil(
            ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
        );

        return result;
    }

    initForm() {
        this.workerWeekForm = this.formBuilder.group({
            weekNumber: this.weekNumber,
            year: new Date().getFullYear(),
            previousCheckout: 0,
            currentCheckout: 0,
            workerList: this.formBuilder.array([]),
            checkoutList: this.formBuilder.array([]),
            suppliesList: this.formBuilder.array([]),
        });
    }

    existingItemNewWeek() {
        const {year, currentCheckout, workerList} = this.week;

        if (year) this.workerWeekForm.get('year')?.setValue(year);
        this.workerWeekForm.get('previousCheckout')?.setValue(currentCheckout);
        this.workerWeekForm.get('currentCheckout')?.setValue(currentCheckout);

        for (const worker of workerList) {
            this.addWorkerToForm(worker);
            this.removeWorkerFromList(worker.name);
        }

        this.computeAllTotal();
    }

    addWorkerToForm(worker: any) {
        const workerGroup = this.formBuilder.group({
            name: [worker.name, Validators.required],
            workingDays: [0, Validators.required],
            dailySalary: [this.getDailySalary(worker.name), Validators.required],
            salary: 0.0,
            previousBalance: +worker.currentBalance,
            extra: 0.0,
            paiementCash: [0, Validators.required],
            cashFromSupplies: 0.0,
            totalCash: 0.0,
            paiementBank: 0,
            paiementBankList: this.formBuilder.array([this.paiementBank()]),
            currentBalance: +worker.currentBalance,
            remark: '',
        });

        this.getWorkerList().push(workerGroup);
    }

    getDailySalary(worker: string) {
        return this.workersSerivce.getSingleWorkerSalary(worker);
    }

    existingItem(week: any) {
        this.setFormValues(week);

        if (this.list) {
            this.list.forEach((worker) => {
                this.addWorkerToFormula(worker);
                this.removeWorkerFromList(worker.name);
            });
        }

        this.checkoutList?.forEach((checkout: any) =>
            this.addCheckoutToForm(checkout)
        );

        this.suppliesList?.forEach((supply: any) => this.addSupplyToForm(supply));

        this.computeAllTotal();
    }

    setFormValues(week: any) {
        if (week.year) this.workerWeekForm.get('year')?.setValue(week.year);
        this.workerWeekForm
            .get('previousCheckout')
            ?.setValue(week.previousCheckout);
        this.workerWeekForm.get('currentCheckout')?.setValue(week.currentCheckout);
        this.list = week.workerList;
        this.checkoutList = week.checkoutList;
        this.suppliesList = week.suppliesList;
    }

    addWorkerToFormula(worker: any) {
        this.getWorkerList().push(
            this.formBuilder.group({
                name: [worker['name'], Validators.required],
                workingDays: [worker['workingDays'], Validators.required],
                dailySalary: [worker['dailySalary'], Validators.required],
                salary: worker['salary'],
                extra: [worker['extra'], Validators.nullValidator],
                paiementCash: [worker['paiementCash'], Validators.required],
                cashFromSupplies: worker['cashFromSupplies'],
                totalCash: worker['totalCash'],
                paiementBank: worker['paiementBank'],
                paiementBankList: this.formBuilder.array(
                    this.initPaiementBank(worker['paiementBankList'])
                ),
                previousBalance: +worker['previousBalance'],
                currentBalance: +worker['currentBalance'],
                remark: worker['remark'],
            })
        );
    }

    addCheckoutToForm(checkout: Checkout) {
        this.getCheckoutList().push(
            this.formBuilder.group({
                date: [checkout.date, Validators.required],
                name: [checkout.name, Validators.required],
                amount: [checkout.amount, Validators.required],
            })
        );
    }

    addSupplyToForm(supply: Supply) {
        this.getSuppliesList().push(
            this.formBuilder.group({
                name: [supply.name, Validators.required],
                date: [supply.date, Validators.required],
                payedBy: [supply.payedBy, Validators.required],
                payedFor: [supply.payedFor, Validators.required],
                amount: [supply.amount, Validators.required],
            })
        );
    }

    createItem(aName: string, aSalary: number) {
        return this.formBuilder.group({
            name: aName,
            workingDays: [0, Validators.required],
            dailySalary: [aSalary, Validators.required],
            salary: 0,
            previousBalance: 0,
            extra: [0, Validators.nullValidator],
            paiementCash: [0, Validators.required],
            cashFromSupplies: 0,
            totalCash: 0,
            paiementBank: 0,
            paiementBankList: this.formBuilder.array([this.paiementBank()]),
            currentBalance: 0,
            remark: '',
        });
    }

    createCheckout() {
        return this.formBuilder.group({
            date: [
                this.dateService.customDate(new Date(), 'yyyy-MM-dd'),
                Validators.required,
            ],
            name: ['', Validators.required],
            amount: [0, Validators.required],
        });
    }

    createSupply() {
        return this.formBuilder.group({
            name: ['', Validators.required],
            date: [
                this.dateService.customDate(new Date(), 'yyyy-MM-dd'),
                Validators.required,
            ],
            payedBy: ['', Validators.required],
            payedFor: ['', Validators.required],
            amount: [0, Validators.required],
        });
    }

    paiementBank() {
        return this.formBuilder.group({
            amount: [0, Validators.required],
            date: [
                this.dateService.customDate(new Date(), 'yyyy-MM-dd'),
                Validators.required,
            ],
        });
    }

    initPaiementBank(paiementBankList: any) {
        let arrayP: any = [];
        if (paiementBankList) {
            paiementBankList.forEach((element: any) => {
                arrayP.push(
                    this.formBuilder.group({
                        date: [element.date, Validators.required],
                        amount: [element.amount, Validators.required],
                    })
                );
            });
        }
        return arrayP;
    }

    onSaveWorker() {
        this.tryToSave = true;
        if (this.workerWeekForm.valid) {
            this.saveCheckoutNames();
            this.saveSupplierNames();
            this.workerWeekForm.get('weekNumber')?.setValue(+this.weekNumber);
            this.workWeekService.closeWeek(this.weekNumber, false);
            this.workWeekService.saveWorkersWeek(this.workerWeekForm.value);
            this.isSaved = true;
            this.workWeekService.updateAllWeeks();
            this.router.navigate(['/week', this.weekNumber]);
        }
    }

    saveCheckoutNames() {
        let isNewCheckoutName: boolean = false;
        this.workerWeekForm.value.checkoutList.forEach((element: any) => {
            if (this.checkoutNames.indexOf(element.name) == -1) {
                this.checkoutNames.push(element.name);
                isNewCheckoutName = true;
            }
        });

        if (isNewCheckoutName) {
            this.firebaseService.updateCheckoutNames(this.checkoutNames);
        }
    }

    saveSupplierNames() {
        let isNewSupplierName: boolean = false;
        this.workerWeekForm.value.suppliesList.forEach((element: any) => {
            if (this.supplierNames.indexOf(element.name) == -1) {
                this.supplierNames.push(element.name);
                isNewSupplierName = true;
            }
        });

        if (isNewSupplierName) {
            this.firebaseService.updateSuppliersNames(this.supplierNames);
        }
    }

    goBack() {
        this.router.navigate(['/week', this.weekNumber]);
    }

    getWorkerList(): FormArray {
        return this.workerWeekForm.get('workerList') as FormArray;
    }

    getCheckoutList(): FormArray {
        return this.workerWeekForm.get('checkoutList') as FormArray;
    }

    getSuppliesList(): FormArray {
        return this.workerWeekForm.get('suppliesList') as FormArray;
    }

    onSelect(event: any) {
        const name = event.target.value;
        let salary = this.workersSerivce.getSingleWorkerSalary(name);
        this.getWorkerList().push(this.createItem(name, salary));
        this.removeWorkerFromList(name);
    }

    onRemoveWorker(nb: number) {
        const workerName = this.workerWeekForm.get('workerList')?.value[nb]['name'];
        if (prompt('Tapez "' + workerName + '" pour supprimer') == workerName) {
            this.workers.push(workerName);
            this.getWorkerList().removeAt(nb);
            this.computeAllTotal();
        }
    }

    onRemoveCheckout(nb: number) {
        if (confirm('Voulez vous vraiment supprimer ?')) {
            this.getCheckoutList().removeAt(nb);
            this.computeCheckoutTotal();
        }
    }

    onRemoveSupply(nb: number) {
        if (confirm('Voulez vous vraiment supprimer ?')) {
            this.getSuppliesList().removeAt(nb);
            this.countExtra();
        }
    }

    initWorkers() {
        return new Promise((resolve, reject) => {
            this.workersSerivce.getWorkersNames().then((workers: any) => {
                this.workers = workers;
                this.payerName = workers.slice();
                this.payerName.splice(0, 0, 'EGR');
                resolve(true);
            });
        });
    }

    removeWorkerFromList(name: string) {
        let index = this.workers.indexOf(name);
        if (index != -1) this.workers.splice(index, 1);
    }

    addNewCheckout() {
        this.getCheckoutList().push(this.createCheckout());
        this.checkoutList = true;
    }

    addNewSupply() {
        this.getSuppliesList().push(this.createSupply());
        this.suppliesList = true;
    }

    addBankPaiement(i: any) {
        i.get('paiementBankList').push(this.paiementBank());
    }

    removeBankPaiement(i: any, index: number) {
        i.get('paiementBankList').removeAt(index);
        this.onPaiementBankChange(i);
    }

    clearAllTimeout() {
        this.timeoutList.forEach((timeout: any) => {
            clearTimeout(timeout);
        });
    }

    onWorkingDaysChange(i: number) {
        const path = 'workerList.' + i;
        const worker = this.workerWeekForm.get(path)?.value;
        this.workerWeekForm
            .get(path + '.workingDays')
            ?.setValue(worker?.workingDays ?? 0);
    }

    onSupplyAmountChange(i: any) {
        const path = 'suppliesList.' + i + '.amount';
        const supply = this.workerWeekForm.get(path)?.value;
        this.workerWeekForm.get(path)?.setValue(supply ?? 0);
    }

    onDailySalatyChange(i: any) {
        const path = 'workerList.' + i + '.dailySalary';
        const worker = this.workerWeekForm.get(path)?.value;
        this.workerWeekForm.get(path)?.setValue(worker ?? 0);
    }

    onPaiementBankAmountChange(i: any, index: number) {
        const amount = i.get('paiementBankList').value[index].amount;
        i.get('paiementBankList.' + index + '.amount')?.setValue(amount ?? 0);
    }

    countWorkerSalary(nb: number) {
        const basePath = 'workerList.' + nb;
        const dailySalaryPath = basePath + '.dailySalary';

        const dailySalary = this.workerWeekForm.get(dailySalaryPath)?.value ?? 0;

        const worker = this.workerWeekForm.get(basePath)?.value;
        const workingDays = worker?.workingDays ?? 0;

        const salary = workingDays * dailySalary;
        this.workerWeekForm.get(basePath + '.salary')?.setValue(+salary.toFixed(2));

        this.countWorkerTotal(nb);
    }

    countExtra() {
        const suppliesList = this.workerWeekForm.get('suppliesList')?.value || [];
        let listPayedBy = {};
        let listPayedFor = {};

        suppliesList.forEach((supply: any) => {
            if (supply.payedBy && supply.payedFor) {
                this.updateAmounts(listPayedBy, supply.payedBy, supply.amount);
                if (supply.payedFor !== 'EGR' || supply.payedBy !== 'EGR') {
                    this.updateAmounts(listPayedFor, supply.payedFor, supply.amount);
                }
            }
        });

        this.updateInputs(listPayedBy, listPayedFor);
        this.computeSuppliesTotal();
    }

    updateAmounts(list: any, key: any, amount: any) {
        if (list[key]) {
            list[key] = +(list[key] + amount).toFixed(2);
        } else {
            list[key] = amount;
        }
    }

    updateInputs(listPayedBy: any, listPayedFor: any) {
        let workerList = this.workerWeekForm.get('workerList')?.value;
        for (let cpt = 0; cpt < workerList.length; cpt++) {
            this.workerWeekForm.get('workerList.' + cpt + '.extra')?.setValue(0);
            this.workerWeekForm
                .get('workerList.' + cpt + '.cashFromSupplies')
                ?.setValue(0);
            this.setCashTotal(cpt);
        }
        this.setExtraIntoInput(listPayedBy);
        this.setCashFromSupplies(listPayedFor);
    }

    setExtraIntoInput(listPayedBy: any) {
        for (const name in listPayedBy) {
            const workerIndex = this.findWorkerIndex(name);
            this.workerWeekForm
                .get('workerList.' + workerIndex + '.extra')
                ?.setValue(listPayedBy[name]);
        }
    }

    setCashFromSupplies(listPayedFor: any) {
        for (const name in listPayedFor) {
            const workerIndex = this.findWorkerIndex(name);
            this.workerWeekForm
                .get('workerList.' + workerIndex + '.cashFromSupplies')
                ?.setValue(listPayedFor[name]);
            this.setCashTotal(workerIndex);
        }
    }

    setCashTotal(index: any) {
        let cash1 = this.workerWeekForm.get(
            'workerList.' + index + '.paiementCash'
        )?.value;

        if (cash1 == null) {
            this.workerWeekForm
                .get('workerList.' + index + '.paiementCash')
                ?.setValue(0);
        }

        this.workerWeekForm
            .get('workerList.' + index + '.totalCash')
            ?.setValue(cash1);

        this.countWorkerSalary(index);
    }

    findWorkerIndex(workerName: string) {
        let workerList = this.workerWeekForm.get('workerList')?.value;
        for (let cpt = 0; cpt < workerList.length; cpt++) {
            if (workerList[cpt].name == workerName) {
                return cpt;
            }
        }
        return -1;
    }

    countCurrentCheckout() {
        const currentCheckout =
            this.workerWeekForm.get('previousCheckout')?.value +
            this.allCheckoutTotal +
            // this.allSuppliesTotal +
            // this.allExtraTotal
            -this.allCashTotal;

        this.workerWeekForm
            .get('currentCheckout')
            ?.setValue(+currentCheckout.toFixed(2));
    }

    countWorkerTotal(workerIndex: any) {
        let total: number = 0;
        let worker = this.workerWeekForm.get('workerList')?.value[workerIndex];
        if (worker == undefined) {
            return;
        }

        total += worker.salary;
        total += worker.previousBalance;
        total += worker.extra;
        total -= worker.cashFromSupplies;
        total -= worker.totalCash;
        total -= worker.paiementBank;

        this.workerWeekForm
            .get('workerList.' + workerIndex + '.currentBalance')
            ?.setValue(+total.toFixed(2));
        this.computeAllTotal();
    }

    computeAllTotal() {
        const workerList = this.workerWeekForm.get('workerList')?.value || [];

        this.allPreviousSoldeTotal = this.calculateTotal(
            workerList,
            'previousBalance'
        );
        this.allCurrentSoldeTotal = this.calculateTotal(
            workerList,
            'currentBalance'
        );
        this.allSalary = this.calculateTotal(workerList, 'salary');
        this.allExtraTotal = this.calculateTotal(workerList, 'extra');
        this.allCashTotal = this.calculateTotal(workerList, 'totalCash');
        this.allBankTotal = this.calculateTotal(workerList, 'paiementBank');
        this.allPaiementCashTotal = this.calculateTotal(workerList, 'paiementCash');
        this.allCashFromSuppliesTotal = this.calculateTotal(
            workerList,
            'cashFromSupplies'
        );

        this.countCurrentCheckout();
    }

    calculateTotal(workerList: any[], field: string): number {
        const total = workerList.reduce(
            (acc, worker) => acc + (worker[field] || 0),
            0
        );
        return +total.toFixed(2);
    }

    computeSuppliesTotal() {
        this.allSuppliesTotal = 0;
        for (
            let index = 0;
            index < this.workerWeekForm.get('suppliesList')?.value.length;
            index++
        ) {
            this.allSuppliesTotal += +this.workerWeekForm.get(
                'suppliesList.' + index + '.amount'
            )?.value;
        }
        this.allSuppliesTotal = +this.allSuppliesTotal.toFixed(2);
        this.countCurrentCheckout();
    }

    computeCheckoutTotal() {
        this.allCheckoutTotal = 0;
        for (
            let index = 0;
            index < this.workerWeekForm.get('checkoutList')?.value.length;
            index++
        ) {
            this.allCheckoutTotal += +this.workerWeekForm.get(
                'checkoutList.' + index + '.amount'
            )?.value;
        }
        this.allCheckoutTotal = +this.allCheckoutTotal.toFixed(2);
        this.countCurrentCheckout();
    }

    showCashOnly(i: any) {
        if ($('#cashTotal' + i).is(':visible')) {
            $('#cashTotal' + i).hide();
            $('#cash' + i).show();
            $('#cash' + i).fadeIn();
        } else {
            $('#cash' + i).hide();
            $('#cashTotal' + i).show();
        }
    }

    showPaiementDate(i: any) {
        if ($('.headDetails' + i).is(':visible')) {
            $('#close' + i).hide();
            $('.headDetails' + i).hide();
        } else {
            for (let index = 0; index < this.getWorkerList().length; index++) {
                $('#close' + index).hide();
                $('.headDetails' + index).hide();
            }
            $('#close' + i).show();
            $('.headDetails' + i).show();
        }
    }

    showDetails(i: any) {
        if ($('.details' + i).is(':visible')) {
            $('.headDetails' + i).hide();
            $('.details' + i).hide();
            $('#close' + i).hide();
            $('.td' + i).show();
        } else {
            for (let index = 0; index < this.getWorkerList().length; index++) {
                $('#close' + index).hide();
                $('.headDetails' + index).hide();
                $('#close' + index).hide();
            }
            $('.headDetails' + i).show();
            $('.details' + i).show();
            $('#close' + i).show();
            $('.td' + i).hide();
        }
    }

    initKeyPress() {
        let shiftPressed = false;
        $('#workers').on('keydown', 'input, select', function (e) {
            if (e.key === 'Enter') {
                var self = $(this),
                    form = self.parents('form:eq(0)'),
                    focusable,
                    next;
                focusable = form.find('input#nbDays').filter(':visible');
                let offset = shiftPressed ? -2 : 2;
                next = focusable.eq(focusable.index(this) + offset);
                if (next.length) {
                    next.focus();
                }
                return false;
            } else if (e.keyCode == 9) {
                var self = $(this),
                    form = self.parents('form:eq(0)'),
                    focusable,
                    next;
                focusable = form.find('input#nbDays').filter(':visible');
                let offset = shiftPressed ? -1 : 1;
                next = focusable.eq(focusable.index(this) + offset);
                if (next.length) {
                    next.focus();
                }
                return false;
            } else if (e.keyCode == 16) {
                shiftPressed = true;
                setTimeout(() => {
                    shiftPressed = false;
                }, 500);
                return true;
            } else {
                return true;
            }
        });
        $('#supply').on('keydown', 'input, select', function (e: any) {
            if (e.key === 'Enter') {
                var self = $(this),
                    form = self.parents('form:eq(0)'),
                    focusable,
                    next;
                focusable = form
                    .find('input,a,select,button,textarea')
                    .filter(':visible');
                next = focusable.eq(focusable.index(this) + 6);
                if (next.length) {
                    next.focus();
                }
                return false;
            }
            return true;
        });
        $('#checkout').on('keydown', 'input, select', function (e: any) {
            if (e.key === 'Enter') {
                var self = $(this),
                    form = self.parents('form:eq(0)'),
                    focusable,
                    next;
                focusable = form
                    .find('input,a,select,button,textarea')
                    .filter(':visible');
                next = focusable.eq(focusable.index(this) + 4);
                if (next.length) {
                    next.focus();
                }
                return false;
            }
            return true;
        });
    }

    onPaiementBankChange(i: any) {
        let val = i.get('paiementBankList').value;
        let totalPaiementBank = 0;
        for (let index = 0; index < val.length; index++) {
            totalPaiementBank += val[index].amount;
        }
        i.get('paiementBank').setValue(+totalPaiementBank.toFixed(2));
    }

    onDateChange(i: any, index: any) {
        let val = i.get('paiementBankList').value;
        let date = val[index].date;
        let convertDate = this.stringToDateFormat(date);
        if (date != convertDate) {
            val[index].date = convertDate;
            i.get('paiementBankList').setValue(val);
        }
    }

    stringToDateFormat(date: string) {
        if (date[1] == '/') {
            date = 0 + date;
        }
        switch (date.length) {
            case 2:
                if (parseInt(date) > 31 || parseInt(date) < 1) {
                    date = '';
                }
                break;
            case 3:
                if (date[2] != '/') {
                    date = date.substring(0, 2) + '/' + date[2];
                }
                break;
            case 5:
                if (date[4] == '/') {
                    date = date.substring(0, 3) + 0 + date[3];
                }
                let month = date.substring(3, 5);
                if (parseInt(month) > 12 || parseInt(month) < 1) {
                    date = date.substring(0, 3);
                } else {
                    date += '/' + new Date().getFullYear();
                }
                break;
            case 6:
                date = date.substring(0, 4);
                break;
            default:
                break;
        }
        return date;
    }

    conversion(num: any) {
        if (num != undefined) {
            var str = num.toString().replace('$', ''),
                parts: any = false,
                output = [],
                i = 1,
                formatted = null;
            if (str.indexOf('.') > 0) {
                parts = str.split('.');
                str = parts[0];
                while (parts[1].length < 3) {
                    parts[1] += '0';
                }
            }
            str = str.split('').reverse();
            for (var j = 0, len = str.length; j < len; j++) {
                if (str[j] != ' ') {
                    output.push(str[j]);
                    if (i % 3 == 0 && j < len - 1) {
                        output.push(' ');
                    }
                    i++;
                }
            }
            formatted = output.reverse().join('');
            return formatted + (parts ? ',' + parts[1].substr(0, 2) : ',00');
        } else {
            return 'Undefined';
        }
    }

    getPaiementBankList(worker: any) {
        return worker.get('paiementBankList').controls;
    }

    getCheckoutListForm(index: number, value: string) {
        return (this.workerWeekForm.get('checkoutList') as any).controls[index]
            .controls[value];
    }

    getSuppliesListForm(index: number, value: string) {
        return (this.workerWeekForm.get('suppliesList') as any).controls[index]
            .controls[value];
    }

    getWorkerListForm(index: number, value: string) {
        return (this.workerWeekForm.get('workerList') as any).controls[index]
            .controls[value];
    }

    checkIfUserEditing() {
        let maimTimeout = setTimeout(() => {
            let modal = document.getElementById('myModal');
            modal?.classList.add('in');
            modal?.setAttribute('style', 'display: block;');

            let timeout = setTimeout(() => {
                this.goToHome();
            }, 60000);

            this.minuteur = 60;
            const intervalTime = setInterval(() => {
                this.minuteur--;
            }, 1000);

            this.timeoutList.push(intervalTime);
            this.timeoutList.push(timeout);
        }, 240000);

        this.timeoutList.push(maimTimeout);
    }

    userConnected() {
        this.clearAllTimeout();
        let modal = document.getElementById('myModal');
        modal?.classList.remove('in');
        modal?.setAttribute('style', 'display: none;');
        this.workWeekService.openWeek(this.weekNumber, false);
        this.checkIfUserEditing();
    }

    goToHome() {
        this.router.navigate(['/weeks']);
    }
}
