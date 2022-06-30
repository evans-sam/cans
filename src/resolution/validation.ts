import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { findCurrency, validate } from 'multicoin-address-validator';

@ValidatorConstraint()
export class IsCryptoCurrency implements ValidatorConstraintInterface {
  defaultMessage(validationArguments?: ValidationArguments): string {
    return 'currency must be valid';
  }

  validate(
    value: string,
    args?: ValidationArguments,
  ): Promise<boolean> | boolean {
    return Boolean(findCurrency(value));
  }
}

@ValidatorConstraint()
export class IsCryptoAddress implements ValidatorConstraintInterface {
  defaultMessage(validationArguments?: ValidationArguments): string {
    return 'address must be valid';
  }

  validate(
    value: string,
    args?: ValidationArguments,
  ): Promise<boolean> | boolean {
    const network = args.object['network'];

    if (!findCurrency(network)) return false;
    return Boolean(validate(value, args.object['network']));
  }
}
