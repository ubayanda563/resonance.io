import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Search, Menu, Heart, MoreVertical, ArrowLeft, Shuffle, Repeat, Upload, Plus } from 'lucide-react';
import { trackAPI, handleApiError } from '../services/api';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import FileUploadDialog from './FileUploadDialog';
import YouTubeSearch from './YouTubeSearch';
import Toaster from './Toaster';
import { useToast } from '../hooks/use-toast';
import { mockLibraryData } from '../data/mockData';

const ResonanceApp = () => {
  const [currentView, setCurrentView] = useState('library');
  const [isFullPlayer, setIsFullPlayer] = useState(false);
  const [githubAvatar, setGithubAvatar] = useState('');
  const [recentTracks, setRecentTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showYouTubeSearch, setShowYouTubeSearch] = useState(false);
  const { toast } = useToast();
  
  // Audio player hook
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlayPause,
    playTrack,
    formatTime,
    seek,
    playNext,
    playPrevious,
  } = useAudioPlayer();

  // Fetch GitHub avatar
  useEffect(() => {
    fetch('https://api.github.com/users/Moodstlbn')
      .then(res => res.json())
      .then(data => setGithubAvatar(data.avatar_url))
      .catch(() => setGithubAvatar('https://github.com/Moodstlbn.png'));
  }, []);

  // Load recent tracks
  useEffect(() => {
    loadRecentTracks();
  }, []);

  const loadRecentTracks = async () => {
    setIsLoading(true);
    try {
      const tracks = await trackAPI.getRecentTracks(9);
      setRecentTracks(tracks);
    } catch (error) {
      const errorInfo = handleApiError(error);
      toast({
        title: "Failed to load tracks",
        description: errorInfo.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackSelect = (track) => {
    playTrack(track, recentTracks);
  };

  const handleUploadComplete = (uploadedTracks) => {
    setRecentTracks(prev => [...uploadedTracks, ...prev].slice(0, 9));
    setShowUploadDialog(false);
  };

  const handleYouTubeTrackSelect = (track) => {
    setRecentTracks(prev => [track, ...prev].slice(0, 9));
    playTrack(track);
    setShowYouTubeSearch(false);
  };

  const LibraryView = () => (
    <div className="flex-1 p-6">
      <div className="grid grid-cols-2 gap-6">
        {mockLibraryData.map((category, idx) => (
          <div 
            key={idx} 
            className="flex items-center gap-4 cursor-pointer hover:bg-gray-800 p-3 rounded-lg transition-all duration-200"
            onClick={() => category.id === 'recently-added' && setCurrentView('recently-added')}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              category.color === 'red' ? 'bg-red-600' : 'bg-gray-600'
            }`}>
              {category.icon}
            </div>
            <div>
              <h3 className="text-blue-400 font-medium text-lg">{category.title}</h3>
              {category.subtitle && (
                <p className="text-gray-400 text-sm">{category.subtitle}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const RecentlyAddedView = () => (
    <div className="flex-1 p-6">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => setCurrentView('library')}
          className="text-red-500 hover:text-red-400 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-blue-400 text-2xl font-medium">RECENTLY ADDED</h2>
      </div>
      
      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setShowUploadDialog(true)}
          className="text-blue-500 hover:text-blue-400 transition-colors flex items-center gap-2"
          title="Upload Music Files"
        >
          <Upload size={20} />
        </button>
        <button 
          onClick={() => setShowYouTubeSearch(true)}
          className="text-red-500 hover:text-red-400 transition-colors flex items-center gap-2"
          title="Search YouTube Music"
        >
          <Search size={20} />
        </button>
        <button 
          onClick={() => recentTracks.length > 0 && handleTrackSelect(recentTracks[0])}
          className="text-green-500 hover:text-green-400 transition-colors"
          disabled={recentTracks.length === 0}
          title="Play All"
        >
          <Play size={20} fill="currentColor" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 9 }).map((_, idx) => (
            <div key={idx} className="animate-pulse">
              <div className="aspect-square bg-gray-700 rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-700 rounded mb-1"></div>
              <div className="h-3 bg-gray-700 rounded w-3/4"></div>
            </div>
          ))
        ) : recentTracks.length > 0 ? (
          recentTracks.map((track, idx) => (
          <div 
            key={idx} 
            className="cursor-pointer hover:scale-105 transition-transform duration-200"
            onClick={() => handleTrackSelect(track)}
          >
            <div className="aspect-square mb-3 overflow-hidden rounded-lg">
              <img 
                src={track.artwork_url} 
                alt={track.title}
                className="w-full h-full object-cover"
              />
            </div>
            <h4 className="text-blue-400 font-medium text-sm mb-1 truncate">{track.title}</h4>
            <p className="text-gray-400 text-xs truncate">{track.artist}</p>
          </div>
        ))
        ) : (
          <div className="col-span-3 text-center py-12">
            <div className="text-gray-400 mb-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
                <Upload size={32} />
              </div>
              <p className="text-lg mb-2">No music in your library yet</p>
              <p className="text-sm mb-6">Upload your music files or search YouTube to get started</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowUploadDialog(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Upload size={16} />
                  Upload Files
                </button>
                <button
                  onClick={() => setShowYouTubeSearch(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Search size={16} />
                  Search YouTube
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const FullPlayerView = () => (
    <div className="fixed inset-0 z-50" style={{
      backgroundImage: `url(${currentTrack.artwork_url})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      <div className="absolute inset-0 bg-black bg-opacity-40" />
      {/* Fading gradient covering 60% from bottom */}
      <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black via-black/80 to-transparent" />
      <div className="relative h-full flex flex-col">
        {/* Top Controls */}
        <div className="flex justify-between items-center p-6">
          <button 
            onClick={() => setIsFullPlayer(false)}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex gap-4">
            <button className="text-white hover:text-gray-300 transition-colors">
              <Heart size={24} />
            </button>
            <button className="text-white hover:text-gray-300 transition-colors">
              <Menu size={24} />
            </button>
            <button className="text-white hover:text-gray-300 transition-colors">
              <MoreVertical size={24} />
            </button>
          </div>
        </div>

        {/* Center Content */}
        <div className="flex-1 flex flex-col justify-center items-center px-6">
          <div className="text-center mb-8">
            <h1 className="text-white text-2xl font-bold mb-2">{currentTrack.title}</h1>
            <p className="text-blue-400 text-lg">{currentTrack.artist}</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-white bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
                {formatTime(currentTime)}/{formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Player Controls */}
          <div className="flex items-center gap-8 mb-8">
            <button 
              onClick={playPrevious}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <SkipBack size={32} fill="currentColor" />
            </button>
            <button 
              onClick={() => seek(Math.max(0, currentTime - 10))}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <SkipBack size={24} />
            </button>
            <button 
              onClick={togglePlayPause}
              className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all"
            >
              {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
            </button>
            <button 
              onClick={() => seek(Math.min(duration, currentTime + 10))}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <SkipForward size={24} />
            </button>
            <button 
              onClick={playNext}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <SkipForward size={32} fill="currentColor" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-md mb-4">
            <div className="flex justify-between text-white text-sm mb-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div 
              className="relative h-1 bg-white bg-opacity-30 rounded-full cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const newTime = (clickX / rect.width) * duration;
                seek(newTime);
              }}
            >
              <div 
                className="absolute h-full bg-red-500 rounded-full transition-all duration-200"
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              />
              <div 
                className="absolute w-3 h-3 bg-red-500 rounded-full top-1/2 transform -translate-y-1/2 transition-all duration-200"
                style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
          </div>

          <button className="text-white bg-black bg-opacity-50 px-4 py-2 rounded-full hover:bg-opacity-70 transition-all">
            <span className="text-sm">QUEUE</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-4">
          {githubAvatar && (
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-400">
              <img 
                src={githubAvatar} 
                alt="Resonance Logo" 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <h1 className="text-blue-400 text-3xl font-bold">RESONANCE</h1>
        </div>
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full" />
          <div className="w-2 h-2 bg-yellow-500 rounded-full" />
          <div className="w-2 h-2 bg-green-500 rounded-full" />
        </div>
      </div>

      {/* Main Content */}
      {currentView === 'library' && <LibraryView />}
      {currentView === 'recently-added' && <RecentlyAddedView />}

      {/* Bottom Player Bar */}
      {currentTrack && (
        <div className="bg-gray-900 p-4 flex items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div 
              className="w-12 h-12 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform"
              onClick={() => setIsFullPlayer(true)}
            >
              <img 
                src={currentTrack.artwork_url} 
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-medium text-sm truncate">{currentTrack.title}</h4>
              <p className="text-blue-400 text-xs truncate">{currentTrack.artist}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-red-500 hover:text-red-400 transition-colors">
              <div className="grid grid-cols-3 gap-1">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="w-1 h-1 bg-current rounded-full" />
                ))}
              </div>
            </button>
            <button 
              onClick={togglePlayPause}
              className="text-white hover:text-gray-300 transition-colors"
            >
              {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
            </button>
            <button className="text-white hover:text-gray-300 transition-colors">
              <Search size={24} />
            </button>
            <button className="text-white hover:text-gray-300 transition-colors">
              <Menu size={24} />
            </button>
          </div>
        </div>
      )}

      {/* Full Player Overlay */}
      {isFullPlayer && currentTrack && <FullPlayerView />}

      {/* Upload Dialog */}
      <FileUploadDialog
        isOpen={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        onUploadComplete={handleUploadComplete}
      />

      {/* YouTube Search Dialog */}
      <YouTubeSearch
        isOpen={showYouTubeSearch}
        onClose={() => setShowYouTubeSearch(false)}
        onTrackSelect={handleYouTubeTrackSelect}
      />

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
};

export default ResonanceApp;