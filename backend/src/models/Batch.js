import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema(
  {
    startYear: {
      type: Number,
      required: [true, 'Start year is required'],
      min: [1900, 'Start year must be valid'],
      max: [2100, 'Start year must be valid'],
    },
    endYear: {
      type: Number,
      required: [true, 'End year is required'],
      min: [1900, 'End year must be valid'],
      max: [2100, 'End year must be valid'],
    },
    sections: [
      {
        name: {
          type: String,
          required: [true, 'Section name is required'],
          trim: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const Batch = mongoose.model('Batch', batchSchema);
export default Batch;
