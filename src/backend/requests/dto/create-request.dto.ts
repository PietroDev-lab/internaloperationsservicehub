import { IsString, IsIn, IsNotEmpty } from 'class-validator';

export class CreateRequestDto {
  @IsIn(['Official Document', 'Time Off', 'Hardware Request'], {
    message: 'type must be one of: Official Document, Time Off, Hardware Request',
  })
  type!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;
}
