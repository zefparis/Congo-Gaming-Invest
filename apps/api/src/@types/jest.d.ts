// This file is used to provide type definitions for Jest
declare const expect: jest.Expect;
declare const it: jest.It;
declare const describe: jest.Describe;
declare const beforeAll: jest.Lifecycle;
declare const afterAll: jest.Lifecycle;
declare const beforeEach: jest.Lifecycle;
declare const afterEach: jest.Lifecycle;

declare namespace jest {
  interface Matchers<R> {
    toBe(expected: any): R;
    toEqual(expected: any): R;
    toBeDefined(): R;
    toBeUndefined(): R;
    toBeNull(): R;
    toBeTruthy(): R;
    toBeFalsy(): R;
    toBeGreaterThan(expected: number): R;
    toBeLessThan(expected: number): R;
    toHaveBeenCalled(): R;
    toHaveBeenCalledWith(...args: any[]): R;
    toMatchSnapshot(): R;
    toThrow(error?: any): R;
    toThrowError(error?: any): R;
  }
}
