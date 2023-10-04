import { IsString } from 'class-validator';

export class SingUpRequest {
  @IsString()
  account_id: string;
  @IsString()
  password: string;
}
