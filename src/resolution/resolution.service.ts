import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateResolutionDto } from './dto/create-resolution.dto';
import { UpdateResolutionDto } from './dto/update-resolution.dto';
import { Repository } from 'typeorm';
import { Resolution } from './entities/resolution.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  names,
  NumberDictionary,
  starWars,
  uniqueNamesGenerator,
} from 'unique-names-generator';
import { findCurrency } from 'multicoin-address-validator';

@Injectable()
export class ResolutionService {
  constructor(
    @InjectRepository(Resolution)
    private resolutionRepository: Repository<Resolution>,
  ) {}

  async create(createResolutionDto: CreateResolutionDto): Promise<Resolution> {
    const { symbol } = findCurrency(createResolutionDto.network);

    let name: string;
    let attempts = 1;
    while (true) {
      const numberDictionary = NumberDictionary.generate({
        min: 0,
        max: 10 ** attempts,
      });
      const uniqueName = uniqueNamesGenerator({
        dictionaries: [attempts > 3 ? names : starWars, numberDictionary],
        length: 2,
        separator: '',
        style: 'capital',
      });
      name = `${uniqueName.replace(' ', '')}.${symbol}`;

      const resolution = await this.resolutionRepository.find({
        where: { name: name },
        withDeleted: true,
      });
      if (!resolution?.length) break;
      attempts++;
    }

    const newRes = this.resolutionRepository.create({
      name,
      ...createResolutionDto,
    });

    return await this.resolutionRepository.save(newRes);
  }

  async findAll(): Promise<Resolution[]> {
    return await this.resolutionRepository.find();
  }

  async findById(id: string): Promise<Resolution> {
    return await this.resolutionRepository.findOneBy({ id });
  }

  async redirect(name: string) {
    const resolution = await this.resolutionRepository.findOneBy({
      name,
      active: true,
    });
    if (!resolution) throw new NotFoundException();

    resolution.redirects++;

    this.resolutionRepository
      .save(resolution)
      .then(() =>
        Logger.log(`Resolution ${name} redirected`, ResolutionService.name),
      );

    return {
      network: resolution.network,
      address: resolution.address,
    };
  }

  async update(id: string, updateResolutionDto: UpdateResolutionDto) {
    let resolution = await this.findById(id);
    if (!resolution) throw new NotFoundException();

    this.resolutionRepository.merge(resolution, updateResolutionDto);

    return await this.resolutionRepository.save(resolution);
  }

  async remove(id: string) {
    const resolution = await this.resolutionRepository.findOneBy({
      id,
    });

    if (!resolution) throw new NotFoundException();

    // noinspection ES6MissingAwait
    return await this.resolutionRepository.softRemove(resolution);
  }
}
