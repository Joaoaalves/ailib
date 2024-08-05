"use client";
import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { open } from '@tauri-apps/api/dialog';
import styles from './FileUploader.module.css';
import { listen } from '@tauri-apps/api/event';

const FileUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
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

  const handleFileSelectAndSubmit = async () => {
    const selected = await open({
      multiple: false,
      filters: [{ name: 'PDF', extensions: ['pdf'] }]
    });

    if (selected && typeof selected === 'string') {
      setFile(new File([], selected));
      setIsProcessing(true);

      try {
        await invoke('process_pdf', { pdfPath: selected });
      } catch (error) {
        console.error(`Erro: ${error}`);
      }
    }
  };

  return (
    <div>
      <button
        onClick={handleFileSelectAndSubmit}
        className={`${styles.button} ${isProcessing ? styles.processing : ''}`}
        disabled={isProcessing}
      >
        {isProcessing ? 'Processando...' : 'Selecionar e Processar PDF'}
      </button>
    </div>
  );
};

export default FileUploader;
