import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import {PdfService} from "../services/pdf.service";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
    selector: 'app-print-popup',
    templateUrl: './print-popup.component.html',
    styleUrls: ['./print-popup.component.scss']
})
export class PrintPopupComponent implements OnInit, OnChanges {

    @Input() printOptions: any;
    @Input() printType: "week" | "worker" = "week";

    @Output() close = new EventEmitter<void>();


    printForm: FormGroup = this.formBuilder.group({
        details: [true, Validators.required],
        supplyList: [true, Validators.required],
        bankPaiementList: [true, Validators.required],
        remarksList: [true, Validators.required],

        detailsBreakPage: [false, Validators.required],
        supplyListBreakPage: [false, Validators.required],
        bankPaiementListBreakPage: [false, Validators.required],
        remarksListBreakPage: [false, Validators.required],
    });

    constructor(
        private pdfService: PdfService,
        private formBuilder: FormBuilder
    ) {
    }

    ngOnChanges() {
        console.log('printType', this.printType);
        if (this.printType === "week") {
            this.printWeek();
        } else if (this.printType === "worker") {
            this.printWorker();
            this.countNoEmptyElement();
        } else {
            console.error('printType not found');
        }
    }

    ngOnInit() {
        this.initForm();
    }

    initForm() {
        this.printForm = this.formBuilder.group({
            details: [true, Validators.required],
            supplyList: [true, Validators.required],
            bankPaiementList: [true, Validators.required],
            remarksList: [true, Validators.required],

            detailsBreakPage: [false, Validators.required],
            supplyListBreakPage: [false, Validators.required],
            bankPaiementListBreakPage: [false, Validators.required],
            remarksListBreakPage: [false, Validators.required],
        });
    }

    closeModal(): void {
        this.close.emit();
    }

    private printWeek() {

    }

    private printWorker() {
        console.log('printOptions', this.printOptions);
    }

    print() {

        console.log('printForm', this.printForm.value);

        this.pdfService.generateWorkerPdf(
            this.printOptions.year,
            this.printOptions.details,
            this.printOptions.supplyList,
            this.printOptions.bankPaiementList,
            this.printOptions.remarksList,
            this.printForm.value);

        this.closeModal()
    }

    countNoEmptyElement() {
        let count = 0;
        for (let key in this.printOptions) {
            if (this.printOptions[key] !== null && this.printOptions[key] !== '' && this.printOptions[key].length != 0) {
                count++;
            }
        }

        if (count <= 2) {
            print()
        }
    }

}
