import { Schema, Document, ObjectId } from 'mongoose';


export const UserSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  portfolioValue: { type: Number, default: 0 }
});

export interface User extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  portfolioValue: number;
}
