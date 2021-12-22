import { CountdownPipe } from './countdown.pipe';

describe('CountdownPipe', () => {
  it('create an instance', () => {
    const pipe = new CountdownPipe();
    expect(pipe).toBeTruthy();
  });
});
