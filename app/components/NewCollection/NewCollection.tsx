"use client";
import React, { useState } from 'react';
import { WebviewWindow } from '@tauri-apps/api/window';
import Button from '../FormComponents/Button';

const NewCollection: React.FC = () => {

  const openNewCollection = async () => {
    const newCollectionWindow = new WebviewWindow('create_collection', {
      url: '/new-collection',
      title: 'Create Collection',
      width: 400,
      height: 300,
      resizable: false,
    });
  };

  return (
      <Button
        onClick={openNewCollection}
      >
        Create Collection
      </Button>
  );
};

export default NewCollection;
