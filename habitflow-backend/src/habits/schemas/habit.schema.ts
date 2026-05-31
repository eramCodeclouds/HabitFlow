import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HabitDocument = Habit & Document;

@Schema({
  timestamps: true,
  toJSON: {
    transform: (doc, ret: any) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
})
export class Habit {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, index: true })
  userId: string;
}

export const HabitSchema = SchemaFactory.createForClass(Habit);
