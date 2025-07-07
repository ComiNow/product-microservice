import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { envs } from 'src/config/envs';
import { LoginUserDto, RegisterUserDto } from './dto';
import { catchError } from 'rxjs';
import { AuthGuard } from './guards/auth.guard';
import { Token, User } from './decorators';
import { CurrentUser } from './interface/current-user.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(envs.natsServiceName) private readonly client: ClientProxy,
  ) {}

  @Post('register')
  @ApiCreatedResponse({
    description: 'The user has been successfully created.',
  })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  async registerUser(@Body() registerUserDto: RegisterUserDto) {
    return this.client.send('auth.register.user', registerUserDto).pipe(
      catchError((error) => {
        throw new RpcException(error.message);
      }),
    );
  }

  @Post('login')
  async loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.client.send('auth.login.user', loginUserDto).pipe(
      catchError((error) => {
        throw new RpcException(error.message);
      }),
    );
  }

  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: 'Unauthorized Bearer Auth',
  })
  @UseGuards(AuthGuard)
  @Get('verify')
  async verifyToken(@User() user: CurrentUser, @Token() token: string) {
    return { user, token };
  }

  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: 'Unauthorized Bearer Auth',
  })
  @Get('modules')
  async getAllModules() {
    return this.client.send('auth.get.modules', {}).pipe(
      catchError((error) => {
        throw new RpcException(error.message);
      }),
    );
  }
}
