"use client"
import React, {useEffect, useState} from "react"
import { invoke } from "@tauri-apps/api"
import { WebviewWindow } from "@tauri-apps/api/window"
import Input from "../FormComponents/Input"
import Button from "../FormComponents/Button"
import Form from "../FormComponents/Form"

const CollectionForm: React.FC = ( ) => {
    const [appWindow, setAppWindow] = useState<WebviewWindow>();
    const [collectionName, setCollectionName] = useState<string>();

    async function setupAppWindow() {
        const appWindow = (await import('@tauri-apps/api/window')).appWindow
        setAppWindow(appWindow);
    }

    useEffect(() => {
        setupAppWindow()
    }, [])

    const handleCreateCollection = (e: React.FormEvent) => {
        e.preventDefault();
        try{
            if(collectionName){
                invoke('create_collection', {collectionName: collectionName})
                if(appWindow)
                    appWindow.close();
            }
        }
        catch(error){
            console.log(`Error: ${error}`);
        }
    }
 
    return (
        <Form onSubmit={handleCreateCollection}>
            <Input type="text" value={collectionName} onChange={(e) => setCollectionName(e.target.value)} placeholder="Collection Name" />
            <Button>
                Create Collection
            </Button>
        </Form>
    )
}

export default CollectionForm