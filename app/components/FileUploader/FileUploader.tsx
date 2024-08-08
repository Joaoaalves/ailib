"use client";
import React, { useState, useEffect } from 'react';
import { WebviewWindow } from '@tauri-apps/api/window';
import { listen } from '@tauri-apps/api/event';
import Button from '../FormComponents/Button';

const FileUploader: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    const setupListeners = async () => {
      const unlistenProgress = await listen('embedding_progress', () => {
        setIsProcessing(true);
      });

      const unlistenComplete = await listen('embedding_complete', () => {
        setIsProcessing(false);
        unlistenProgress();
        unlistenComplete();
      });

      return () => {
        unlistenProgress();
        unlistenComplete();
      };
    };

    setupListeners();
  }, []);

  const openUploadWindow = () => {
    const uploadWindow = new WebviewWindow('upload', {
      url: '/upload',
      title: 'Upload PDF',
      width: 400,
      height: 300,
      resizable: false,
    });
  };

  return (
      <Button
        onClick={openUploadWindow}
        disabled={isProcessing}
        variant='outline'
      >
        {isProcessing ? 'Processing...' : 'Upload PDF'}
      </Button>
  );
};

export default FileUploader;