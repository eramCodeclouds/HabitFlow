import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type HabitLogDocument = HabitLog & Document;

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
export class HabitLog {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Habit', required: true })
  habitId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, enum: ['completed', 'missed'] })
  status: 'completed' | 'missed';
}

export const HabitLogSchema = SchemaFactory.createForClass(HabitLog);
