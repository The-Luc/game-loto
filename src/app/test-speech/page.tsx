'use client';

import React from 'react';
import { TextToSpeechTest } from '@/components/TextToSpeechTest';

export default function TestSpeechPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Text-to-Speech Test Page
      </h1>
      <TextToSpeechTest />
    </div>
  );
}
