import { IsString } from "class-validator";

export class LoginUserDto {
   @IsString()
   identificationNumber: string;

   @IsString()
   password: string;
}