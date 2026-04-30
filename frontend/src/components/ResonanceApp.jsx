import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Search,
  Menu,
  Heart,
  MoreVertical,
  ArrowLeft,
  Shuffle,
  Repeat,
  Upload,
  Plus,
  Home,
  Library,
  Music,
  Youtube,
  X,
  ChevronRight,
  User,
  ChevronLeft,
  Clock,
  Settings,
} from 'lucide-react';
import { trackAPI, handleApiError } from '../services/api';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import FileUploadDialog from './FileUploadDialog';
import YouTubeSearch from './YouTubeSearch';
import Toaster from './Toaster';
import { useToast } from '../hooks/use-toast';
import { mockLibraryData } from '../data/mockData';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Slider } from './ui/slider';
import { ScrollArea } from './ui/scroll-area';

const ResonanceApp = () => {
  const [currentView, setCurrentView] = useState('home');
  const [isFullPlayer, setIsFullPlayer] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [githubAvatar, setGithubAvatar] = useState('');
  const [recentTracks, setRecentTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showYouTubeSearch, setShowYouTubeSearch] = useState(false);
  const [volume, setVolume] = useState(75);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off', 'all', 'one'
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
      const tracks = await trackAPI.getRecentTracks(20);
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
    setRecentTracks(prev => [...uploadedTracks, ...prev].slice(0, 20));
    setShowUploadDialog(false);
  };

  const handleYouTubeTrackSelect = (track) => {
    setRecentTracks(prev => [track, ...prev].slice(0, 20));
    playTrack(track);
    setShowYouTubeSearch(false);
  };

  const toggleRepeat = () => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  const navigationItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'library', label: 'Your Library', icon: Library },
  ];

  const Sidebar = () => (
    <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-black border-r border-gray-800 flex flex-col transition-all duration-300`}>
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          {githubAvatar && (
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <img src={githubAvatar} alt="Resonance" className="w-full h-full object-cover" />
            </div>
          )}
          {!sidebarCollapsed && (
            <h1 className="text-white text-xl font-bold">Resonance</h1>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200 hover:bg-gray-800 ${
                  currentView === item.id ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon size={24} />
                {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* Library Actions */}
        <div className="mt-8 space-y-1">
          {!sidebarCollapsed && (
            <div className="px-3 py-2">
              <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Library</h3>
            </div>
          )}
          <button
            onClick={() => setShowUploadDialog(true)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200 hover:bg-gray-800 text-gray-400 hover:text-white`}
          >
            <Plus size={24} />
            {!sidebarCollapsed && <span className="text-sm">Add Music</span>}
          </button>
          <button
            onClick={() => setShowYouTubeSearch(true)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200 hover:bg-gray-800 text-gray-400 hover:text-white`}
          >
            <Youtube size={24} />
            {!sidebarCollapsed && <span className="text-sm">YouTube</span>}
          </button>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
            <User size={16} className="text-gray-400" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">Guest User</p>
              <p className="text-gray-400 text-xs truncate">Free Account</p>
            </div>
          )}
          {!sidebarCollapsed && (
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Settings size={16} />
            </Button>
          )}
        </div>
      </div>

      {/* Collapse Button */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="absolute top-1/2 -right-4 w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all duration-200"
      >
        {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </div>
  );

  const HomeView = () => (
    <ScrollArea className="flex-1">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Good evening</h1>
          <p className="text-gray-400">Welcome back to Resonance</p>
        </div>

        {/* Recently Played Grid */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Recently Played</h2>
            <Button variant="ghost" className="text-gray-400 hover:text-white">
              Show all
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, idx) => (
                <Card key={idx} className="bg-gray-800 border-gray-700 animate-pulse">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-gray-700 rounded-lg mb-3"></div>
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : recentTracks.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {recentTracks.slice(0, 10).map((track, idx) => (
                <Card
                  key={idx}
                  className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-all duration-200 cursor-pointer group"
                  onClick={() => handleTrackSelect(track)}
                >
                  <CardContent className="p-4">
                    <div className="aspect-square relative mb-3 overflow-hidden rounded-lg">
                      <img
                        src={track.artwork_url}
                        alt={track.title}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                        <Play size={32} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="currentColor" />
                      </div>
                    </div>
                    <h3 className="text-white font-medium text-sm mb-1 truncate">{track.title}</h3>
                    <p className="text-gray-400 text-xs truncate">{track.artist}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-gray-800 border-gray-700 border-dashed">
              <CardContent className="p-12 text-center">
                <Music size={48} className="mx-auto mb-4 text-gray-600" />
                <h3 className="text-white text-lg font-medium mb-2">No music yet</h3>
                <p className="text-gray-400 mb-6">Start building your music library</p>
                <div className="flex justify-center gap-4">
                  <Button onClick={() => setShowUploadDialog(true)} className="bg-green-600 hover:bg-green-700">
                    <Upload size={16} className="mr-2" />
                    Upload Music
                  </Button>
                  <Button onClick={() => setShowYouTubeSearch(true)} variant="outline">
                    <Youtube size={16} className="mr-2" />
                    Search YouTube
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Made for You Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Made for you</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Discover Weekly", subtitle: "Your weekly mixtape of fresh music", color: "from-purple-600 to-blue-600" },
              { title: "Release Radar", subtitle: "New music from artists you follow", color: "from-green-600 to-teal-600" },
              { title: "Daily Mix 1", subtitle: "Made for you", color: "from-red-600 to-pink-600" }
            ].map((playlist, idx) => (
              <Card key={idx} className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-all duration-200 cursor-pointer group">
                <CardContent className="p-4">
                  <div className={`aspect-square bg-gradient-to-br ${playlist.color} rounded-lg mb-3 flex items-center justify-center`}>
                    <Music size={32} className="text-white" />
                  </div>
                  <h3 className="text-white font-medium text-sm mb-1">{playlist.title}</h3>
                  <p className="text-gray-400 text-xs">{playlist.subtitle}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  );

  const SearchView = () => (
    <ScrollArea className="flex-1">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-6">Search</h1>
          <div className="max-w-md">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="What do you want to listen to?"
                className="w-full bg-white text-black rounded-full py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-6">Browse all</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {[
              { title: "Pop", color: "from-pink-500 to-rose-500" },
              { title: "Hip-Hop", color: "from-orange-500 to-red-500" },
              { title: "Rock", color: "from-purple-500 to-indigo-500" },
              { title: "Jazz", color: "from-blue-500 to-cyan-500" },
              { title: "Classical", color: "from-green-500 to-emerald-500" },
              { title: "Electronic", color: "from-yellow-500 to-orange-500" }
            ].map((genre, idx) => (
              <Card key={idx} className={`bg-gradient-to-br ${genre.color} hover:scale-105 transition-transform duration-200 cursor-pointer rounded-lg overflow-hidden`}>
                <CardContent className="p-4 h-24 flex items-end">
                  <h3 className="text-white font-bold text-lg">{genre.title}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  );

  const LibraryView = () => (
    <ScrollArea className="flex-1">
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Your Library</h1>
            <p className="text-gray-400">{recentTracks.length} songs</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Clock size={16} className="mr-2" />
              Recently added
            </Button>
          </div>
        </div>

        {recentTracks.length > 0 ? (
          <div className="space-y-2">
            {recentTracks.map((track, idx) => (
              <Card
                key={idx}
                className="bg-transparent border-transparent hover:bg-gray-800 transition-all duration-200 cursor-pointer group"
                onClick={() => handleTrackSelect(track)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <img
                        src={track.artwork_url}
                        alt={track.title}
                        className="w-full h-full object-cover rounded"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center rounded">
                        <Play size={16} className="text-white opacity-0 group-hover:opacity-100" fill="currentColor" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium text-sm truncate">{track.title}</h3>
                      <p className="text-gray-400 text-xs truncate">{track.artist}</p>
                    </div>
                    <div className="text-gray-400 text-xs">
                      {formatTime(track.duration || 0)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-12 text-center">
              <Library size={48} className="mx-auto mb-4 text-gray-600" />
              <h3 className="text-white text-lg font-medium mb-2">Your library is empty</h3>
              <p className="text-gray-400 mb-6">Add some music to get started</p>
              <div className="flex justify-center gap-4">
                <Button onClick={() => setShowUploadDialog(true)} className="bg-green-600 hover:bg-green-700">
                  <Upload size={16} className="mr-2" />
                  Upload Music
                </Button>
                <Button onClick={() => setShowYouTubeSearch(true)} variant="outline">
                  <Youtube size={16} className="mr-2" />
                  Search YouTube
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );

  const FullPlayerView = () => (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      <div className="relative h-full flex flex-col">
        {/* Top Controls */}
        <div className="flex justify-between items-center p-6">
          <button
            onClick={() => setIsFullPlayer(false)}
            className="text-white hover:text-gray-300 transition-colors p-2 rounded-full hover:bg-white hover:bg-opacity-10"
          >
            <X size={24} />
          </button>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="text-white hover:text-gray-300">
              <Heart size={20} />
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:text-gray-300">
              <MoreVertical size={20} />
            </Button>
          </div>
        </div>

        {/* Center Content */}
        <div className="flex-1 flex flex-col justify-center items-center px-6 max-w-2xl mx-auto">
          {/* Album Art */}
          <div className="mb-8">
            <div className="w-80 h-80 rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={currentTrack.artwork_url}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Track Info */}
          <div className="text-center mb-8">
            <h1 className="text-white text-3xl font-bold mb-2">{currentTrack.title}</h1>
            <p className="text-gray-300 text-xl mb-4">{currentTrack.artist}</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-gray-400 text-sm bg-gray-800 px-3 py-1 rounded-full">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-md mb-8">
            <Slider
              value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
              onValueChange={(value) => seek((value[0] / 100) * duration)}
              max={100}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Player Controls */}
          <div className="flex items-center gap-6 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsShuffle(!isShuffle)}
              className={`text-white hover:text-green-400 ${isShuffle ? 'text-green-400' : ''}`}
            >
              <Shuffle size={20} />
            </Button>

            <Button
              variant="ghost"
              size="lg"
              onClick={playPrevious}
              className="text-white hover:text-gray-300"
            >
              <SkipBack size={24} />
            </Button>

            <Button
              onClick={togglePlayPause}
              className="w-14 h-14 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
            >
              {isPlaying ? (
                <Pause size={24} fill="black" />
              ) : (
                <Play size={24} fill="black" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="lg"
              onClick={playNext}
              className="text-white hover:text-gray-300"
            >
              <SkipForward size={24} />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleRepeat}
              className={`text-white hover:text-green-400 ${
                repeatMode === 'all' ? 'text-green-400' :
                repeatMode === 'one' ? 'text-green-400' : ''
              }`}
            >
              <Repeat size={20} />
              {repeatMode === 'one' && <span className="text-xs ml-1">1</span>}
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-4 w-full max-w-md">
            <Volume2 size={20} className="text-gray-400" />
            <Slider
              value={[volume]}
              onValueChange={(value) => setVolume(value[0])}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-gray-400 text-sm w-8">{volume}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const BottomPlayerBar = () => (
    <div className="bg-gray-900 border-t border-gray-700 p-4 flex items-center gap-4">
      {/* Track Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div
          className="w-14 h-14 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform flex-shrink-0"
          onClick={() => setIsFullPlayer(true)}
        >
          <img
            src={currentTrack.artwork_url}
            alt={currentTrack.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-white font-medium text-sm truncate">{currentTrack.title}</h4>
          <p className="text-gray-400 text-xs truncate">{currentTrack.artist}</p>
        </div>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white flex-shrink-0">
          <Heart size={16} />
        </Button>
      </div>

      {/* Player Controls */}
      <div className="flex flex-col items-center gap-2 flex-1 max-w-md">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsShuffle(!isShuffle)}
            className={`text-gray-400 hover:text-white ${isShuffle ? 'text-green-400' : ''}`}
          >
            <Shuffle size={16} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={playPrevious}
            className="text-gray-400 hover:text-white"
          >
            <SkipBack size={16} />
          </Button>

          <Button
            onClick={togglePlayPause}
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
          >
            {isPlaying ? (
              <Pause size={12} fill="black" />
            ) : (
              <Play size={12} fill="black" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={playNext}
            className="text-gray-400 hover:text-white"
          >
            <SkipForward size={16} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleRepeat}
            className={`text-gray-400 hover:text-white ${repeatMode !== 'off' ? 'text-green-400' : ''}`}
          >
            <Repeat size={16} />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 w-full">
          <span className="text-xs text-gray-400 w-10 text-right">{formatTime(currentTime)}</span>
          <Slider
            value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
            onValueChange={(value) => seek((value[0] / 100) * duration)}
            max={100}
            step={0.1}
            className="flex-1"
          />
          <span className="text-xs text-gray-400 w-10">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
        <Volume2 size={16} className="text-gray-400 flex-shrink-0" />
        <Slider
          value={[volume]}
          onValueChange={(value) => setVolume(value[0])}
          max={100}
          step={1}
          className="w-24"
        />
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-black text-white flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-gradient-to-b from-gray-900 to-black p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="text-gray-400 hover:text-white"
              >
                <Menu size={20} />
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.history.back()}
                  className="text-gray-400 hover:text-white rounded-full w-8 h-8 p-0"
                >
                  <ArrowLeft size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.history.forward()}
                  className="text-gray-400 hover:text-white rounded-full w-8 h-8 p-0"
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="text-gray-400 hover:text-white">
                Upgrade
              </Button>
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                <User size={16} className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {currentView === 'home' && <HomeView />}
        {currentView === 'search' && <SearchView />}
        {currentView === 'library' && <LibraryView />}

        {/* Bottom Player Bar */}
        {currentTrack && <BottomPlayerBar />}
      </div>

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
      <Toaster />
    </div>
  );
};

export default ResonanceApp;