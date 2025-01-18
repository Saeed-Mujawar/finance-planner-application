import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Family } from './family.schema';
import { UserService } from '../user/user.service';
import { InviteFamilyMembersDto } from '../../common/dtos/InviteFamilyMembersDto';
import { EmailService } from 'src/common/EmailService';
import { TokenService } from 'src/common/TokenService';

@Injectable()
export class FamilyService {
    
    constructor(
        @InjectModel('Family') private readonly familyModel: Model<Family>,
        @Inject(forwardRef(() => UserService))
        private userService: UserService,
        private readonly emailService: EmailService,
        private readonly tokenService: TokenService
    ) {}

    private generateInviteToken(familyID: string, email: string): string {
        return this.tokenService.generateToken({ email, familyID });
    }

    async createFamily(userID: string): Promise<Family> {

        const family = new this.familyModel({ userID });

        await family.save();

        return family;
    }

    // Method to remove a user from all families they belong to
    async removeUserFromFamilies(email: string): Promise<void> {
        const families = await this.familyModel.find({ 'familyMembers.memberEmail': email }).exec();

        for (const family of families) {
            // Remove the user from the family member list
            const updatedfamilyMembers = family.familyMembers.filter(
                (member) => member.memberEmail !== email,
            );

            family.familyMembers = updatedfamilyMembers;
            await family.save(); // Save the updated family document
        }
    }

    // Method to delete the entire family if the user is the admin
    async deleteFamily(userID: string): Promise<void> {
        const family = await this.familyModel.findOneAndDelete({ userID }).exec();

        if (!family) {
            throw new NotFoundException(`Family not found`);
        }

    }

    async inviteFamilyMembers(familyID: string, inviteFamilyMembersDto: InviteFamilyMembersDto): Promise<any> {
        const family = await this.familyModel.findById(familyID);

        if (!family) {
            throw new NotFoundException('Family not found');
        }

        // Create a Set of existing member emails for fast lookups
        const existingMemberEmails = new Set(family.familyMembers.map(existing => existing.memberEmail));

        // Prepare lists for new members to be added and those to receive invitations
        const membersToAdd = [];
        const membersToInvite = [];

        for (const member of inviteFamilyMembersDto.members) {
            const { memberEmail, relationship } = member;

            if (existingMemberEmails.has(memberEmail)) {
                const existingMember = family.familyMembers.find(
                    (existing) => existing.memberEmail === memberEmail
                );

                // If the user is already invited, resend the invitation but don't add to the family
                if (existingMember.status === 'invited') {
                    console.log(`User already invited, sending a new invitation: ${memberEmail}`);
                    membersToInvite.push({
                        memberEmail,
                        familyID: family._id,  // Pass the familyID for the invite URL
                    });
                    continue; // Skip adding the member to the family
                }

                // If the user has already joined, skip sending a new invitation
                if (existingMember.status === 'joined') {
                    console.log(`User already joined: ${memberEmail}`);
                    continue; // Skip this member
                }
            }

            // Extract memberID using the email
            const user = await this.userService.findOneByEmail(memberEmail);
            if (!user) {
                console.error(`User with email ${memberEmail} not found.`);
                throw new NotFoundException(`User with email ${memberEmail} not found.`);
            }
            const memberID = user._id; // Use the user's ID as memberID


            // If the member is not already invited or joined, add to the family
            membersToAdd.push({
                memberID,
                relationship,
                status: 'invited',  // New member is being invited
                memberEmail, // Store the email
            });

            // Prepare for sending invitations
            membersToInvite.push({
                memberEmail,
                familyID: family._id,  // Pass the familyID for the invite URL
            });
        }

        // Add the new members to the family
        if (membersToAdd.length > 0) {
            family.familyMembers.push(...membersToAdd);
            // Save the family with the new members invited
            await family.save();
        }

        // Send the email invites to the members that were actually invited
        if (membersToInvite.length > 0) {
            await this.sendInviteEmails(family.userID, membersToInvite);
            return { success: true, message: 'Invites sent successfully' };
        } else {
            return { success: true, message: 'No new invitations were sent (all members were already invited or joined).' };
        }
    }

    private async sendInviteEmails(userID: string, members: { memberEmail: string; familyID: string }[]): Promise<void> {
        const user = await this.userService.findOne(userID);
        if (!user) {
            throw new NotFoundException(`User with ID ${userID} not found.`);
        }

        // Extract the sender's full name
        const senderName = `${user.firstName} ${user.lastName}`;

        for (const member of members) {
            // Generate JWT token for the invitation
            const inviteToken = this.generateInviteToken(member.familyID, member.memberEmail);

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: member.memberEmail,
                subject: `${senderName} has invited you to join their family on Financial Planner Application`,
                text: `
                Hello,
    
                You have been invited by ${senderName} to join their family on the Financial Planner Application.
    
                Please follow the link below to accept the invitation and join their family:
    
                http://localhost:8080/family/join/email/${inviteToken}
    
                Regards,
                Financial Planner Application Team`,
                html: `
                <p>Hello,</p>
                <p>You have been invited by <strong>${senderName}</strong> to join their family on the <strong>Financial Planner Application</strong>.</p>
                <p>Please <a href="http://localhost:8080/family/join/email/${inviteToken}">click here</a> to accept the invitation and join the family.</p>
                <p>Regards,</p>
                <p>Financial Planner Application Team</p>`,
            };

            await this.emailService.sendMail(mailOptions); 
        }
    }

    // Method to join the family with the invitation token
    async joinFamilyWithEmail(token: string): Promise<Family> {
        let payload: any;

        try {
            // Decode the token to extract familyID and email
            payload = this.tokenService.verifyToken(token);  // Verifies the token and extracts the payload
        } catch (error) {
            throw new BadRequestException('Invalid or expired invitation token');
        }

        const { email, familyID } = payload;

        // Step 1: Check if the user exists
        const user = await this.userService.findOneByEmail(email);
        if (!user) {
            throw new BadRequestException('User not found. Please register first.');
        }

        // Step 2: Find the family by ID
        const family = await this.familyModel.findOne({ '_id': familyID });
        if (!family) {
            throw new BadRequestException('No family found');
        }

        // Step 3: Find the invited family member in the family document
        const familyMember = family.familyMembers.find(
            (member) => member.memberEmail === email && member.status === 'invited',
        );

        if (!familyMember) {
            throw new BadRequestException('Invitation not found or already joined');
        }

        // Step 4: Update the family member's status to 'joined'
        familyMember.status = 'joined';
        await family.save();

        return family;
    }

    async deleteFamilyMember(familyID: string, memberEmail: string): Promise<any> {
        const family = await this.familyModel.findById(familyID);
        if (!family) {
            throw new NotFoundException('Family not found');
        }

        // Find the family member to be removed
        const memberIndex = family.familyMembers.findIndex(
            (member) => member.memberEmail === memberEmail,
        );

        if (memberIndex === -1) {
            throw new NotFoundException('Family member not found');
        }

        // Remove the family member from the array
        family.familyMembers.splice(memberIndex, 1);

        // Save the updated family
        await family.save();
        return { success: true, message: 'Family member deleted successfully' };
    }


    // Method to update a family member's information
    async updateFamilyMember(familyID: string, memberEmail: string, updatedData: { relationship?: string }): Promise<any> {
        const family = await this.familyModel.findById(familyID);
        if (!family) {
            throw new NotFoundException('Family not found');
        }

        // Find the family member to be updated
        const member = family.familyMembers.find(
            (member) => member.memberEmail === memberEmail,
        );

        if (!member) {
            throw new NotFoundException('Family member not found');
        }

        // Update the member's data
        if (updatedData.relationship) {
            member.relationship = updatedData.relationship;
        }

        // Save the updated family
        await family.save();
        return { success: true, message: 'Family member updated successfully' };
    }

    async getFamilyMembers(userID: string): Promise<any> {
        // Find the family associated with the logged-in user
        const family = await this.familyModel.findOne({ userID }).exec();

        if (!family) {
            throw new NotFoundException('Family not found for the logged-in user');
        }

        // Return the family members
        return family.familyMembers;
    }

}