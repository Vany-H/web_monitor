import { IsEmpty, IsString } from 'class-validator';

export class UrlConnectDto {
  @IsString()
  @IsEmpty()
  url: string;
}
