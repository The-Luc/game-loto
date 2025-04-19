import React, { useState } from 'react';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Volume2, VolumeX } from 'lucide-react';
import { vietnameseNumbers } from '@/lib/speech';

/**
 * Component for testing Vietnamese text-to-speech functionality
 * Allows manual testing of number announcements and browser compatibility
 */
export function TextToSpeechTest() {
  const [number, setNumber] = useState<number>(1);
  const { speak, stop, isSpeaking, isSupported } = useSpeechSynthesis();
  const [browserInfo, setBrowserInfo] = useState<string>('');
  
  // Get browser information on mount
  React.useEffect(() => {
    const userAgent = navigator.userAgent;
    const browserName = detectBrowser(userAgent);
    setBrowserInfo(browserName);
  }, []);
  
  // Simple browser detection
  const detectBrowser = (userAgent: string): string => {
    if (userAgent.indexOf("Chrome") > -1) return "Chrome";
    if (userAgent.indexOf("Safari") > -1) return "Safari";
    if (userAgent.indexOf("Firefox") > -1) return "Firefox";
    if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident") > -1) return "Internet Explorer";
    if (userAgent.indexOf("Edge") > -1) return "Edge";
    return "Unknown Browser";
  };
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1 && value <= 90) {
      setNumber(value);
    }
  };
  
  const announceNumber = async () => {
    try {
      await speak(number);
    } catch (error) {
      console.error('Error announcing number:', error);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Vietnamese Text-to-Speech Test</CardTitle>
        <CardDescription>
          Test Vietnamese number announcements in your browser ({browserInfo})
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!isSupported && (
          <div className="bg-red-100 p-3 rounded-md text-red-700 text-sm">
            ⚠️ Your browser does not support the Web Speech API. Number announcements will not work.
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="number-input">Select a number (1-90):</Label>
          <Input
            id="number-input"
            type="number"
            min={1}
            max={90}
            value={number}
            onChange={handleNumberChange}
            disabled={isSpeaking}
          />
        </div>
        
        <div className="text-sm">
          <p><strong>Vietnamese pronunciation:</strong></p>
          <p className="font-medium">{vietnameseNumbers[number]}</p>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={isSpeaking ? stop : announceNumber}
          disabled={!isSupported}
          className="w-full flex items-center justify-center gap-2"
        >
          {isSpeaking ? (
            <>
              <VolumeX className="h-4 w-4" />
              Stop Speaking
            </>
          ) : (
            <>
              <Volume2 className="h-4 w-4" />
              Speak Number
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
