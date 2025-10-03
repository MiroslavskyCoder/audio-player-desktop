import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
// FIX: Import User type from the local firebase service to ensure consistency with the v8 API.
import type { User } from './services/firebase';
import { TRACKS } from './constants';
import { Track } from './types';
import Background from './components/Background';
// FIX: Update imports for Firebase v8 API from local firebase service.
import { auth, googleProvider } from './services/firebase';
import Header from './components/Header';
import ContentAudioCardFiles from './components/ContentAudioCardFiles';
import Sidebar from './components/Sidebar';
import BottomPlayer from './components/BottomPlayer';
import TrackList from './components/TrackList';
import { getTrackVibe } from './services/geminiService';

type RepeatMode = 'none' | 'one' | 'all';
export type PlaylistView = 'all' | 'liked';

interface IElectronAPI {
  // FIX: Replaced Node.js 'Buffer' type with 'Uint8Array' which is available in the browser and is what Electron's context bridge provides in the renderer process.
  openFile: () => Promise<{ name: string; data: Uint8Array; mimeType: string; }[]>;
  openVstFile: () => Promise<string | undefined>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}

const EQ_FREQUENCIES = [60, 310, 1000, 3000, 6000, 12000];
const PRESETS: { [key: string]: number[] } = {
    'Flat': [0, 0, 0, 0, 0, 0],
    'Rock': [5, 3, -4, -3, 3, 5],
    'Pop': [2, 4, 3, 0, -2, -3],
    'Jazz': [-2, 3, 5, 2, -1, -2],
};


const App: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>(TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [trackProgress, setTrackProgress] = useState<number>(0);
  const [user, setUser] = useState<User | null>(null);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('none');
  const [likedTracks, setLikedTracks] = useState<Set<number>>(new Set());
  const [playlistView, setPlaylistView] = useState<PlaylistView>('all');
  const [vibe, setVibe] = useState<string>('');
  const [isVibeLoading, setIsVibeLoading] = useState<boolean>(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [volume, setVolume] = useState<number>(1);
  const [effects, setEffects] = useState<string[]>([]);
  const [activeEffect, setActiveEffect] = useState<string | null>(null);
  const [eqBands, setEqBands] = useState<number[]>(PRESETS['Flat']);
  const [activePreset, setActivePreset] = useState<string>('Flat');

  const audioRef = useRef<HTMLAudioElement>(new Audio());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const preMuteVolumeRef = useRef<number>(1);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const reverbNodeRef = useRef<ConvolverNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const eqNodesRef = useRef<BiquadFilterNode[]>([]);


  const currentTrack = tracks[currentTrackIndex];

  const setupAudioContext = useCallback(async (audioEl: HTMLAudioElement) => {
      if (audioContextRef.current) return;

      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = context;

      const source = context.createMediaElementSource(audioEl);
      sourceNodeRef.current = source;
      
      const gain = context.createGain();
      gainNodeRef.current = gain;
      
      const analyser = context.createAnalyser();
      analyser.fftSize = 128;
      analyserNodeRef.current = analyser;
      
      // Create EQ filters
      const eqNodes = EQ_FREQUENCIES.map(freq => {
          const filter = context.createBiquadFilter();
          filter.type = 'peaking';
          filter.frequency.value = freq;
          filter.Q.value = 1.4;
          filter.gain.value = 0;
          return filter;
      });
      for (let i = 0; i < eqNodes.length - 1; i++) {
          eqNodes[i].connect(eqNodes[i+1]);
      }
      eqNodesRef.current = eqNodes;


      // Create Reverb Effect
      const reverb = context.createConvolver();
      const response = await fetch('https://raw.githubusercontent.com/ai-studio-org/projects/main/pre-v1/apps/ai-audio-player/ impulse-response.wav');
      const arraybuffer = await response.arrayBuffer();
      reverb.buffer = await context.decodeAudioData(arraybuffer);
      reverbNodeRef.current = reverb;

      // Create Filter Effect
      const filter = context.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;
      filter.Q.value = 1;
      filterNodeRef.current = filter;

      // Initial connection - will be re-routed by effects
      source.connect(gain);
  }, []);

  useEffect(() => {
    if (currentTrack && audioRef.current) {
        setupAudioContext(audioRef.current);
    }
  }, [currentTrack, setupAudioContext]);

  useEffect(() => {
      const { current: context } = audioContextRef;
      const { current: gain } = gainNodeRef;
      const { current: analyser } = analyserNodeRef;
      const { current: reverb } = reverbNodeRef;
      const { current: filter } = filterNodeRef;
      const { current: eqNodes } = eqNodesRef;
      
      if (!context || !gain || !analyser || !reverb || !filter || eqNodes.length === 0) return;

      // Disconnect all nodes that are about to be reconnected to avoid duplicates
      gain.disconnect();
      const lastEqNode = eqNodes[eqNodes.length - 1];
      lastEqNode.disconnect();
      reverb.disconnect();
      filter.disconnect();

      // Always connect gain to the start of the EQ chain
      gain.connect(eqNodes[0]);
      
      // Connect from the end of the EQ chain to the effects or analyser
      let lastNodeInChain: AudioNode = lastEqNode;

      if (activeEffect === 'ClarityVerb.vst3' && reverb) {
          lastNodeInChain.connect(reverb);
          lastNodeInChain = reverb;
      } else if (activeEffect === 'BassShaper.vst3' && filter) {
          lastNodeInChain.connect(filter);
          lastNodeInChain = filter;
      }
      
      lastNodeInChain.connect(analyser).connect(context.destination);
  }, [activeEffect]);

  useEffect(() => {
    if (eqNodesRef.current.length > 0) {
        eqBands.forEach((gainValue, index) => {
            if (eqNodesRef.current[index]) {
                eqNodesRef.current[index].gain.value = gainValue;
            }
        });
    }
  }, [eqBands]);


  useEffect(() => {
    if (currentTrack) {
      const fetchVibe = async () => {
        setIsVibeLoading(true);
        setVibe('');
        try {
          const newVibe = await getTrackVibe(currentTrack.title, currentTrack.artist);
          setVibe(newVibe);
        } catch (error) {
          console.error(error);
          setVibe('A vibe that transcends words.');
        } finally {
          setIsVibeLoading(false);
        }
      };
      fetchVibe();
    }
  }, [currentTrack]);

  // FIX: The useEffect cleanup for the auth state listener was incorrect. 
  // Returning the unsubscribe function directly is the correct pattern for useEffect cleanup functions and resolves the error.
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  const handleLogin = async () => {
    try {
      // FIX: Use v8 namespaced API for signInWithPopup.
      await auth.signInWithPopup(googleProvider);
    } catch (error) {
      console.error("Authentication error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      // FIX: Use v8 namespaced API for signOut.
      await auth.signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };
  
  const toPrevTrack = useCallback(() => {
    if (tracks.length === 0) return;
    if (currentTrackIndex - 1 < 0) {
      setCurrentTrackIndex(tracks.length - 1);
    } else {
      setCurrentTrackIndex(currentTrackIndex - 1);
    }
  }, [currentTrackIndex, tracks.length]);

  const toNextTrack = useCallback(() => {
    if (tracks.length === 0) return;
    if (repeatMode === 'all' || currentTrackIndex < tracks.length - 1) {
        setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % tracks.length);
    } else {
        setCurrentTrackIndex(0);
        setIsPlaying(false);
    }
  }, [currentTrackIndex, tracks.length, repeatMode]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!currentTrack) {
        audio.src = '';
        return;
    }
    
    if (audio.src !== currentTrack.audioSrc) {
        audio.src = currentTrack.audioSrc;
        setTrackProgress(0);
    }

    if (isPlaying) {
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                if (error.name !== 'AbortError') {
                    console.error("Error playing audio:", error);
                    setPlaybackError("Playback failed. The file might be corrupt or unsupported.");
                    setTimeout(() => setPlaybackError(null), 5000);
                }
            });
        }
    } else {
        audio.pause();
    }
  }, [currentTrack, isPlaying]);
  
  useEffect(() => {
      const audio = audioRef.current;
      const handleTimeUpdate = () => {
          setTrackProgress(audio.currentTime);
      };
      const handleEnded = () => {
        if (repeatMode === 'one') {
            audio.currentTime = 0;
            audio.play();
        } else {
            toNextTrack();
        }
      };

      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);
      return () => {
          audio.removeEventListener('timeupdate', handleTimeUpdate);
          audio.removeEventListener('ended', handleEnded);
      };
  }, [repeatMode, toNextTrack]);


  useEffect(() => {
    return () => {
      audioRef.current.pause();
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.volume = volume;
    }
    if (volume > 0) {
        preMuteVolumeRef.current = volume;
    }
  }, [volume]);

  const onScrub = (value: number) => {
    audioRef.current.currentTime = value;
    setTrackProgress(audioRef.current.currentTime);
  };

  const onScrubEnd = () => {
    if (!isPlaying) {
      setIsPlaying(true);
    }
  };

  const processFilesToTracks = (files: any[], isElectron: boolean): Track[] => {
    return files.map((file, index) => {
        const audioSrc = isElectron
            ? URL.createObjectURL(new Blob([file.data.buffer], { type: file.mimeType }))
            : URL.createObjectURL(file);
        const title = file.name.replace(/\.[^/.]+$/, "");
        return {
            id: Date.now() + index,
            title: title,
            artist: isElectron ? "Local File" : "Local File",
            audioSrc: audioSrc,
            coverArt: `https://picsum.photos/seed/${encodeURIComponent(title)}/500/500`,
        };
    });
  };

  const handleNewTracks = (newTracks: Track[]) => {
      if (newTracks.length > 0) {
          setIsPlaying(false);
          setTracks(newTracks);
          setCurrentTrackIndex(0);
          setLikedTracks(new Set());
          setPlaylistView('all');
          setTimeout(() => setIsPlaying(true), 100);
      }
  };

  const handleElectronFilesSelect = async () => {
      const filesData = await window.electronAPI.openFile();
      const newTracks = processFilesToTracks(filesData, true);
      handleNewTracks(newTracks);
  };
  
  const handleLocalFilesSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0) {
          const newTracks = processFilesToTracks(Array.from(files), false);
          handleNewTracks(newTracks);
      }
  };

  const handleLoadFiles = () => {
      if (window.electronAPI) {
          handleElectronFilesSelect();
      } else {
          fileInputRef.current?.click();
      }
  };


  const handleRepeatToggle = () => {
    const modes: RepeatMode[] = ['none', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeatMode(modes[nextIndex]);
  };

  const handleToggleLike = (trackId: number) => {
    setLikedTracks(prev => {
      const newLikedTracks = new Set(prev);
      if (newLikedTracks.has(trackId)) {
        newLikedTracks.delete(trackId);
      } else {
        newLikedTracks.add(trackId);
      }
      return newLikedTracks;
    });
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
  };
  
  const handleToggleMute = () => {
    if (volume > 0) {
        setVolume(0);
    } else {
        setVolume(preMuteVolumeRef.current);
    }
  };

  const handleLoadVst = async () => {
    if (window.electronAPI) {
        const vstName = await window.electronAPI.openVstFile();
        if (vstName && !effects.includes(vstName)) {
            // Add some "known" effects for simulation
            if (vstName.toLowerCase().includes('verb')) {
                setEffects(prev => [...prev, 'ClarityVerb.vst3']);
            } else if (vstName.toLowerCase().includes('bass') || vstName.toLowerCase().includes('filter')) {
                setEffects(prev => [...prev, 'BassShaper.vst3']);
            } else {
                setEffects(prev => [...prev, vstName]);
            }
        }
    } else {
        // Mock for web
        setEffects(['ClarityVerb.vst3', 'BassShaper.vst3']);
    }
  };

  const handleToggleEffect = (effectName: string) => {
      setActiveEffect(prev => (prev === effectName ? null : effectName));
  };

  const handleEqChange = (bandIndex: number, value: number) => {
      setActivePreset('Custom');
      setEqBands(prev => {
          const newBands = [...prev];
          newBands[bandIndex] = value;
          return newBands;
      });
  };

  const handlePresetSelect = (presetName: string) => {
      if (PRESETS[presetName]) {
          setActivePreset(presetName);
          setEqBands(PRESETS[presetName]);
      }
  };


  const displayedTracks = useMemo(() => {
    if (playlistView === 'liked') {
      return tracks.filter(track => likedTracks.has(track.id));
    }
    return tracks;
  }, [tracks, likedTracks, playlistView]);

  const onTrackSelect = (index: number) => {
    const trackId = displayedTracks[index].id;
    const originalIndex = tracks.findIndex(t => t.id === trackId);

    if (originalIndex !== -1) {
      setCurrentTrackIndex(originalIndex);
      if (!isPlaying) {
        setIsPlaying(true);
      }
    }
  };
  
  return (
    <div className="relative h-screen bg-black text-white overflow-hidden flex">
      <Background />
      <input type="file" ref={fileInputRef} onChange={handleLocalFilesSelect} multiple accept="audio/*" className="hidden" />
      {playbackError && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-red-600/90 text-white px-6 py-2 rounded-lg z-50 shadow-lg backdrop-blur-sm">
              {playbackError}
          </div>
      )}
      <Sidebar playlistView={playlistView} setPlaylistView={setPlaylistView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="relative z-10 flex-1 flex flex-col overflow-hidden">
          <Header user={user} onLogin={handleLogin} onLogout={handleLogout} />
          <div className="flex-grow p-4 md:p-6 overflow-y-auto custom-scrollbar">
            {tracks.length > 0 ? (
              <TrackList
                tracks={displayedTracks}
                currentTrackIndex={displayedTracks.findIndex(t => t.id === currentTrack?.id)}
                onTrackSelect={onTrackSelect}
                onLoadFiles={handleLoadFiles}
                likedTracks={likedTracks}
                onToggleLike={handleToggleLike}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                 <ContentAudioCardFiles onLoadFiles={handleLoadFiles} />
              </div>
            )}
          </div>
        </main>
        
        {currentTrack && (
          <BottomPlayer
            track={currentTrack}
            isPlaying={isPlaying}
            onPlayPauseClick={setIsPlaying}
            onPrevClick={toPrevTrack}
            onNextClick={toNextTrack}
            trackProgress={trackProgress}
            duration={audioRef.current.duration}
            onScrub={onScrub}
            onScrubEnd={onScrubEnd}
            repeatMode={repeatMode}
            onRepeatToggle={handleRepeatToggle}
            vibe={vibe}
            isVibeLoading={isVibeLoading}
            analyserNode={analyserNodeRef.current}
            volume={volume}
            onVolumeChange={handleVolumeChange}
            onToggleMute={handleToggleMute}
            effects={effects}
            activeEffect={activeEffect}
            onLoadVst={handleLoadVst}
            onToggleEffect={handleToggleEffect}
            eqBands={eqBands}
            onEqChange={handleEqChange}
            presets={PRESETS}
            activePreset={activePreset}
            onPresetSelect={handlePresetSelect}
          />
        )}
      </div>
    </div>
  );
};

export default App;
