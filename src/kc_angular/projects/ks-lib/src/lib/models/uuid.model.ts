export class UuidModel {
  value: string = ''

  constructor(value: string) {
    if (value) {
      this.value = value;
    }
  }
}
