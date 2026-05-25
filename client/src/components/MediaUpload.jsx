import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { api } from '../lib/api';

export function MediaUpload({ selectedChat, token, onMediaSent, error, setError }) {
  const imageInputRef = useRef(null);
  const documentInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const microphoneRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const handleFileSelect = async (event, mediaType) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await uploadMedia(file, mediaType);
    } catch (err) {
      setError(err.message);
    } finally {
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const uploadMedia = async (file, mediaType) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mediaType', mediaType);
    formData.append('receiverId', selectedChat.partner.id);
    formData.append('receiverPublicId', selectedChat.partner.publicId);

    console.log('Uploading media:', { mediaType, fileName: file.name, size: file.size });

    try {
      const response = await api.post('/messages/send-media', formData, token, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          setUploadProgress(percentCompleted);
        },
      });

      setUploadProgress(0);
      onMediaSent(response.message);
    } catch (err) {
      setError(err.message);
      setUploadProgress(0);
    }
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Determine the best supported mimeType for the current browser
      let options = {};
      let mimeType = 'audio/webm';
      let extension = 'webm';
      
      if (MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/webm' };
        mimeType = 'audio/webm';
        extension = 'webm';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options = { mimeType: 'audio/mp4' };
        mimeType = 'audio/mp4';
        extension = 'mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        options = { mimeType: 'audio/ogg' };
        mimeType = 'audio/ogg';
        extension = 'ogg';
      } else if (MediaRecorder.isTypeSupported('audio/wav')) {
        options = { mimeType: 'audio/wav' };
        mimeType = 'audio/wav';
        extension = 'wav';
      } else {
        // Fallback to browser default
        options = {};
        mimeType = 'audio/mp4';
        extension = 'mp4';
      }

      mediaRecorderRef.current = new MediaRecorder(stream, options);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const actualMime = mediaRecorderRef.current.mimeType || mimeType;
        const blob = new Blob(chunksRef.current, { type: actualMime });
        const file = new File([blob], `voice-${Date.now()}.${extension}`, {
          type: actualMime,
        });
        uploadMedia(file, 'voice');
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      setError('Microphone access denied: ' + err.message);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const openImageDialog = () => {
    imageInputRef.current?.click();
  };

  const openDocumentDialog = () => {
    documentInputRef.current?.click();
  };

  const openCameraDialog = () => {
    cameraInputRef.current?.click();
  };

  const openMicrophoneDialog = () => {
    if (isRecording) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl">
      {/* Picture Upload */}
      <button
        onClick={openImageDialog}
        title="Send picture"
        className="p-2 rounded-full hover:bg-white/10 transition text-converso-gold hover:text-converso-gold/80"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
        </svg>
      </button>

      {/* Camera */}
      <button
        onClick={openCameraDialog}
        title="Take photo"
        className="p-2 rounded-full hover:bg-white/10 transition text-converso-cyan hover:text-converso-cyan/80"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
        </svg>
      </button>

      {/* Voice Message */}
      <button
        onClick={openMicrophoneDialog}
        title={isRecording ? 'Stop recording' : 'Send voice message'}
        className={`p-2 rounded-full transition ${
          isRecording
            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
            : 'hover:bg-white/10 text-converso-purple hover:text-converso-purple/80'
        }`}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
        </svg>
      </button>

      {/* Document */}
      <button
        onClick={openDocumentDialog}
        title="Send document"
        className="p-2 rounded-full hover:bg-white/10 transition text-converso-gold hover:text-converso-gold/80"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
      </button>

      {/* Hidden Inputs */}
      <input
        ref={imageInputRef}
        type="file"
        multiple={false}
        accept="image/*"
        onChange={(e) => handleFileSelect(e, 'image')}
        className="hidden"
      />

      <input
        ref={documentInputRef}
        type="file"
        multiple={false}
        accept="*/*"
        onChange={(e) => handleFileSelect(e, 'document')}
        className="hidden"
      />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFileSelect(e, 'image')}
        className="hidden"
      />

      {/* Upload Progress */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-converso-gradient transition-all"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="text-xs text-red-400 px-2">Error: {error}</div>
      )}
    </div>
  );
}

MediaUpload.propTypes = {
  selectedChat: PropTypes.object.isRequired,
  token: PropTypes.string.isRequired,
  onMediaSent: PropTypes.func.isRequired,
  error: PropTypes.string,
  setError: PropTypes.func.isRequired,
};
