import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UsePipes,
} from '@nestjs/common';
import { ResolutionService } from './resolution.service';
import {
  CreateResolutionDto,
  CreateResolutionValidationPipe,
} from './dto/create-resolution.dto';
import { UpdateResolutionDto } from './dto/update-resolution.dto';

@Controller('api')
export class ResolutionController {
  constructor(private readonly resolutionService: ResolutionService) {}

  @Post()
  @UsePipes(new CreateResolutionValidationPipe())
  create(@Body() createResolutionDto: CreateResolutionDto) {
    return this.resolutionService.create(createResolutionDto);
  }

  @Get()
  findAll() {
    return this.resolutionService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.resolutionService.findById(id);
  }

  @Get('/resolve/:name')
  findByName(@Param('name') name: string) {
    return this.resolutionService.redirect(name);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateResolutionDto: UpdateResolutionDto,
  ) {
    return this.resolutionService.update(id, updateResolutionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.resolutionService.remove(id);
  }
}
