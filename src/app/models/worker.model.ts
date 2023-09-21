export class Worker {
  constructor(public name: string, public salaire: number) {}

  get getName(): string {
    return this.name;
  }
}
