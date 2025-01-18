import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CashService } from '../cash/cash.service'; // Assuming cash service is available
import { FamilyService } from '../family/family.service';


@Injectable()
export class PortfolioService {
  constructor(
    @Inject(forwardRef(() => UserService))private readonly userService: UserService,
    @Inject(forwardRef(() => CashService)) private readonly cashService: CashService,
    @Inject(forwardRef(() => FamilyService)) private readonly familyService: FamilyService,
  ) {}

  async calculateAggregatedBalance(adminUserID: string): Promise<{ totalPortfolioValue: number }> {
    const adminUser = await this.userService.findOne(adminUserID);
    if (!adminUser) throw new Error('Admin user not found');

    let totalPortfolioValue = await this.calculateUserPortfolio(adminUserID);

    const familyMembers = await this.familyService.getFamilyMembers(adminUserID);

    for (const familyMember of familyMembers) {
      
      totalPortfolioValue += await this.calculateUserPortfolio(familyMember.memberID);
    }

    return { totalPortfolioValue };
  }

  private async calculateUserPortfolio(userID: string): Promise<number> {
    const cashValue = await this.cashService.calculateUserCashPortfolio(userID);
    return cashValue; // Add other module values if needed
  }

  async updateUserPortfolio(userID: string): Promise<void> {
    const totalPortfolioValue = await this.userService.calculateTotalPortfolioValue(userID);
    await this.userService.updatePortfolioValue(userID, totalPortfolioValue);
  }

}

