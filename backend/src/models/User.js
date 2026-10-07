import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.githubId;
      },
      select: false,
    },
    githubId: {
      type: String,
      unique: true,
      sparse: true,
    },
    githubUsername: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      default: 'user',
    },
    avatar: {
      type: String,
      default: '',
    },
    apiKey: {
      type: String,
      default: '',
      select: false,
    },
    githubAccessToken: {
      type: String,
      default: '',
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
