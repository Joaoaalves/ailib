import { useUploadDocument } from '@/contexts/DocumentUploadProvider';
import React, { useEffect, useState } from 'react';

interface IProgress {
    chunk: number;
    total: number;
    embedding: string;
  }
  

function ProgressBar() {
    const {progressPercentage, isEmbedding} = useUploadDocument()

    if(!isEmbedding)
        return <></>
 
    return (
        <div className='absolute w-full h-2 bg-black'>
            <div className="h-2 bg-primary rounded-r-full" style={{
                width: `${progressPercentage}%`
            }}></div>
        </div>
  );
}

export default ProgressBar;
