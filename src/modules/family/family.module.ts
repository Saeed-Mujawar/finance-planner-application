import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FamilyController } from './family.controller';
import { FamilyService } from './family.service';
import { FamilySchema } from './family.schema'; 
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../../common/jwt.strategy';
import { EmailService } from 'src/common/EmailService';
import { TokenService } from 'src/common/TokenService';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Family', schema: FamilySchema }]),
    forwardRef(() => UserModule),
    JwtModule.register({
          secret: 'secretKey', 
          signOptions: { expiresIn: '1h' },
        }),
  ],
  controllers: [FamilyController],
  providers: [FamilyService, JwtStrategy, EmailService, TokenService],
  exports: [FamilyService], 
})
export class FamilyModule {}
