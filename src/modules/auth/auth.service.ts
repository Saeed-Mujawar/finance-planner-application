import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from 'src/modules/user/dto/create-user.dto';
import { LoginUserDto } from 'src/modules/user/dto/login-user.dto';
import { User } from 'src/modules/user/user.schema';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const { email, password, ...rest } = createUserDto;
  
    const existingUser = await this.userService.findOneByEmail(email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }
  
    const hashedPassword = await bcrypt.hash(password, 10);
  
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
      throw new UnauthorizedException('Invalid credentials');
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateResponse(user);
  }

  private generateJwt(user: User) {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }

  private generateResponse(user: User) {
    // Convert to plain object to avoid Mongoose internal properties and remove `password`
    const userDetails = user.toObject();
    delete userDetails.password; 

    const accessToken = this.generateJwt(user);

    return { user: userDetails, accessToken };
  }
}
