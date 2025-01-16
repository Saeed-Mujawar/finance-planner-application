import { Schema, Document } from 'mongoose';


export const CashSchema = new Schema({
    userID: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    currency: { type: String, required: true },
    currentValue: { type: Number, required: true, default: 0 },
});

export interface Cash extends Document {
  userID: string;        
  currency: string;     
  currentValue: number;
}
