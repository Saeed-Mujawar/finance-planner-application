import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CashSchema } from './cash.schema';
import { CashController } from './cash.controller';
import { CashService } from './cash.service';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from 'src/common/jwt.strategy';

@Module({
    imports: [
      MongooseModule.forFeature([{ name: 'Cash', schema: CashSchema }]),
      forwardRef(() => UserModule),
    ],
    controllers: [CashController],
    providers: [CashService, JwtStrategy],
    exports: [CashService],
  })
  export class CashModule {}
