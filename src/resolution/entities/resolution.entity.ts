import {
  AfterLoad,
  BeforeInsert,
  BeforeRemove,
  BeforeSoftRemove,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsOptional,
  Min,
  Validate,
  validateOrReject,
} from 'class-validator';
import { Logger, UnprocessableEntityException } from '@nestjs/common';
import { IsCryptoAddress, IsCryptoCurrency } from '../validation';

@Entity('resolutions')
export class Resolution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @VersionColumn()
  version: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedDate: Date;

  @IsBoolean()
  @Column({ default: true })
  active: boolean;

  @IsDate()
  @IsOptional()
  @Column({ nullable: true })
  expiresAt?: Date;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Column({ nullable: true })
  maxRedirects?: number;

  @Column({ default: 0 })
  redirects: number;

  @Validate(IsCryptoCurrency)
  @Column()
  network: string;

  @Validate(IsCryptoAddress)
  @Column()
  address: string;

  @Column({ unique: true })
  name: string;

  get isActive(): boolean {
    const isExpired =
      this.expiresAt && this.expiresAt.getUTCMilliseconds() >= Date.now();
    const isDepleted = this.maxRedirects && this.redirects >= this.maxRedirects;
    return !(isExpired || isDepleted);
  }

  @AfterLoad()
  async updateStatus() {
    this.active = this.isActive;
  }

  @BeforeInsert()
  @BeforeUpdate()
  async validate() {
    await this.updateStatus();

    try {
      await validateOrReject(this);
    } catch (e: any) {
      throw new UnprocessableEntityException(e);
    }
  }

  @BeforeRemove()
  @BeforeSoftRemove()
  setInactive() {
    this.active = false;
    Logger.log(`Resolution ${this.name} retired`);
  }
}
