import { Schema, Document } from 'mongoose';

export const FamilySchema = new Schema({
  userID: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  familyMembers: [
    {

      memberID: { type: String}, 
      relationship: { type: String, required: true },
      status: { type: String, enum: ['invited', 'joined'], default: 'invited' },
      memberEmail: { type: String, required: true }, 
    },
  ],
});

export interface Family extends Document {

  userID: string;
  familyMembers: Array<{
    memberID: string;
    relationship: string;
    status: 'invited' | 'joined';
    memberEmail: string;
  }>;
}
