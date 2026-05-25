import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    // WhatsApp-style chat settings
    settings: {
      isBlocked: {
        type: Boolean,
        default: false,
      },
      isMuted: {
        type: Boolean,
        default: false,
      },
      muteUntil: {
        type: Date,
        default: null,
      },
      wallpaper: {
        type: String,
        default: null,
      },
      theme: {
        type: String,
        default: "default",
      },
      mediaVisibility: {
        type: String,
        enum: ["all", "contacts", "none"],
        default: "all",
      },
    },
    clearedByUsers: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        clearedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    deletedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

chatSchema.index({ participants: 1 });

export const Chat = mongoose.model("Chat", chatSchema);
