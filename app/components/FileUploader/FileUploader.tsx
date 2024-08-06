"use client";
import React, { useState, useEffect } from 'react';
import { WebviewWindow } from '@tauri-apps/api/window';
import styles from './FileUploader.module.css';
import { listen } from '@tauri-apps/api/event';

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

    uploadWindow.once('tauri://created', () => {
      console.log('Upload window created');
    });

    uploadWindow.once('tauri://error', (e) => {
      console.error('Error creating upload window:', e);
    });
  };

  return (
    <div>
      <button
        onClick={openUploadWindow}
        className={`${styles.button} ${isProcessing ? styles.processing : ''}`}
        disabled={isProcessing}
      >
        {isProcessing ? 'Processing...' : 'Upload PDF'}
      </button>
    </div>
  );
};

export default FileUploader;