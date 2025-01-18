import { forwardRef, Module } from '@nestjs/common';
import { UserModule } from 'src/modules/user/user.module';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { FamilyModule } from '../family/family.module';
import { CashModule } from '../cash/cash.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => FamilyModule),
    forwardRef(() => CashModule)
  ],
  controllers: [PortfolioController],
  providers: [PortfolioService],
})
export class PortfolioModule {}
