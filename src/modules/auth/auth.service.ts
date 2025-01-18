import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthErrors } from 'src/common/error.constants';
import { PasswordService } from 'src/common/PasswordService';
import { TokenService } from 'src/common/TokenService';
import { CreateUserDto } from 'src/common/dtos/create-user.dto';
import { LoginUserDto } from 'src/common/dtos/login-user.dto';
import { User } from 'src/modules/user/user.schema';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly tokenService: TokenService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const { email, password, ...rest } = createUserDto;
  
    const existingUser = await this.userService.findOneByEmail(email);
    if (existingUser) {
      throw new BadRequestException(AuthErrors.USER_ALREADY_EXISTS);
    }
  
    const hashedPassword = await PasswordService.hashPassword(password);
  
    const user = await this.userService.create({
      ...rest,
      email,
      password: hashedPassword,  
    });
  
    return this.generateResponse(user);
  }
  

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    // Check if user exists
    const user = await this.userService.findOneByEmail(email);
    
    if (!user) {
      throw new UnauthorizedException(AuthErrors.INVALID_CREDENTIALS);
    }

    // Compare passwords
    const isPasswordValid = await PasswordService.validatePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(AuthErrors.INVALID_CREDENTIALS);
    }

    return this.generateResponse(user);
  }

  private generateJwt(user: User) {
    const payload = { sub: user.id, email: user.email };
    return this.tokenService.generateToken(payload);
  }

  private generateResponse(user: User) {
    // Convert to plain object to avoid Mongoose internal properties and remove `password`
    const userDetails = user.toObject();
    delete userDetails.password; 

    const accessToken = this.generateJwt(user);

    return { user: userDetails, accessToken };
  }
}
