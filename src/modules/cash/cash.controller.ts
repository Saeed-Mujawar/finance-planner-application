import { Body, Controller, Delete, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { CashService } from './cash.service';
import { CreateCashDto } from './dto/CreateCashDto';
import { JwtAuthGuard } from 'src/common/jwt-auth.guard';

@Controller('cash')
@UseGuards(JwtAuthGuard)
export class CashController {
    constructor(private readonly cashService: CashService) { }

    @Post()
    async createOrUpdateCash(@Body() createCashDto: CreateCashDto, @Request() req) {
        const userID = req.user._id;  
        return this.cashService.createOrUpdateCash(userID, createCashDto);
    }
    
    @Get()
    async getCashByUserAndCurrency(@Request() req,) {
        const userID = req.user._id;
        return this.cashService.getCashByUser(userID);
    }

    @Delete()
    async deleteCash(@Request() req,) {
        const userID = req.user._id;
        return this.cashService.deleteCash(userID);
    }
}