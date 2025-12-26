import { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../services/firebase';
import { Loader2, AlertCircle, Play } from 'lucide-react';

/**
 * VideoPlayer Component
 * Plays protected video content using signed URLs from Cloud Functions
 * @param {string} lessonId - The ID of the lesson to play
 * @param {function} onProgress - Optional callback for tracking video progress
 */
export default function VideoPlayer({ lessonId, onProgress }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lessonTitle, setLessonTitle] = useState('');

  useEffect(() => {
    if (!lessonId) {
      setError('Lesson ID je obavezan');
      setLoading(false);
      return;
    }

    loadVideo();

    // Cleanup on unmount
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [lessonId]);

  const loadVideo = async () => {
    try {
      setLoading(true);
      setError(null);

      // Call Cloud Function to get signed URL
      const getVideoUrl = httpsCallable(functions, 'getVideoUrl');
      const result = await getVideoUrl({ lessonId });

      if (!result.data || !result.data.url) {
        throw new Error('Video URL nije dostupan');
      }

      const { url, lessonTitle: title } = result.data;
      setLessonTitle(title || 'Video lekcija');

      // Dispose existing player if any
      if (playerRef.current) {
        playerRef.current.dispose();
      }

      // Initialize Video.js player
      playerRef.current = videojs(videoRef.current, {
        controls: true,
        autoplay: false,
        preload: 'auto',
        fluid: true,
        responsive: true,
        playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
        controlBar: {
          volumePanel: {
            inline: false,
          },
          pictureInPictureToggle: true,
          fullscreenToggle: true,
        },
        // Disable right-click and download
        html5: {
          vhs: {
            overrideNative: true,
          },
          nativeVideoTracks: false,
          nativeAudioTracks: false,
          nativeTextTracks: false,
        },
        sources: [
          {
            src: url,
            type: 'video/mp4',
          },
        ],
      });

      // Disable download attribute
      const videoElement = playerRef.current.el().querySelector('video');
      if (videoElement) {
        videoElement.controlsList = 'nodownload';
        videoElement.disablePictureInPicture = false;
        videoElement.oncontextmenu = (e) => e.preventDefault();
      }

      // Track video progress
      if (onProgress) {
        playerRef.current.on('timeupdate', () => {
          const currentTime = playerRef.current.currentTime();
          const duration = playerRef.current.duration();
          const progress = (currentTime / duration) * 100;

          // Call progress callback every 5 seconds
          if (Math.floor(currentTime) % 5 === 0) {
            onProgress(lessonId, progress, currentTime);
          }
        });
      }

      // Handle player ready
      playerRef.current.ready(() => {
        setLoading(false);
      });

      // Handle errors
      playerRef.current.on('error', (err) => {
        console.error('Video player error:', err);
        setError('Greška pri učitavanju videa. Molimo pokušajte ponovo.');
        setLoading(false);
      });
    } catch (err) {
      console.error('Error loading video:', err);

      let errorMessage = 'Greška pri učitavanju videa';

      if (err.code === 'unauthenticated') {
        errorMessage = 'Molimo prijavite se da biste gledali video';
      } else if (err.code === 'permission-denied') {
        errorMessage = 'Nemate pristup ovom kursu. Molimo kupite kurs da biste pristupili lekcijama.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground text-lg">Učitavanje videa...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
        <div className="bg-destructive/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
        <h3 className="text-2xl font-bold text-destructive mb-3">Greška</h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">{error}</p>
        <button onClick={loadVideo} className="btn-primary">
          Pokušaj ponovo
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {lessonTitle && (
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-lg font-bold text-foreground flex items-center">
            <Play className="h-5 w-5 text-primary mr-2" />
            {lessonTitle}
          </h3>
        </div>
      )}
      <div data-vjs-player className="bg-black">
        <video
          ref={videoRef}
          className="video-js vjs-big-play-centered vjs-16-9"
          playsInline
        />
      </div>
    </div>
  );
}
