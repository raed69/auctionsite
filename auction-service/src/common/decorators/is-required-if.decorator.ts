import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsRequiredIf(
  property: string,
  value: any,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isRequiredIf',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(val: any, args: ValidationArguments) {
          const obj = args.object as any;
          if (obj[property] === value) {
            return val !== undefined && val !== null && val !== '';
          }
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} is required when ${property} is ${value}`;
        },
      },
    });
  };
}
