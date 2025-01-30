export class OneWorkerWeek {
    constructor(
        public name: string,
        public dailySalary: number,
        public workingDays: number,
        public salary: number,
        public extra: number,
        public paiementCash: number,
        public paiementBank: number,
        public paiementBankList: any,
        public previousBalance: number,
        public currentBalance: number,
        public remark: string,
        public cashFromSupplies: number,
        public totalCash: number
    ) {
    }
}
