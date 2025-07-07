import { IsEmail, IsString, IsStrongPassword } from "class-validator";

export class RegisterUserDto {
   @IsString()
   fullName: string;

   @IsString()
   identificationNumber: string;

   @IsString()
   positionId: string

   @IsString()
   @IsStrongPassword()
   password: string;
}