import { IsString, IsIn, IsOptional } from 'class-validator';
import type { RequestStatus } from '../requests.service';

export class UpdateStatusDto {
  @IsIn(['Received', 'In Progress', 'Resolved'], {
    message: 'Invalid status value',
  })
  status!: RequestStatus;

  @IsString()
  @IsOptional()
  hrMessage?: string;
}
