"use client"

import {useState, useEffect} from 'react'
import styles from "./page.module.css";

import Sidepanel from "@/components/Sidepanel/Sidepanel";
import TopBar from "@/components/Topbar/Topbar";
import { IDocument } from "@/types/document";
import { ICollection } from '@/types/collection';
import { invoke } from '@tauri-apps/api';
import Collection from '@/components/DocumentCollections/Collection';
import { get } from 'http';

export default function Home() {
  const [documents, setDocuments] = useState<IDocument[]|[]>([])
  const [collections, setCollections] = useState<ICollection[] | []>([])

  const getCollections = async () => {
    try{
      const collections = await invoke<ICollection[]>('get_collections');
      setCollections(collections)
    } 
    catch(error){
        console.error(`Error fetching documents: ${error}`)
        return []
    }
  }

  const getDocuments = async () => {
    try{
      const documents = await invoke<IDocument[]>('get_documents');
      setDocuments(documents)
    } 
    catch(error){
        console.error(`Error fetching documents: ${error}`)
        return []
    }
  }


  useEffect(() => {
    getCollections()
    getDocuments()
  }, [])

  return (
    <main className={styles.main}>
      <TopBar />
      <Sidepanel />
      <div className={styles.content}>
        {collections.length > 0 && collections.map((collection) => (
          <Collection collection={collection} documents={documents} key={`collection-${collection.id}`}/>
        ))}
          {collections.length > 0 && collections.map((collection) => (
          <Collection collection={collection} documents={documents} key={`collection-1${collection.id}`}/>
        ))}
          {collections.length > 0 && collections.map((collection) => (
          <Collection collection={collection} documents={documents} key={`collection-2${collection.id}`}/>
        ))}
      </div>
    </main>
  );
}
