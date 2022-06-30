import { Resolution } from '../entities/resolution.entity';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { findCurrency, validate } from 'multicoin-address-validator';

export class CreateResolutionDto
  implements
    Pick<Resolution, 'network' | 'address' | 'expiresAt' | 'maxRedirects'>
{
  @IsString()
  @IsNotEmpty()
  network: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsDate()
  @IsOptional()
  expiresAt?: Date;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  maxRedirects?: number;
}

@Injectable()
export class CreateResolutionValidationPipe implements PipeTransform {
  transform(
    value: CreateResolutionDto,
    metadata: ArgumentMetadata,
  ): CreateResolutionDto {
    const currency = findCurrency(value.network);
    if (!currency) throw new BadRequestException(['currency must be valid']);

    if (!validate(value.address, currency.symbol))
      throw new BadRequestException(['address must be valid']);

    return value;
  }
}
