import { useState, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Video, VideoOff, Mic, MicOff, Square, Play, ChefHat, Pause } from 'lucide-react';

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  videoBlob: Blob | null;
  audioBlob: Blob | null;
}

export const CookingRecorder = ({ onRecordingComplete }: { onRecordingComplete: (recording: any) => void }) => {
  const { toast } = useToast();
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
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
        title: "Camera Ready",
        description: "Ready to record cooking process",
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
    setRecordingState(prev => ({ ...prev, isRecording: true, isPaused: false, duration: 0 }));

    // Start duration timer
    intervalRef.current = setInterval(() => {
      setRecordingState(prev => 
        prev.isPaused ? prev : { ...prev, duration: prev.duration + 1 }
      );
    }, 1000);

    toast({
      title: "Recording Started",
      description: "Capturing cooking process",
    });
  }, [recordingState.duration, onRecordingComplete, toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState.isRecording) {
      mediaRecorderRef.current.stop();
      setRecordingState(prev => ({ ...prev, isRecording: false, isPaused: false }));
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      toast({
        title: "Recording Complete",
        description: "Processing recipe data...",
      });
    }
  }, [recordingState.isRecording, toast]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState.isRecording && !recordingState.isPaused) {
      mediaRecorderRef.current.pause();
      setRecordingState(prev => ({ ...prev, isPaused: true }));
      
      toast({
        title: "Recording Paused",
        description: "Click resume to continue recording",
      });
    }
  }, [recordingState.isRecording, recordingState.isPaused, toast]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState.isRecording && recordingState.isPaused) {
      mediaRecorderRef.current.resume();
      setRecordingState(prev => ({ ...prev, isPaused: false }));
      
      toast({
        title: "Recording Resumed",
        description: "Continuing to capture cooking process",
      });
    }
  }, [recordingState.isRecording, recordingState.isPaused, toast]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <ChefHat className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold text-foreground">
          Recipe Recorder
        </h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Capture cooking processes and transform them into structured recipes
        </p>
      </div>

      {/* Video Preview */}
      <Card className="relative overflow-hidden border shadow-subtle">
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
            <div className={`w-3 h-3 rounded-full ${recordingState.isPaused ? 'bg-yellow-500' : 'bg-destructive animate-pulse'}`} />
            <Badge variant={recordingState.isPaused ? "secondary" : "destructive"} className={recordingState.isPaused ? "bg-yellow-500/20 text-yellow-700" : "bg-destructive/90"}>
              {recordingState.isPaused ? 'PAUSED' : 'REC'} {formatDuration(recordingState.duration)}
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
            variant="default"
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
                variant="destructive"
                size="lg"
                className="px-8"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Recording
              </Button>
            ) : (
              <div className="flex gap-3">
                {!recordingState.isPaused ? (
                  <Button 
                    onClick={pauseRecording}
                    variant="secondary"
                    size="lg"
                    className="px-6"
                  >
                    <Pause className="w-5 h-5 mr-2" />
                    Pause
                  </Button>
                ) : (
                  <Button 
                    onClick={resumeRecording}
                    variant="destructive"
                    size="lg"
                    className="px-6"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Resume
                  </Button>
                )}
                <Button 
                  onClick={stopRecording}
                  variant="outline"
                  size="lg"
                  className="px-6"
                >
                  <Square className="w-5 h-5 mr-2" />
                  Stop & Process
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Instructions */}
      {hasPermissions && !recordingState.isRecording && (
        <Card className="p-6 bg-muted/50 border">
          <h3 className="font-medium mb-4 text-center">Recording Guidelines</h3>
          <div className="grid sm:grid-cols-2 gap-6 text-sm text-muted-foreground">
            <div className="space-y-3">
              <p>• Position camera clearly</p>
              <p>• Describe each step</p>
              <p>• Include measurements</p>
              <p>• Use pause if you need breaks</p>
            </div>
            <div className="space-y-3">
              <p>• Record full process</p>
              <p>• Speak clearly</p>
              <p>• Include techniques</p>
              <p>• AI will piece segments together</p>
            </div>
          </div>
        </Card>
      )}

      {/* Pause Instructions */}
      {recordingState.isRecording && (
        <Card className="p-4 bg-muted/30 border text-center">
          <p className="text-sm text-muted-foreground">
            {recordingState.isPaused 
              ? "Recording is paused. Resume when ready to continue."
              : "Feel free to pause if you need a break. The AI will seamlessly combine all segments."
            }
          </p>
        </Card>
      )}
    </div>
  );
};