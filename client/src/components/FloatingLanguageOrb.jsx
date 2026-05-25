import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Mic, Image, Send, X, Globe } from "lucide-react";
import axios from "axios";
import { API_URL } from "../config";

export function FloatingLanguageOrb({
  selectedChat,
  onSend,
  token,
  chatMode,
  onMediaSent,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const voiceRecorderRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSending(true);
    try {
      await onSend(message);
      setMessage("");
      setIsExpanded(false);
    } catch (error) {
      console.error("Send error:", error);
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (file, mediaType) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("chatId", selectedChat._id);
      formData.append("receiverId", selectedChat.partner.id);

      const response = await axios.post(
        `${API_URL}/messages/send-media`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (onMediaSent) {
        onMediaSent(response.data.message);
      }
      setIsExpanded(false);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleCameraCapture = () => {
    fileInputRef.current.setAttribute("capture", "environment");
    fileInputRef.current.setAttribute("accept", "image/*");
    fileInputRef.current.click();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, "image");
    }
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      voiceRecorderRef.current = mediaRecorder;
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const file = new File([blob], "voice-message.webm", {
          type: "audio/webm",
        });
        handleFileUpload(file, "voice");
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Recording error:", error);
    }
  };

  const stopVoiceRecording = () => {
    if (voiceRecorderRef.current) {
      voiceRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const orbVariants = {
    collapsed: {
      width: 56,
      height: 56,
      borderRadius: 28,
    },
    expanded: {
      width: 400,
      height: 240,
      borderRadius: 20,
    },
  };

  const containerVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0, opacity: 0 },
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <motion.form
        variants={orbVariants}
        initial="collapsed"
        animate={isExpanded ? "expanded" : "collapsed"}
        transition={{ type: "spring", damping: 15, mass: 0.5 }}
        onSubmit={handleSubmit}
        className="bg-gradient-to-br from-purple-600/90 to-indigo-600/90 backdrop-blur-xl border border-purple-400/50 shadow-2xl flex flex-col"
      >
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            <motion.button
              key="orb"
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              type="button"
              onClick={() => setIsExpanded(true)}
              className="w-full h-full flex items-center justify-center text-white text-2xl hover:scale-110 transition-transform"
            >
              💬
            </motion.button>
          ) : (
            <motion.div
              key="input"
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full h-full flex flex-col p-4"
            >
              <div className="flex-1 flex flex-col">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder={`Message @${selectedChat?.partner?.username}...`}
                  className="flex-1 bg-transparent text-white placeholder:text-white/50 outline-none overflow-y-hidden resize-none text-sm"
                  autoFocus
                />
              </div>

              {/* Media upload buttons */}
              <div className="flex gap-2 my-3 pb-2 border-b border-white/20">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={handleCameraCapture}
                  className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center text-sm"
                  title="Camera"
                >
                  📷
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => {
                    fileInputRef.current.removeAttribute("capture");
                    fileInputRef.current.setAttribute(
                      "accept",
                      "image/*,video/*",
                    );
                    fileInputRef.current.click();
                  }}
                  className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center text-sm"
                  title="Gallery"
                >
                  🖼️
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={
                    isRecording ? stopVoiceRecording : startVoiceRecording
                  }
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                    isRecording
                      ? "bg-red-500/40 hover:bg-red-500/50"
                      : "bg-white/20 hover:bg-white/30"
                  }`}
                  title={isRecording ? "Stop recording" : "Record voice"}
                >
                  🎤
                </motion.button>
              </div>

              <div className="flex items-center justify-between gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition"
                >
                  Cancel
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={sending || uploading || !message.trim()}
                  className="px-4 py-1 rounded-lg bg-white/90 hover:bg-white text-purple-600 text-xs font-bold transition disabled:opacity-50"
                >
                  {sending || uploading ? "Sending..." : "Send"}
                </motion.button>
              </div>

              {/* Mode indicator */}
              <div className="text-xs text-white/70 mt-2">
                Mode:{" "}
                <span className="font-semibold capitalize">{chatMode}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.form>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Floating action buttons when collapsed */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-0 right-0 flex flex-col gap-2 mr-20"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCameraCapture}
              className="w-12 h-12 rounded-full bg-blue-500/80 hover:bg-blue-600 text-white shadow-lg flex items-center justify-center"
              title="Take photo"
            >
              📷
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={startVoiceRecording}
              className="w-12 h-12 rounded-full bg-red-500/80 hover:bg-red-600 text-white shadow-lg flex items-center justify-center"
              title="Record voice"
            >
              🎤
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
