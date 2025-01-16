import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cash } from './cash.schema';
import { CreateCashDto } from './dto/CreateCashDto';
import { UserService } from '../user/user.service';

@Injectable()
export class CashService {
  constructor(
    @InjectModel('Cash') private readonly cashModel: Model<Cash>,
    @Inject(forwardRef(() => UserService)) private readonly userService: UserService,
  ) {}

  // Create or update a single cash record for a user
  async createOrUpdateCash(userID: string, createCashDto: CreateCashDto): Promise<Cash> {
    const { currentValue } = createCashDto;

    // Upsert: Find the cash record for the user and update or create it
    const cash = await this.cashModel.findOneAndUpdate(
      { userID }, 
      { currentValue }, 
      { new: true, upsert: true }, // Return the updated document or create a new one
    ).exec();

    // Update the user's portfolio value
    await this.updateUserPortfolio(userID);

    return cash;
  }

  // Method to update the user's portfolio value
  private async updateUserPortfolio(userID: string): Promise<void> {
    const totalPortfolioValue = await this.userService.calculateTotalPortfolioValue(userID);
    await this.userService.updatePortfolioValue(userID, totalPortfolioValue);
  }

  // Get the cash record for a user
  async getCashByUser(userID: string): Promise<Cash> {
    const cash = await this.cashModel.findOne({ userID }).exec();
    if (!cash) throw new NotFoundException(`Cash record for user ${userID} not found`);
    return cash;
  }

  // Delete the cash record for a user
  async deleteCash(userID: string): Promise<{ message: string }> {
    const cash = await this.cashModel.findOneAndDelete({ userID }).exec();
    if (!cash) throw new NotFoundException(`Cash record for user ${userID} not found`);
    return { message: `Cash record for user ${userID} deleted successfully` };
  }

  // Calculate the total cash portfolio value for a user
  async calculateUserCashPortfolio(userID: string): Promise<number> {
    const cash = await this.cashModel.findOne({ userID }).exec();
    return cash ? cash.currentValue : 0; 
  }
}
