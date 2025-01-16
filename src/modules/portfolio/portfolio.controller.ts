import { Controller, Get, Param, NotFoundException, UseGuards, Request } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { JwtAuthGuard } from 'src/common/jwt-auth.guard';

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}


  @UseGuards(JwtAuthGuard)
  @Get('aggregated-balance')
  async getAggregatedBalance(@Request() req) {
    try {
      const adminUserID = req.user._id;
      return await this.portfolioService.calculateAggregatedBalance(adminUserID);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
