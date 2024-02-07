import {Injectable} from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts.js';
import {OneWorkerWeek} from "../models/oneWorkerWeek.model";
import {Supply} from "../models/supply.model";
import {WorkerWeek} from "../models/workerWeek.model";
import {Checkout} from "../models/checkout.model";
import {DateService} from "./date.service";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor(private dateService: DateService) {
  }

  generateWeekPdf(week: WorkerWeek) {
    pdfMake.fonts = {
      helvetica: {
        normal:
          'https://cdn.privex.io/fonts/open-sans/OpenSans-Regular.ttf',
        bold:
          'https://cdn.privex.io/fonts/open-sans/OpenSans-Bold.ttf',
      },
    };

    let docDefinition: any = {
      footer: function (currentPage: any, pageCount: any) {
        return {text: currentPage.toString() + ' / ' + pageCount, alignment: 'right', margin: [0, 0, 20, 0]}
      },
      content: [
        {
          columns: [
            {text: `Semaine : ${week.weekNumber} - ${week.year}`, style: 'header'},
            {
              text: `Cash S : ${week.weekNumber - 1} : ${this.conversion(week.previousCheckout)}
            Cash S : ${week.weekNumber} : ${this.conversion(week.currentCheckout)}`, style: 'checkout'
            }
          ]
        },
        {text: 'Liste des ouvriers', style: 'subheader', bold: true},
        this.createWorkerTable(week.workerList),
        {text: week.suppliesList ? 'Fournitures' : '', style: 'subheader', bold: true},
        this.createSuppliesTable(week.suppliesList),
        {
          columns: [
            {
              text: Object.keys(this.createPaiementTable(week.workerList)).length != 0 ? 'Détails des virements' : '',
              style: 'subheader',
              bold: true
            },
            {text: '', width: 5,},
            {text: week.checkoutList ? 'Acomptes' : '', style: 'subheader', bold: true}
          ]
        },
        {
          columns: [
            this.createPaiementTable(week.workerList),
            {text: '', width: 5,},
            this.createCheckoutTable(week.checkoutList)
          ]
        },
        {
          text: Object.keys(this.createRemarkTable(week.workerList)).length != 0 ? 'Remarques' : '',
          style: 'subheader',
          bold: true
        },
        this.createRemarkTable(week.workerList)
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true
        },
        subheader: {
          fontSize: 12,
          margin: [0, 10, 0, 5]
        },
        checkout: {
          alignment: 'right',
          margin: [0, 0, 0, 0]
        },
        tableHeader: {
          alignment: 'center',
          bold: true,
          fillColor: '#FAC9A1'
        },
        tableContent: {
          alignment: 'center',
        },
        tableFooter: {
          alignment: 'center',
          bold: true,
          fillColor: '#FFFFCD'
        }
      },
      defaultStyle: {
        fontSize: 10,
        font: 'helvetica'
      },
      pageMargins: [20, 20, 20, 20],
    };

    pdfMake.createPdf(docDefinition).print();
  }

  generateWorkerPdf(year: any, details: any, supplyList: any, bankPaymentList: any, remarks: any) {
    pdfMake.fonts = {
      helvetica: {
        normal:
          'https://cdn.privex.io/fonts/open-sans/OpenSans-Regular.ttf',
        bold:
          'https://cdn.privex.io/fonts/open-sans/OpenSans-Bold.ttf',
      },
    };
    let currentDate = this.dateService.getCurrentDate();
    console.log(currentDate)

    let docDefinition: any = {
      footer: function (currentPage: any, pageCount: any) {
        return{
          columns: [
            // {
            //   text: currentDate,
            //   alignment: 'left',
            //   margin: [20, 0, 0, 0]
            // },
            {
            text: currentPage.toString() + ' / ' + pageCount,
            alignment: 'right',
            margin: [0, 0, 20, 0]
          }]
        }
      },
      content: [
        {
          text: `${details[0].worker.name} - ${year}`, style: 'header',
          margin: [0, 0, 0, 15]
        },
        this.createWorkerWeeksTable(details, supplyList.length),
        {text: supplyList.length > 0 ? `Fournitures` : '', style: 'subheader'},
        this.createWorkerSuppliesTable(supplyList),
        {text: bankPaymentList.length > 0 ? `Détails des virements` : '', style: 'subheader'},
        this.createWorkerPaiementTable(bankPaymentList),
        {text: remarks.length > 0 ? `Remarques` : '', style: 'subheader'},
        this.createWorkerRemarkTable(remarks)
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true
        },
        subheader: {
          fontSize: 12,
          margin: [0, 10, 0, 5]
        },
        checkout: {
          alignment: 'right',
          margin: [0, 0, 0, 0]
        },
        tableHeader: {
          alignment: 'center',
          bold: true,
          fillColor: '#FAC9A1'
        },
        tableContent: {
          alignment: 'center',
        },
        tableFooter: {
          alignment: 'center',
          bold: true,
          fillColor: '#FFFFCD'
        }
      },
      defaultStyle: {
        fontSize: 10,
        font: 'helvetica'
      },
      pageMargins: [20, 20, 20, 20],
    }
    docDefinition.content.forEach((element: any) => {
      if (element.text === '') {
        docDefinition.content.splice(docDefinition.content.indexOf(element), 1);
      }
    });
    pdfMake.createPdf(docDefinition).print();
  }

  private removePreviousIfEmptyPosition(arr: any) {
    if (arr) {
      for (let i = 0; i < arr?.length; i++) {
        console.log(arr[i]);
        if (arr[i] && Object.keys(arr[i]).length === 0) {
          arr.splice(i - 1, 2);
          i -= 2;
        }
      }
    }
  }


  private createWorkerTable(workerWeekList: OneWorkerWeek[]) {
    let workerTable: any = {
      table: {
        headerRows: 1,
        widths: ['*', 'auto', '*', '*', '*', '*', '*', '*', '*'],
        body: [
          [
            {text: 'NOM', style: 'tableHeader'},
            {text: 'JOUR', style: 'tableHeader'},
            {text: 'SALAIRE', style: 'tableHeader'},
            {text: 'SOLDE', style: 'tableHeader'},
            {text: 'SUPPL.', style: 'tableHeader'},
            {text: 'FOURN.', style: 'tableHeader'},
            {text: 'CASH', style: 'tableHeader'},
            {text: 'BANQUE', style: 'tableHeader'},
            {text: 'SOLDE', style: 'tableHeader'}
          ]
        ]
      }
    };
    workerWeekList.forEach((workerWeek: OneWorkerWeek) => {
      workerTable.table.body.push([
        {text: workerWeek.name, style: 'tableContent'},
        {text: workerWeek.workingDays, style: 'tableContent'},
        {
          text: this.conversion(workerWeek.salary),
          style: 'tableContent',
          color: workerWeek.salary < 0 ? 'red' : 'black'
        },
        {
          text: this.conversion(workerWeek.previousBalance),
          style: 'tableContent',
          color: workerWeek.previousBalance < 0 ? 'red' : 'black'
        },
        {text: this.conversion(workerWeek.extra), style: 'tableContent', color: workerWeek.extra < 0 ? 'red' : 'black'},
        {
          text: this.conversion(workerWeek.cashFromSupplies),
          style: 'tableContent',
          color: workerWeek.cashFromSupplies < 0 ? 'red' : 'black'
        },
        {
          text: this.conversion(workerWeek.paiementCash),
          style: 'tableContent',
          color: workerWeek.paiementCash < 0 ? 'red' : 'black'
        },
        {
          text: this.conversion(workerWeek.paiementBank),
          style: 'tableContent',
          color: workerWeek.paiementBank < 0 ? 'red' : 'black'
        },
        {
          text: this.conversion(workerWeek.currentBalance),
          style: 'tableContent',
          color: workerWeek.currentBalance < 0 ? 'red' : 'black'
        }
      ]);
    });
    workerTable.table.body.push([
      {text: 'TOTAL', colSpan: 2, style: 'tableFooter'},
      {},
      {
        text: this.conversion(workerWeekList.map((workerWeek: OneWorkerWeek) => workerWeek.salary).reduce((acc, value) => acc + value, 0)),
        style: 'tableFooter',
        color: workerWeekList.map((workerWeek: OneWorkerWeek) => workerWeek.salary).reduce((acc, value) => acc + value, 0) < 0 ? 'red' : 'black'
      },
      {
        text: this.conversion(workerWeekList.map((workerWeek: OneWorkerWeek) => workerWeek.previousBalance).reduce((acc, value) => acc + value, 0)),
        style: 'tableFooter',
        color: workerWeekList.map((workerWeek: OneWorkerWeek) => workerWeek.previousBalance).reduce((acc, value) => acc + value, 0) < 0 ? 'red' : 'black'
      },
      {
        text: this.conversion(workerWeekList.map((workerWeek: OneWorkerWeek) => workerWeek.extra).reduce((acc, value) => acc + value, 0)),
        style: 'tableFooter',
        color: workerWeekList.map((workerWeek: OneWorkerWeek) => workerWeek.extra).reduce((acc, value) => acc + value, 0) < 0 ? 'red' : 'black'
      },
      {
        text: this.conversion(workerWeekList.map((workerWeek: OneWorkerWeek) => workerWeek.cashFromSupplies).reduce((acc, value) => acc + value, 0)),
        style: 'tableFooter',
        color: workerWeekList.map((workerWeek: OneWorkerWeek) => workerWeek.cashFromSupplies).reduce((acc, value) => acc + value, 0) < 0 ? 'red' : 'black'
      },
      {
        text: this.conversion(workerWeekList.map((workerWeek: OneWorkerWeek) => workerWeek.paiementCash).reduce((acc, value) => acc + value, 0)),
        style: 'tableFooter',
        color: workerWeekList.map((workerWeek: OneWorkerWeek) => workerWeek.paiementCash).reduce((acc, value) => acc + value, 0) < 0 ? 'red' : 'black'
      },
      {
        text: this.conversion(workerWeekList.map((workerWeek: OneWorkerWeek) => workerWeek.paiementBank).reduce((acc, value) => acc + value, 0)),
        style: 'tableFooter',
        color: workerWeekList.map((workerWeek: OneWorkerWeek) => workerWeek.paiementBank).reduce((acc, value) => acc + value, 0) < 0 ? 'red' : 'black'
      },
      {
        text: this.conversion(workerWeekList.map((workerWeek: OneWorkerWeek) => workerWeek.currentBalance).reduce((acc, value) => acc + value, 0)),
        style: 'tableFooter',
        color: workerWeekList.map((workerWeek: OneWorkerWeek) => workerWeek.currentBalance).reduce((acc, value) => acc + value, 0) < 0 ? 'red' : 'black'
      }
    ]);
    return workerTable;
  }

  private createSuppliesTable(suppliesList: Supply[]) {
    if (!suppliesList || suppliesList.length === 0) {
      return {};
    }
    let suppliesTable: any = {
      table: {
        headerRows: 1,
        widths: ['*', '*', '*', '*', '*'],
        body: [
          [
            {text: 'FOURNITURE', style: 'tableHeader'},
            {text: 'DATE', style: 'tableHeader'},
            {text: 'PAYÉ PAR', style: 'tableHeader'},
            {text: 'POUR', style: 'tableHeader'},
            {text: 'MONTANT', style: 'tableHeader'}
          ]
        ]
      }
    };
    suppliesList.forEach((supply: Supply) => {
      suppliesTable.table.body.push([
        {text: supply.name, style: 'tableContent'},
        {text: this.dateService.formatDate(supply.date), style: 'tableContent'},
        {text: supply.payedBy, style: 'tableContent'},
        {text: supply.payedFor, style: 'tableContent'},
        {text: this.conversion(supply.amount), style: 'tableContent', color: supply.amount < 0 ? 'red' : 'black'}
      ]);
    });
    suppliesTable.table.body.push([
      {text: 'TOTAL', colSpan: 1, border: [true, true, false, true], style: 'tableFooter'},
      {text: '', border: [false, true, false, true], style: 'tableFooter'},
      {text: '', border: [false, true, false, true], style: 'tableFooter'},
      {text: '', border: [false, true, false, true], style: 'tableFooter'},
      {
        text: this.conversion(suppliesList.map((supply: Supply) => supply.amount).reduce((acc, value) => acc + value, 0)),
        style: 'tableFooter',
        color: suppliesList.map((supply: Supply) => supply.amount).reduce((acc, value) => acc + value, 0) < 0 ? 'red' : 'black',
        border: [false, true, true, true],
      }
    ]);
    return suppliesTable;
  }

  private createPaiementTable(week: OneWorkerWeek[]) {
    let paiementTable: any = {
      table: {
        headerRows: 1,
        widths: ['*', '*', '*'],
        body: [
          [
            {text: 'DATE', style: 'tableHeader'},
            {text: 'NOM', style: 'tableHeader'},
            {text: 'MONTANT', style: 'tableHeader'}
          ]
        ]
      }
    };
    week.forEach((worker: OneWorkerWeek) => {
      worker.paiementBankList?.forEach((paiement: any) => {
        if (paiement.amount > 0) {
          paiementTable.table.body.push([
            {text: this.dateService.formatDate(paiement.date), style: 'tableContent'},
            {text: worker.name, style: 'tableContent'},
            {
              text: this.conversion(paiement.amount),
              style: 'tableContent',
              color: paiement.amount < 0 ? 'red' : 'black'
            }
          ]);
        }
      });
    });
    paiementTable.table.body.push([
      {text: 'TOTAL', colSpan: 1, border: [true, true, false, true], style: 'tableFooter'},
      {text: '', border: [false, true, false, true], style: 'tableFooter'},
      {
        text: this.conversion(week.map((worker: OneWorkerWeek) => worker.paiementBank).reduce((acc, value) => acc + value, 0)),
        border: [false, true, true, true],
        style: 'tableFooter',
        color: week.map((worker: OneWorkerWeek) => worker.paiementBank).reduce((acc, value) => acc + value, 0) < 0 ? 'red' : 'black'
      }
    ]);
    if (paiementTable.table.body.length === 2) {
      return {};
    }
    return paiementTable;
  }

  private createCheckoutTable(checkoutList: Checkout[]) {
    if (!checkoutList || checkoutList.length === 0) {
      return {};
    }
    ;
    let checkoutTable: any = {
      table: {
        headerRows: 1,
        widths: ['*', '*', '*'],
        body: [
          [
            {text: 'DATE', style: 'tableHeader'},
            {text: 'NOM', style: 'tableHeader'},
            {text: 'MONTANT', style: 'tableHeader'}
          ]
        ]
      }
    };
    checkoutList.forEach((checkout: Checkout) => {
      checkoutTable.table.body.push([
        {text: this.dateService.formatDate(checkout.date), style: 'tableContent'},
        {text: checkout.name, style: 'tableContent'},
        {text: this.conversion(checkout.amount), style: 'tableContent', color: checkout.amount < 0 ? 'red' : 'black'}
      ]);
    });
    checkoutTable.table.body.push([
      {text: 'TOTAL', colSpan: 1, border: [true, true, false, true], style: 'tableFooter'},
      {text: '', border: [false, true, false, true], style: 'tableFooter'},
      {
        text: this.conversion(checkoutList.map((checkout: Checkout) => checkout.amount).reduce((acc, value) => acc + value, 0)),
        border: [false, true, true, true],
        style: 'tableFooter',
        color: checkoutList.map((checkout: Checkout) => checkout.amount).reduce((acc, value) => acc + value, 0) < 0 ? 'red' : 'black'
      }
    ]);
    return checkoutTable;
  }

  private createRemarkTable(remarkList: OneWorkerWeek[]) {
    let remarkTable: any = {
      table: {
        headerRows: 1,
        widths: [60, '*'],
        body: [
          [
            {text: 'NOM', style: 'tableHeader'},
            {text: 'REMARQUE', style: 'tableHeader', alignment: 'left'}
          ]
        ]
      }
    };
    console.log(remarkList)
    remarkList.forEach((worker: OneWorkerWeek) => {
      if (worker.remark) {
        remarkTable.table.body.push([
          {text: worker.name, style: 'tableContent'},
          {text: worker.remark}
        ]);
      }
    });
    if (remarkTable.table.body.length === 1) {
      return {};
    }
    return remarkTable;
  }


  private conversion(num: any) {
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
      return formatted + (parts ? ',' + parts[1].substr(0, 2) : ',00') + ' €';
    } else {
      return 'Undefined';
    }


  }

  private createWorkerWeeksTable(details: any, supplyListLength: any) {
    let workerWeeksTable: any = {
      table: {
        headerRows: 1,
        widths: ['auto', 'auto', '*', '*', '*', '*', '*', '*', '*', '*'],
        body: [
          [
            {text: 'S', style: 'tableHeader'},
            {text: 'Jour', style: 'tableHeader'},
            {text: 'S/J', style: 'tableHeader'},
            {text: 'Salaire', style: 'tableHeader'},
            {text: 'Solde', style: 'tableHeader'},
            {text: 'Suppl.', style: 'tableHeader'},
            {text: 'Fourn.', style: 'tableHeader'},
            {text: 'Cash', style: 'tableHeader'},
            {text: 'Banque', style: 'tableHeader'},
            {text: 'Solde', style: 'tableHeader'}
          ]
        ]
      }
    };

    details.forEach((week: any) => {
      workerWeeksTable.table.body.push([
        {text: week.weekNumber, style: 'tableContent'},
        {text: week.worker.workingDays, style: 'tableContent'},
        {
          text: this.conversion(week.worker.dailySalary),
          style: 'tableContent',
          color: week.worker.dailySalary < 0 ? 'red' : 'black'
        },
        {
          text: this.conversion(week.worker.salary),
          style: 'tableContent',
          color: week.worker.salary < 0 ? 'red' : 'black'
        },
        {
          text: this.conversion(week.worker.previousBalance),
          style: 'tableContent',
          color: week.worker.previousBalance < 0 ? 'red' : 'black'
        },
        {
          text: this.conversion(week.worker.extra),
          style: 'tableContent',
          color: week.worker.extra < 0 ? 'red' : 'black'
        },
        {
          text: this.conversion(week.worker.cashFromSupplies),
          style: 'tableContent',
          color: week.worker.cashFromSupplies < 0 ? 'red' : 'black'
        },
        {
          text: this.conversion(week.worker.paiementCash),
          style: 'tableContent',
          color: week.worker.paiementCash < 0 ? 'red' : 'black'
        },
        {
          text: this.conversion(week.worker.paiementBank),
          style: 'tableContent',
          color: week.worker.paiementBank < 0 ? 'red' : 'black'
        },
        {
          text: this.conversion(week.worker.currentBalance),
          style: 'tableContent',
          color: week.worker.currentBalance < 0 ? 'red' : 'black'
        }
      ]);
    });
    workerWeeksTable.table.body.push([
      {text: 'TOTAL', colSpan: 3, style: 'tableFooter'},
      {text: '', style: 'tableFooter'},
      {text: '', style: 'tableFooter'},
      {
        text: this.conversion(details.map((week: any) => week.worker.salary).reduce((acc: any, value: any) => acc + value, 0)),
        style: 'tableFooter',
        color: details.map((week: any) => week.worker.salary).reduce((acc: any, value: any) => acc + value, 0) < 0 ? 'red' : 'black'
      },
      {text: '', style: 'tableFooter'},
      {
        text: this.conversion(details.map((week: any) => week.worker.extra).reduce((acc: any, value: any) => acc + value, 0)),
        style: 'tableFooter',
        color: details.map((week: any) => week.worker.extra).reduce((acc: any, value: any) => acc + value, 0) < 0 ? 'red' : 'black'
      },
      {
        text: this.conversion(details.map((week: any) => week.worker.cashFromSupplies).reduce((acc: any, value: any) => acc + value, 0)),
        style: 'tableFooter',
        color: details.map((week: any) => week.worker.cashFromSupplies).reduce((acc: any, value: any) => acc + value, 0) < 0 ? 'red' : 'black'
      },
      {
        text: this.conversion(details.map((week: any) => week.worker.paiementCash).reduce((acc: any, value: any) => acc + value, 0)),
        style: 'tableFooter',
        color: details.map((week: any) => week.worker.paiementCash).reduce((acc: any, value: any) => acc + value, 0) < 0 ? 'red' : 'black'
      },
      {
        text: this.conversion(details.map((week: any) => week.worker.paiementBank).reduce((acc: any, value: any) => acc + value, 0)),
        style: 'tableFooter',
        color: details.map((week: any) => week.worker.paiementBank).reduce((acc: any, value: any) => acc + value, 0) < 0 ? 'red' : 'black'
      },
      {text: '', style: 'tableFooter'},
    ]);

    if (supplyListLength == 0) {
      workerWeeksTable.table.widths = ['auto', 'auto', '*', '*', '*', '*', '*', '*'];
      workerWeeksTable.table.body.forEach((row: any) => {
        row.splice(5, 2);
      });
    }

    return workerWeeksTable;
  }

  private createWorkerSuppliesTable(supplyList: any) {
    if (!supplyList || supplyList.length === 0) {
      return {};
    }
    let suppliesTable: any = {
      table: {
        headerRows: 1,
        widths: ['auto', '*', 150, '*', '*', '*'],
        body: [
          [
            {text: 'SEMAINE', style: 'tableHeader'},
            {text: 'DATE', style: 'tableHeader'},
            {text: 'FOURNISSEUR', style: 'tableHeader'},
            {text: 'PAR', style: 'tableHeader'},
            {text: 'POUR', style: 'tableHeader'},
            {text: 'MONTANT', style: 'tableHeader'}
          ]
        ]
      }
    };
    supplyList.forEach((item: any) => {
      suppliesTable.table.body.push([
        {text: item.weekNumber, style: 'tableContent'},
        {text: this.dateService.formatDate(item.supply.date), style: 'tableContent'},
        {text: item.supply.name, style: 'tableContent'},
        {text: item.supply.payedBy, style: 'tableContent'},
        {text: item.supply.payedFor, style: 'tableContent'},
        {
          text: this.conversion(item.supply.amount),
          style: 'tableContent',
          color: item.supply.amount < 0 ? 'red' : 'black'
        }
      ]);
    });
    suppliesTable.table.body.push([
      {text: 'TOTAL', border: [true, true, false, true], style: 'tableFooter'},
      {text: '', border: [false, true, false, true], style: 'tableFooter'},
      {text: '', border: [false, true, false, true], style: 'tableFooter'},
      {text: '', border: [false, true, false, true], style: 'tableFooter'},
      {text: '', border: [false, true, false, true], style: 'tableFooter'},
      {
        text: this.conversion(supplyList.map((supply: any) => supply.supply.amount).reduce((acc: any, value: any) => acc + value, 0)),
        style: 'tableFooter',
        color: supplyList.map((supply: any) => supply.supply.amount).reduce((acc: any, value: any) => acc + value, 0) < 0 ? 'red' : 'black'
      }
    ]);
    return suppliesTable;
  }

  private createWorkerPaiementTable(bankPaymentList: any) {
    if (!bankPaymentList || bankPaymentList.length === 0) {
      return {};
    }
    let paiementTable: any = {
      table: {
        headerRows: 1,
        widths: ['*', '*', '*'],
        body: [
          [
            {text: 'SEMAINE', style: 'tableHeader'},
            {text: 'DATE', style: 'tableHeader'},
            {text: 'MONTANT', style: 'tableHeader'}
          ]
        ]
      }
    };
    bankPaymentList.forEach((item: any) => {
      paiementTable.table.body.push([
        {text: item.weekNumber, style: 'tableContent'},
        {text: this.dateService.formatDate(item.date), style: 'tableContent'},
        {
          text: this.conversion(item.amount),
          style: 'tableContent',
          color: item.amount < 0 ? 'red' : 'black'
        }
      ]);
    });

    paiementTable.table.body.push([
      {text: 'TOTAL', border: [true, true, false, true], style: 'tableFooter'},
      {text: '', border: [false, true, false, true], style: 'tableFooter'},
      {
        text: this.conversion(bankPaymentList.map((item: any) => item.amount).reduce((acc: any, value: any) => acc + value, 0)),
        style: 'tableFooter',
        color: bankPaymentList.map((item: any) => item.amount).reduce((acc: any, value: any) => acc + value, 0) < 0 ? 'red' : 'black'
      }
    ]);
    return paiementTable;
  }

  private createWorkerRemarkTable(remarks: any) {
    if (!remarks || remarks.length === 0) {
      return {};
    }
    let remarkTable: any = {
      table: {
        headerRows: 1,
        widths: ['auto', '*'],
        body: [
          [
            {text: 'SEMAINE', style: 'tableHeader'},
            {text: 'REMARQUE', style: 'tableHeader', alignment: 'left'}
          ]
        ]
      }
    };
    remarks.forEach((item: any) => {
      remarkTable.table.body.push([
        {text: item.weekNumber, style: 'tableContent'},
        {text: item.remark, style: 'tableContent', alignment: 'left'}
      ]);
    });
    return remarkTable;
  }
}


