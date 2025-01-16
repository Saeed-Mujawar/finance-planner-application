import { Module} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { FamilyModule } from './modules/family/family.module';
import { CashModule } from './modules/cash/cash.module';
import { PortfolioService } from './modules/portfolio/portfolio.service';
import { PortfolioController } from './modules/portfolio/portfolio.controller';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,  // Make the configuration globally available
    }),
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        const mongoUri = configService.get<string>('MONGO_URI');
        console.log(`Connecting to MongoDB at ${mongoUri}`); 
        return { uri: mongoUri };
      },
      inject: [ConfigService],  // Inject ConfigService to access environment variables
    }),
    UserModule,AuthModule, FamilyModule, CashModule
  ],
  providers: [PortfolioService],
  controllers: [PortfolioController],
})
export class AppModule {}
