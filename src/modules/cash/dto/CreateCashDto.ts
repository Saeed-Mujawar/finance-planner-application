
import { IsString, IsNumber } from 'class-validator';

export class CreateCashDto {

  @IsString()
  currency: string;  

  @IsNumber()
  currentValue: number;  
}


// {
//     "currency": "USD",
//     "currentValue": 500
//   }
