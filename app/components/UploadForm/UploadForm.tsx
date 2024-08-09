"use client";
import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { open } from '@tauri-apps/api/dialog';
import { WebviewWindow } from '@tauri-apps/api/window';
import { readBinaryFile } from '@tauri-apps/api/fs';
import { UnlistenFn } from '@tauri-apps/api/event';
import styles from './UploadForm.module.css';
import Input from '../FormComponents/Input';
import Button from '../FormComponents/Button';
import Form from '../FormComponents/Form';
import type { ICollection } from '@/types/collection';
import { Select, SelectOption } from '../FormComponents/Select';

const UploadForm: React.FC = () => {
  const [appWindow, setAppWindow] = useState<WebviewWindow>();
  const [filePath, setFilePath] = useState<string>('');
  const [bookName, setBookName] = useState<string>('');
  const [collection, setCollection] = useState<number | null>(null);
  const [collections, setCollections] = useState<ICollection[] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  async function setupAppWindow() {
    const appWindow = (await import('@tauri-apps/api/window')).appWindow;
    setAppWindow(appWindow);
  }

  async function getCollections() {
    try {
      const collections = await invoke<ICollection[]>('get_collections');
      setCollections(collections);
      setCollection(collections[0].id);
    } catch (error) {
      console.error(`Error fetching collections: ${error}`);
    }
  }

  useEffect(() => {
    setupAppWindow();
    getCollections();
  }, []);

  useEffect(() => {
    if (filePath) {
      const fileName = filePath.split('\\').pop()?.split('/').pop()?.replace(/\.[^/.]+$/, "") || '';
      setBookName(fileName);
    }
  }, [filePath]);

  useEffect(() => {
    let unlistenFn: UnlistenFn;

    const setupListener = async () => {
      if (appWindow) {
        unlistenFn = await appWindow.listen<string[]>('tauri://file-drop', (event) => {
          console.log('File drop event:', event);
          const paths = event.payload;
          if (Array.isArray(paths) && paths.length > 0) {
            const droppedFile = paths[0];
            if (typeof droppedFile === 'string' && droppedFile.toLowerCase().endsWith('.pdf')) {
              setFilePath(droppedFile);
            }
          }
        });
      }
    };

    setupListener();

    return () => {
      if (unlistenFn) {
        unlistenFn();
      }
    };
  }, [appWindow]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFileSelect = async () => {
    const selected = await open({
      multiple: false,
      filters: [{ name: 'PDF', extensions: ['pdf'] }]
    });

    if (selected && typeof selected === 'string') {
      setFilePath(selected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (filePath && bookName) {
      setIsSubmitting(true);
      try {
        const fileContent = await readBinaryFile(filePath);
        await invoke('process_pdf', { pdfPath: filePath, bookName, collection });
        
        if (appWindow) {
          appWindow.close();
        }
      } catch (error) {
        console.error(`Error: ${error}`);
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <div
        onDragOver={handleDragOver}
        onClick={handleFileSelect}
        className={styles.dropzone}
      >
        {filePath ? filePath.split('\\').pop()?.split('/').pop() : 'Drop PDF here or click to select'}
      </div>
      <Input         
        type="text"
        value={bookName}
        onChange={(e) => setBookName(e.target.value)}
        placeholder="Book Name"
        required />
        <Select onChange={(e) => setCollection(Number(e.target.value))}>
          {collections &&
              collections.map((collection) => (
                <SelectOption value={collection.id} key={collection.id}>{collection.name}</SelectOption>)
              )
            }
        </Select>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </Button>
    </Form>
  );
};

export default UploadForm;