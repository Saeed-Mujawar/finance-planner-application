import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request } from '@nestjs/common';
import { User } from './user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';


@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get()
  async findOne(@Request() req): Promise<User> {
    const userID = req.user._id;
    return this.userService.findOne(userID);
  }

  @Put()
  async update(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<User> {
    const userID = req.user._id;
    return this.userService.update(userID, updateUserDto);
  }

  @Delete()
  async remove(@Request() req): Promise<{ message: string; userID: string }> {
    const userID = req.user._id;
    const result = await this.userService.remove(userID);
    return result;
  }

}
