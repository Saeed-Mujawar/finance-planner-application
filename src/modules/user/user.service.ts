import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import { CreateUserDto } from '../../common/dtos/create-user.dto';
import { UpdateUserDto } from '../../common/dtos/update-user.dto';
import { FamilyService } from '../family/family.service';
import { CashService } from '../cash/cash.service';
import { ERROR_MESSAGES } from 'src/common/error.constants';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    @Inject(forwardRef(() => FamilyService)) private readonly familyService: FamilyService,
    @Inject(forwardRef(() => CashService)) private readonly cashService: CashService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel({
      ...createUserDto,
      password: createUserDto.password,
    });
    return createdUser.save();
  }

  async findOne(userID: string): Promise<User> {
    const user = await this.userModel.findById(userID).exec();
    if (!user) throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    return user;
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(userID: string, updateUserDto: UpdateUserDto): Promise<User> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(userID, updateUserDto, { new: true })
      .exec();
    if (!updatedUser) throw new NotFoundException(`User with ID ${userID} not found`);
    return updatedUser;
  }

  async remove(userID: string): Promise<{ message: string; userID: string }> {
    const user = await this.userModel.findByIdAndDelete(userID).exec();
    if (!user) throw new NotFoundException(`User with ID ${userID} not found`);

    await this.familyService.removeUserFromFamilies(user.email);
    await this.familyService.deleteFamily(user._id.toString());
    await this.cashService.deleteCash(user._id.toString());

    return { message: `User with email "${user.email}" deleted and removed from families`, userID };
  }


  async updatePortfolioValue(userID: string, portfolioValue: number): Promise<void> {
    await this.userModel.updateOne({ _id: userID }, { $set: { portfolioValue } });
  }

  async calculateTotalPortfolioValue(userID: string): Promise<number> {
    const cashValue = await this.cashService.calculateUserCashPortfolio(userID);
    return cashValue; // Add other module values here if needed
  }
}
