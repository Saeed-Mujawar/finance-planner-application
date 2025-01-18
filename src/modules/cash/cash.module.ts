import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CashSchema } from './cash.schema';
import { CashController } from './cash.controller';
import { CashService } from './cash.service';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from 'src/common/jwt.strategy';
import { PortfolioService } from '../portfolio/portfolio.service';
import { FamilyModule } from '../family/family.module';

@Module({
    imports: [
      MongooseModule.forFeature([{ name: 'Cash', schema: CashSchema }]),
      forwardRef(() => UserModule),
      forwardRef(() => FamilyModule),
    ],
    controllers: [CashController],
    providers: [CashService, JwtStrategy, PortfolioService],
    exports: [CashService],
  })
  export class CashModule {}
