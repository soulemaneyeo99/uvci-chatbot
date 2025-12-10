// Service pour les fonctionnalités vocales

/* eslint-disable @typescript-eslint/no-explicit-any */

export class SpeechService {
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = 
        (window as any).SpeechRecognition || 
        (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'fr-FR';
      }

      if ('speechSynthesis' in window) {
        this.synthesis = window.speechSynthesis;
      }
    }
  }

  startListening(
    onResult: (transcript: string) => void,
    onError?: (error: string) => void
  ): void {
    if (!this.recognition) {
      onError?.('La reconnaissance vocale n\'est pas supportée par votre navigateur');
      return;
    }

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    this.recognition.onerror = (event: any) => {
      console.error('Erreur reconnaissance vocale:', event.error);
      onError?.(event.error);
    };

    this.recognition.onend = () => {
      console.log('Reconnaissance vocale terminée');
    };

    try {
      this.recognition.start();
    } catch (error) {
      console.error('Erreur démarrage reconnaissance:', error);
      onError?.('Impossible de démarrer la reconnaissance vocale');
    }
  }

  stopListening(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.error('Erreur arrêt reconnaissance:', error);
      }
    }
  }

  speak(text: string, lang: string = 'fr-FR'): void {
    if (!this.synthesis) {
      console.error('La synthèse vocale n\'est pas supportée');
      return;
    }

    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = this.synthesis.getVoices();
    const frenchVoice = voices.find(voice => voice.lang.startsWith('fr'));
    if (frenchVoice) {
      utterance.voice = frenchVoice;
    }

    this.synthesis.speak(utterance);
  }

  stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  isSupported(): { recognition: boolean; synthesis: boolean } {
    return {
      recognition: !!this.recognition,
      synthesis: !!this.synthesis,
    };
  }
}

export const speechService = new SpeechService();
