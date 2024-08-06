"use client"
import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

const ApiKeyHandler: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await invoke('set_api_key', { apiKey });
      setMessage('API key saved successfully.');
    } catch (error) {
      console.error(error);
      setMessage('An error occurred while saving the API key.');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          API Key:
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </label>
        <button type="submit">Save API Key</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ApiKeyHandler;