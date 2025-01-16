import { Controller, Post, Body, Param, Get, NotFoundException, Delete, Put, UseGuards, Request } from '@nestjs/common';
import { FamilyService } from './family.service';
import { InviteFamilyMembersDto } from './dto/InviteFamilyMembersDto';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';

@Controller('family')
export class FamilyController {
    constructor(private readonly familyService: FamilyService) { }

    @UseGuards(JwtAuthGuard)
    @Post('create')
    async createFamily(@Request() req) {
        const userID = req.user._id;
        return this.familyService.createFamily(userID);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':familyID/invite')
    async inviteFamilyMembers(
        @Param('familyID') familyID: string,
        @Body() members: InviteFamilyMembersDto,
    ) {
        try {
            return await this.familyService.inviteFamilyMembers(familyID, members);
        } catch (error) {
            throw new NotFoundException(error.message || 'An error occurred');
        }
    }

    @Get('join/email/:token')
    async joinFamilyWithEmail(
        @Param('token') token: string,
    ) {
        return this.familyService.joinFamilyWithEmail(token);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':familyID/member/:memberEmail')
    async deleteFamilyMember(
        @Param('familyID') familyID: string,
        @Param('memberEmail') memberEmail: string
    ) {
        try {
            return await this.familyService.deleteFamilyMember(familyID, memberEmail);
        } catch (error) {
            throw new NotFoundException(error.message || 'Error deleting family member');
        }
    }

    @Put(':familyID')
    async updateFamilyMember(
        @Param('familyID') familyID: string,
        @Body() updatedData: { relationship?: string },
        @Param('memberEmail') memberEmail: string,
    ) {
        try {
            return await this.familyService.updateFamilyMember(familyID, memberEmail, updatedData);
        } catch (error) {
            throw new NotFoundException(error.message || 'Error updating family member');
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('members')
    async getFamilyMembers(@Request() req) {
        const userID = req.user._id;
        return this.familyService.getFamilyMembers(userID);
    }

    @UseGuards(JwtAuthGuard)
    @Delete()
    async deleteFamily(@Request() req) {
        const userID = req.user._id;

        try {

            const result = await this.familyService.deleteFamily(userID);
            return { message: `Family successfully deleted.` };
        } catch (error) {
            throw new NotFoundException(error.message || 'Error deleting family');
        }
    }
}
