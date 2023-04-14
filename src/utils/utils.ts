export class ApiError{
    message: string
    code: number
    constructor(message: string, code: number){
        this.message = message;
        this.code = code;
    }
}

export function asyncLog(target: Object, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
  
    descriptor.value = async function (...args: any) {
      console.log(`${propertyKey}::input ${JSON.stringify(args)}`);
      // tslint:disable-next-line:no-invalid-this
      const result = await originalMethod.apply(this, args);
      console.log(`${propertyKey}::output ${JSON.stringify(result)}`);
      return result;
    };
  
    return descriptor;
  }
  