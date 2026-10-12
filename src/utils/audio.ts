// Pure Web Audio API Synthesizer - 100% offline, zero external sound files required!

let audioCtx: AudioContext | null = null;
let soundEnabled = true;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

export function playSound(type: 'correct' | 'wrong' | 'combo' | 'victory' | 'click' | 'badge' | 'scan' | 'scan_lock') {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  try {
    switch (type) {
      case 'scan': {
        // High-tech laser sweep tone (futuristic holographic scanner sound)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.connect(gain);
        gain.connect(ctx.destination);

        // Smooth frequency sweep from 440Hz to 1320Hz and down
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(1400, now + 0.18);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.35);

        gain.gain.setValueAtTime(0.02, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

        osc.start(now);
        osc.stop(now + 0.38);
        break;
      }

      case 'scan_lock': {
        // High-tech lock-on double pulse (1200Hz -> 1600Hz)
        [0, 0.09].forEach((offset, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.connect(gain);
          gain.connect(ctx.destination);

          const freq = idx === 0 ? 1200 : 1600;
          osc.frequency.setValueAtTime(freq, now + offset);
          gain.gain.setValueAtTime(0.15, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.08);

          osc.start(now + offset);
          osc.stop(now + offset + 0.08);
        });
        break;
      }

      case 'correct': {
        // Cheerful rising two-tone chime (G5 -> C6)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880.0, now + 0.1); // A5

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.start(now);
        osc.stop(now + 0.35);
        break;
      }

      case 'wrong': {
        // Gentle double low buzz
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.setValueAtTime(220, now);
        osc.frequency.setValueAtTime(180, now + 0.12);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.start(now);
        osc.stop(now + 0.3);
        break;
      }

      case 'combo': {
        // Fast energetic 3-note arpeggio (C5 -> E5 -> G5)
        [523.25, 659.25, 783.99].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.connect(gain);
          gain.connect(ctx.destination);

          const startTime = now + idx * 0.08;
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(0.18, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

          osc.start(startTime);
          osc.stop(startTime + 0.25);
        });
        break;
      }

      case 'victory': {
        // Triumphant fanfare
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.connect(gain);
          gain.connect(ctx.destination);

          const startTime = now + idx * 0.12;
          const duration = idx === notes.length - 1 ? 0.6 : 0.2;
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(0.25, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

          osc.start(startTime);
          osc.stop(startTime + duration);
        });
        break;
      }

      case 'badge': {
        // Sparkle sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1400, now + 0.3);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.start(now);
        osc.stop(now + 0.4);
        break;
      }

      case 'click': {
        // Soft button tap
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.start(now);
        osc.stop(now + 0.08);
        break;
      }
    }
  } catch (e) {
    // Ignore audio autoplay restrictions gracefully
    console.debug('Audio playback note:', e);
  }
}

// Text-to-speech for younger students (Grade 1 & 2)
let isSpeaking = false;

export function speakText(text: string, onEnd?: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  window.speechSynthesis.cancel();
  isSpeaking = true;

  // Clean markdown syntax for speech
  const cleanText = text
    .replace(/[#*`_~]/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/🌱|♻️|🗑️|⚠️|💡|💧|🏔️|🌸|⭐|🎒/g, '');

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'vi-VN';
  utterance.rate = 0.95; // Slightly slower and clear for kids
  utterance.pitch = 1.05; // Friendly warm pitch

  // Try to find a Vietnamese voice if available in the browser
  const voices = window.speechSynthesis.getVoices();
  const viVoice = voices.find(v => v.lang.startsWith('vi'));
  if (viVoice) {
    utterance.voice = viVoice;
  }

  utterance.onend = () => {
    isSpeaking = false;
    onEnd?.();
  };

  utterance.onerror = () => {
    isSpeaking = false;
    onEnd?.();
  };

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    isSpeaking = false;
  }
}

export function getIsSpeaking() {
  return isSpeaking;
}
