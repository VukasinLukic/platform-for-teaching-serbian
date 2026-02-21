import { useEffect, useRef, useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functionsEU } from '../../services/firebase';
import { Loader2, AlertCircle, Play } from 'lucide-react';

export default function VideoPlayer({ lessonId, onProgress }) {
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [lessonTitle, setLessonTitle] = useState('');

  useEffect(() => {
    if (!lessonId) {
      setError('Lesson ID je obavezan');
      setLoading(false);
      return;
    }

    loadVideo();
  }, [lessonId]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !onProgress) return;

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      const duration = video.duration;
      if (duration > 0 && Math.floor(currentTime) % 5 === 0) {
        onProgress(lessonId, (currentTime / duration) * 100, currentTime);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [videoUrl, onProgress, lessonId]);

  const loadVideo = async () => {
    try {
      setLoading(true);
      setError(null);
      setVideoUrl(null);

      const getVideoUrl = httpsCallable(functionsEU, 'getVideoUrl');
      const result = await getVideoUrl({ lessonId });

      if (!result.data || !result.data.url) {
        throw new Error('Video URL nije dostupan');
      }

      setVideoUrl(result.data.url);
      setLessonTitle(result.data.lessonTitle || 'Video lekcija');
      setLoading(false);
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
        <div className="px-6 py-4 bg-[#1A1A1A]">
          <h3 className="text-lg font-bold text-white flex items-center">
            <Play className="h-5 w-5 text-white mr-2" />
            {lessonTitle}
          </h3>
        </div>
      )}
      <div className="bg-black">
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          controlsList="nodownload"
          playsInline
          className="w-full"
          style={{ maxHeight: '70vh' }}
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>
    </div>
  );
}
