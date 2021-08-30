export class UuidModel {
  value: string = ''

  constructor(value?: string) {
    if (value) {
      this.value = value;
    } else {
      window.api.receive("app-generate-uuid-results", (data: string[]) => {
        if (data && data[0]) {
          this.value = data[0];
        } else {
          console.error('Unable to get UUID...');
        }
      });
      window.api.send("app-generate-uuid", {quantity: 1});
    }
  }
}
