import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      index: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    avatarUrl: {
      type: String,
      default: null,
      trim: true,
    },
    preferredLanguage: {
      type: String,
      default: "en",
      trim: true,
    },
    acceptedTerms: {
      type: Boolean,
      default: false,
    },
    acceptedTermsAt: {
      type: Date,
      default: null,
    },
    chatMode: {
      type: String,
      enum: ["classic", "culture", "modern"],
      default: "classic",
    },
    theme: {
      type: String,
      enum: ["dark", "light", "neon"],
      default: "dark",
    },
    culturalTheme: {
      type: String,
      enum: [
        "english",
        "spanish",
        "french",
        "german",
        "italian",
        "portuguese",
        "dutch",
        "polish",
        "chinese",
        "japanese",
        "korean",
        "arabic",
        "hindi",
        "urdu",
        "bengali",
        "turkish",
        "indonesian",
        "russian",
      ],
      default: "english",
    },
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    verificationToken: {
      type: String,
      default: null,
      index: true,
    },
    verificationTokenHash: {
      type: String,
      default: null,
      index: true,
      select: false,
    },
    verificationTokenExpiresAt: {
      type: Date,
      default: null,
    },
    verificationLastSentAt: {
      type: Date,
      default: null,
    },
    passwordResetToken: {
      type: String,
      default: null,
      index: true,
    },
    passwordResetTokenHash: {
      type: String,
      default: null,
      index: true,
      select: false,
    },
    passwordResetTokenExpiresAt: {
      type: Date,
      default: null,
    },
    passwordResetLastSentAt: {
      type: Date,
      default: null,
    },
    blockedUsers: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
    translationPreferences: {
      autoTranslate: {
        type: Boolean,
        default: true,
      },
      displayMode: {
        type: String,
        enum: ["classic", "culture", "modern"],
        default: "classic",
      },
      audioEnabled: {
        type: Boolean,
        default: false,
      },
    },
    detectedLanguage: {
      type: String,
      default: null,
    },
    linguisticProfile: {
      fluencyLevel: {
        type: String,
        enum: ["beginner", "intermediate", "advanced", "native"],
        default: "beginner",
      },
      nativeLanguage: {
        type: String,
        default: null,
      },
    },
    culturalSettings: {
      showEtiquetteTips: {
        type: Boolean,
        default: true,
      },
      showIcebreakers: {
        type: Boolean,
        default: true,
      },
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model("User", userSchema);
