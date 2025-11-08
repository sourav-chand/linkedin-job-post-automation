import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  jobRole: {
    type: String,
    required: true,
  },
  generatedDescription: {
    type: String,
    required: true,
  },
  requirements: {
    type: [String],
    default: [],
  },
  responsibilities: {
    type: [String],
    default: [],
  },
  skills: {
    type: [String],
    default: [],
  },
  experience: {
    type: String,
    default: "",
  },
  education: {
    type: String,
    default: "",
  },
  postedToLinkedIn: {
    type: Boolean,
    default: false,
  },
  linkedInPostId: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Job = mongoose.model("Job", jobSchema);

export default Job;
