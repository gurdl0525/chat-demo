import { IsOptional, IsString } from 'class-validator';

export class CreateChatRoomRequest {
  @IsString()
  account_id: string;
  @IsOptional()
  @IsString()
  room_name: string;
}

export class SendChatRequest {
  @IsString()
  room_id: string;
  @IsString()
  text: string;
}
