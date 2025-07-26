import { useState, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Video, VideoOff, Mic, MicOff, Square, Play, ChefHat, Heart } from 'lucide-react';

interface RecordingState {
  isRecording: boolean;
  duration: number;
  videoBlob: Blob | null;
  audioBlob: Blob | null;
}

export const CookingRecorder = ({ onRecordingComplete }: { onRecordingComplete: (recording: any) => void }) => {
  const { toast } = useToast();
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    duration: 0,
    videoBlob: null,
    audioBlob: null,
  });
  const [hasPermissions, setHasPermissions] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const requestPermissions = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 },
          facingMode: 'environment' // Prefer back camera for cooking
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasPermissions(true);
      
      toast({
        title: "Camera Ready! 📹",
        description: "Ready to capture mom's cooking wisdom",
      });
    } catch (error) {
      toast({
        title: "Permission Needed",
        description: "Please allow camera and microphone access to record",
        variant: "destructive",
      });
    }
  }, [toast]);

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;

    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: 'video/webm;codecs=vp9'
    });
    
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setRecordingState(prev => ({ ...prev, videoBlob: blob }));
      onRecordingComplete({
        videoBlob: blob,
        duration: recordingState.duration,
        timestamp: new Date().toISOString(),
      });
    };

    mediaRecorder.start();
    setRecordingState(prev => ({ ...prev, isRecording: true, duration: 0 }));

    // Start duration timer
    intervalRef.current = setInterval(() => {
      setRecordingState(prev => ({ ...prev, duration: prev.duration + 1 }));
    }, 1000);

    toast({
      title: "Recording Started! 🎬",
      description: "Capturing the magic of cooking",
    });
  }, [recordingState.duration, onRecordingComplete, toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState.isRecording) {
      mediaRecorderRef.current.stop();
      setRecordingState(prev => ({ ...prev, isRecording: false }));
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      toast({
        title: "Recording Complete! ✨",
        description: "Processing your mom's recipe...",
      });
    }
  }, [recordingState.isRecording, toast]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <ChefHat className="w-8 h-8 text-primary" />
          <Heart className="w-6 h-6 text-destructive" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-warm bg-clip-text text-transparent">
          Mom's Recipe Keeper
        </h1>
        <p className="text-muted-foreground">
          Capture the love, preserve the tradition
        </p>
      </div>

      {/* Video Preview */}
      <Card className="relative overflow-hidden bg-gradient-subtle shadow-warm">
        <div className="aspect-video bg-muted/20 flex items-center justify-center">
          {hasPermissions ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="text-center space-y-4">
              <Video className="w-16 h-16 text-muted-foreground mx-auto" />
              <div>
                <p className="text-lg font-medium">Ready to start recording?</p>
                <p className="text-sm text-muted-foreground">
                  We'll need camera and microphone access
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Recording Overlay */}
        {recordingState.isRecording && (
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
            <Badge variant="destructive" className="bg-destructive/90">
              REC {formatDuration(recordingState.duration)}
            </Badge>
          </div>
        )}

        {/* Status Indicators */}
        <div className="absolute top-4 right-4 flex gap-2">
          {hasPermissions && (
            <>
              <Badge variant="secondary" className="bg-background/80">
                <Video className="w-3 h-3 mr-1" />
                Camera
              </Badge>
              <Badge variant="secondary" className="bg-background/80">
                <Mic className="w-3 h-3 mr-1" />
                Audio
              </Badge>
            </>
          )}
        </div>
      </Card>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        {!hasPermissions ? (
          <Button 
            onClick={requestPermissions}
            variant="warm"
            size="lg"
            className="px-8"
          >
            <Video className="w-5 h-5 mr-2" />
            Setup Camera & Microphone
          </Button>
        ) : (
          <>
            {!recordingState.isRecording ? (
              <Button 
                onClick={startRecording}
                variant="record"
                size="lg"
                className="px-8"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Recording
              </Button>
            ) : (
              <Button 
                onClick={stopRecording}
                variant="destructive"
                size="lg"
                className="px-8"
              >
                <Square className="w-5 h-5 mr-2" />
                Stop Recording
              </Button>
            )}
          </>
        )}
      </div>

      {/* Instructions */}
      {hasPermissions && !recordingState.isRecording && (
        <Card className="p-6 bg-gradient-subtle">
          <h3 className="font-semibold mb-3 text-center">Recording Tips 💡</h3>
          <div className="grid sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div className="space-y-2">
              <p>• Position camera to see the cooking area clearly</p>
              <p>• Ask mom to describe what she's doing step by step</p>
              <p>• Capture ingredient measurements and techniques</p>
            </div>
            <div className="space-y-2">
              <p>• Record the full cooking process from start to finish</p>
              <p>• Don't worry about pauses - they add charm!</p>
              <p>• Focus on the love and stories behind the recipe</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};