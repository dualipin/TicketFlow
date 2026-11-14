import React, { useEffect, useRef, useState } from 'react';
import type { TicketAdjunto } from '../../api/types.ts';
import {
  MEDIA_LIMITS,
  captureVideoFrameToFile,
  compressImageFile,
  formatBytes,
  formatDuration,
  getBestSupportedAudioMime,
  getBestSupportedVideoMime,
} from '../../lib/media-compression.ts';
import {
  useDeleteTicketAdjunto,
  useUploadTicketAdjunto,
} from '../../queries/tickets/mutations.ts';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert.tsx';
import { Badge } from '../ui/badge.tsx';
import { Button } from '../ui/button.tsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog.tsx';
import { Separator } from '../ui/separator.tsx';
import { toast } from 'sonner';
import { Spinner } from '../ui/spinner.tsx';
import {
  Camera,
  Film,
  Maximize2,
  Mic,
  Pause,
  Play,
  RefreshCw,
  Square,
  Trash2,
  Upload,
  Video,
} from 'lucide-react';

interface TicketMediaCaptureProps {
  adjuntos: TicketAdjunto[];
  onChange?: (next: TicketAdjunto[]) => void;
  ticketId?: number;
  compact?: boolean;
}

export const TicketMediaCapture: React.FC<TicketMediaCaptureProps> = ({
  adjuntos,
  onChange,
  ticketId,
  compact = false,
}) => {
  const uploadMutation = useUploadTicketAdjunto();
  const deleteMutation = useDeleteTicketAdjunto();

  const imageInputRef = useRef<HTMLInputElement | null>(null);

  // Camera & Video Recorder state
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const recordingStartRef = useRef<number>(0);

  const [cameraMode, setCameraMode] = useState<'IDLE' | 'PHOTO_PREVIEW' | 'VIDEO_PREVIEW' | 'RECORDING_VIDEO'>('IDLE');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Audio Recorder state
  const [audioStatus, setAudioStatus] = useState<'IDLE' | 'RECORDING' | 'PAUSED'>('IDLE');
  const [audioSeconds, setAudioSeconds] = useState(0);

  // Status & Lightbox state
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [lightboxItem, setLightboxItem] = useState<TicketAdjunto | null>(null);

  const images = adjuntos.filter((a) => a.tipo === 'IMAGEN');
  const audios = adjuntos.filter((a) => a.tipo === 'AUDIO');
  const videos = adjuntos.filter((a) => a.tipo === 'VIDEO');

  const stopActiveMedia = () => {
    if (timerIntervalRef.current) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    if (mediaStreamRef.current) {
      for (const track of mediaStreamRef.current.getTracks()) {
        track.stop();
      }
      mediaStreamRef.current = null;
    }
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
    }
    setCameraMode('IDLE');
    setAudioStatus('IDLE');
    setRecordingSeconds(0);
    setAudioSeconds(0);
  };

  useEffect(() => {
    return () => {
      stopActiveMedia();
    };
  }, []);

  const appendAdjunto = (created: TicketAdjunto) => {
    onChange?.([...adjuntos, created]);
  };

  // 1. Subida y compresión de múltiples imágenes
  const handleSelectImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setMediaError(null);
    const remainingSlots = MEDIA_LIMITS.MAX_IMAGES - images.length;
    if (remainingSlots <= 0) {
      setMediaError(`Ya alcanzaste el límite de ${MEDIA_LIMITS.MAX_IMAGES} imágenes.`);
      e.target.value = '';
      return;
    }

    const filesToUpload = Array.from(fileList).slice(0, remainingSlots);
    setIsProcessingFiles(true);

    const newlyUploaded: TicketAdjunto[] = [];
    for (const rawFile of filesToUpload) {
      try {
        const compressed = await compressImageFile(rawFile);
        const created = await uploadMutation.mutateAsync({
          file: compressed,
          ticketId,
        });
        newlyUploaded.push(created);
      } catch (err: any) {
        setMediaError(err?.message || `Error al subir ${rawFile.name}`);
      }
    }

    if (newlyUploaded.length > 0) {
      onChange?.([...adjuntos, ...newlyUploaded]);
      toast.success(
        newlyUploaded.length === 1
          ? 'Fotografía comprimida y adjuntada'
          : `${newlyUploaded.length} fotografías adjuntadas`
      );
    }

    setIsProcessingFiles(false);
    e.target.value = '';
  };

  // 2. Cámara para tomar foto directa
  const startPhotoCamera = async (nextFacing: 'environment' | 'user' = facingMode) => {
    stopActiveMedia();
    setMediaError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: nextFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      mediaStreamRef.current = stream;
      setCameraMode('PHOTO_PREVIEW');
      requestAnimationFrame(() => {
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = stream;
          videoPreviewRef.current.play().catch(() => {});
        }
      });
    } catch {
      setMediaError('No se pudo acceder a la cámara. Verifica los permisos del navegador.');
    }
  };

  const handleSnapPhoto = async () => {
    if (!videoPreviewRef.current) return;
    setIsProcessingFiles(true);
    try {
      const photoFile = await captureVideoFrameToFile(
        videoPreviewRef.current,
        `foto_camara_${Date.now()}.webp`
      );
      stopActiveMedia();
      const created = await uploadMutation.mutateAsync({
        file: photoFile,
        ticketId,
      });
      appendAdjunto(created);
      toast.success('Fotografía capturada y guardada');
    } catch (err: any) {
      setMediaError(err?.message || 'Error al capturar la fotografía.');
    } finally {
      setIsProcessingFiles(false);
    }
  };

  // 3. Grabación de Audio con MediaRecorder
  const startAudioRecording = async () => {
    stopActiveMedia();
    setMediaError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      mediaStreamRef.current = stream;

      const { mimeType, ext } = getBestSupportedAudioMime();
      const recorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: MEDIA_LIMITS.AUDIO_BITS_PER_SECOND,
      });

      recordedChunksRef.current = [];
      recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) {
          recordedChunksRef.current.push(ev.data);
        }
      };

      const startTime = Date.now();
      recordingStartRef.current = startTime;

      recorder.onstop = async () => {
        const durationSec = Math.max(1, (Date.now() - recordingStartRef.current) / 1000);
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        for (const track of stream.getTracks()) {
          track.stop();
        }
        mediaStreamRef.current = null;

        if (blob.size === 0) return;

        setIsProcessingFiles(true);
        try {
          const audioFile = new File([blob], `nota_voz_${Date.now()}.${ext}`, {
            type: mimeType.split(';')[0] || 'audio/webm',
          });
          const created = await uploadMutation.mutateAsync({
            file: audioFile,
            ticketId,
            duracionSegundos: durationSec,
          });
          appendAdjunto(created);
          toast.success(`Audio grabado (${formatDuration(durationSec)})`);
        } catch (err: any) {
          setMediaError(err?.message || 'No se pudo subir la grabación de audio.');
        } finally {
          setIsProcessingFiles(false);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start(250);
      setAudioStatus('RECORDING');
      setAudioSeconds(0);

      timerIntervalRef.current = window.setInterval(() => {
        setAudioSeconds((prev) => {
          const next = prev + 1;
          if (next >= MEDIA_LIMITS.MAX_AUDIO_SECONDS) {
            stopAudioRecording();
          }
          return next;
        });
      }, 1000);
    } catch {
      setMediaError('No se pudo acceder al micrófono. Verifica los permisos del navegador.');
    }
  };

  const togglePauseAudio = () => {
    const rec = mediaRecorderRef.current;
    if (!rec) return;
    if (rec.state === 'recording') {
      rec.pause();
      setAudioStatus('PAUSED');
      if (timerIntervalRef.current) {
        window.clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    } else if (rec.state === 'paused') {
      rec.resume();
      setAudioStatus('RECORDING');
      timerIntervalRef.current = window.setInterval(() => {
        setAudioSeconds((prev) => {
          const next = prev + 1;
          if (next >= MEDIA_LIMITS.MAX_AUDIO_SECONDS) {
            stopAudioRecording();
          }
          return next;
        });
      }, 1000);
    }
  };

  const stopAudioRecording = () => {
    if (timerIntervalRef.current) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setAudioStatus('IDLE');
    setAudioSeconds(0);
  };

  // 4. Grabación de Video corto con compresión en vivo
  const openVideoCamera = async (nextFacing: 'environment' | 'user' = facingMode) => {
    stopActiveMedia();
    setMediaError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: nextFacing,
          width: { ideal: 1280, max: 1280 },
          height: { ideal: 720, max: 720 },
          frameRate: { ideal: 24, max: 30 },
        },
        audio: true,
      });
      mediaStreamRef.current = stream;
      setCameraMode('VIDEO_PREVIEW');
      requestAnimationFrame(() => {
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = stream;
          videoPreviewRef.current.play().catch(() => {});
        }
      });
    } catch {
      setMediaError('No se pudo acceder a la cámara y micrófono para grabar video.');
    }
  };

  const startVideoRecording = () => {
    const stream = mediaStreamRef.current;
    if (!stream) return;

    const { mimeType, ext } = getBestSupportedVideoMime();
    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: MEDIA_LIMITS.VIDEO_BITS_PER_SECOND,
      audioBitsPerSecond: MEDIA_LIMITS.AUDIO_BITS_PER_SECOND,
    });

    recordedChunksRef.current = [];
    recorder.ondataavailable = (ev) => {
      if (ev.data && ev.data.size > 0) {
        recordedChunksRef.current.push(ev.data);
      }
    };

    recordingStartRef.current = Date.now();

    recorder.onstop = async () => {
      const durationSec = Math.max(1, (Date.now() - recordingStartRef.current) / 1000);
      const blob = new Blob(recordedChunksRef.current, { type: mimeType });

      for (const track of stream.getTracks()) {
        track.stop();
      }
      mediaStreamRef.current = null;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = null;
      }

      if (blob.size === 0) return;

      setIsProcessingFiles(true);
      try {
        const videoFile = new File([blob], `video_evidencia_${Date.now()}.${ext}`, {
          type: mimeType.split(';')[0] || 'video/webm',
        });
        const created = await uploadMutation.mutateAsync({
          file: videoFile,
          ticketId,
          duracionSegundos: durationSec,
        });
        appendAdjunto(created);
        toast.success(
          `Video comprimido y guardado (${formatDuration(durationSec)} · ${formatBytes(created.tamanoBytes)})`
        );
      } catch (err: any) {
        setMediaError(err?.message || 'Error al subir el video.');
      } finally {
        setIsProcessingFiles(false);
      }
    };

    mediaRecorderRef.current = recorder;
    recorder.start(250);
    setCameraMode('RECORDING_VIDEO');
    setRecordingSeconds(0);

    timerIntervalRef.current = window.setInterval(() => {
      setRecordingSeconds((prev) => {
        const next = prev + 1;
        if (next >= MEDIA_LIMITS.MAX_VIDEO_SECONDS) {
          stopVideoRecording();
        }
        return next;
      });
    }, 1000);
  };

  const stopVideoRecording = () => {
    if (timerIntervalRef.current) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setCameraMode('IDLE');
    setRecordingSeconds(0);
  };

  const handleFlipCamera = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    if (cameraMode === 'PHOTO_PREVIEW') {
      startPhotoCamera(nextFacing);
    } else if (cameraMode === 'VIDEO_PREVIEW') {
      openVideoCamera(nextFacing);
    }
  };

  const handleRemoveAdjunto = async (item: TicketAdjunto) => {
    try {
      await deleteMutation.mutateAsync({ id: item.id, ticketId: item.ticketId ?? ticketId });
      onChange?.(adjuntos.filter((a) => a.id !== item.id));
      toast.info('Evidencia eliminada');
    } catch (err: any) {
      setMediaError(err?.message || 'No se pudo eliminar el archivo.');
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Input oculto para selección de fotografías */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        multiple
        className="hidden"
        onChange={handleSelectImages}
      />

      {/* Barra compacta de acciones directas */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => imageInputRef.current?.click()}
          disabled={isProcessingFiles || images.length >= MEDIA_LIMITS.MAX_IMAGES}
        >
          <Upload data-icon="inline-start" />
          <span>Subir foto</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            cameraMode === 'PHOTO_PREVIEW' ? stopActiveMedia() : startPhotoCamera()
          }
          disabled={isProcessingFiles || images.length >= MEDIA_LIMITS.MAX_IMAGES}
        >
          <Camera data-icon="inline-start" />
          <span>{cameraMode === 'PHOTO_PREVIEW' ? 'Cerrar cámara' : 'Tomar foto'}</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            audioStatus === 'IDLE' ? startAudioRecording() : stopAudioRecording()
          }
          disabled={isProcessingFiles}
        >
          <Mic data-icon="inline-start" />
          <span>{audioStatus === 'IDLE' ? 'Grabar audio' : 'Detener audio'}</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            cameraMode === 'VIDEO_PREVIEW' || cameraMode === 'RECORDING_VIDEO'
              ? stopActiveMedia()
              : openVideoCamera()
          }
          disabled={isProcessingFiles}
        >
          <Video data-icon="inline-start" />
          <span>
            {cameraMode === 'VIDEO_PREVIEW' || cameraMode === 'RECORDING_VIDEO'
              ? 'Cerrar video'
              : 'Grabar video'}
          </span>
        </Button>

        {isProcessingFiles && (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Spinner className="size-3" />
            <span>Subiendo...</span>
          </span>
        )}
      </div>

      {/* Visor de cámara de fotos */}
      {cameraMode === 'PHOTO_PREVIEW' && (
        <div className="relative flex flex-col gap-2 rounded-xl border border-border bg-card p-2.5">
          <video
            ref={videoPreviewRef}
            muted
            playsInline
            className="w-full max-h-52 rounded-lg bg-muted object-cover"
          />
          <div className="flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleFlipCamera}
            >
              <RefreshCw data-icon="inline-start" />
              <span>Cambiar cámara</span>
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSnapPhoto}
              disabled={isProcessingFiles}
            >
              <Camera data-icon="inline-start" />
              <span>Capturar foto</span>
            </Button>
          </div>
        </div>
      )}

      {/* Control activo de grabación de audio */}
      {audioStatus !== 'IDLE' && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/40 bg-primary/5 px-3 py-2.5">
          <div className="flex items-center gap-2.5">
            <span className="size-2.5 rounded-full bg-destructive animate-ping" />
            <span className="font-mono tabular-nums text-xs font-semibold text-foreground">
              {formatDuration(audioSeconds)} / {formatDuration(MEDIA_LIMITS.MAX_AUDIO_SECONDS)}
            </span>
            <Badge variant="outline" className="text-xs">
              {audioStatus === 'PAUSED' ? 'En pausa' : 'Grabando...'}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={togglePauseAudio}
            >
              {audioStatus === 'PAUSED' ? (
                <Play data-icon="inline-start" />
              ) : (
                <Pause data-icon="inline-start" />
              )}
              <span>{audioStatus === 'PAUSED' ? 'Reanudar' : 'Pausar'}</span>
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={stopAudioRecording}
            >
              <Square data-icon="inline-start" />
              <span>Guardar audio</span>
            </Button>
          </div>
        </div>
      )}

      {/* Visor de grabación de video */}
      {(cameraMode === 'VIDEO_PREVIEW' || cameraMode === 'RECORDING_VIDEO') && (
        <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-card p-2.5">
          <div className="relative overflow-hidden rounded-lg bg-muted">
            <video
              ref={videoPreviewRef}
              muted
              playsInline
              className="w-full max-h-56 object-cover"
            />
            <div className="absolute top-2 left-2 flex items-center gap-1.5">
              <Badge
                variant={cameraMode === 'RECORDING_VIDEO' ? 'destructive' : 'secondary'}
                className="gap-1.5 font-mono tabular-nums text-xs"
              >
                {cameraMode === 'RECORDING_VIDEO' && (
                  <span className="size-2 rounded-full bg-background animate-pulse" />
                )}
                {formatDuration(recordingSeconds)} / {formatDuration(MEDIA_LIMITS.MAX_VIDEO_SECONDS)}
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              {cameraMode === 'VIDEO_PREVIEW' && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleFlipCamera}
                >
                  <RefreshCw data-icon="inline-start" />
                  <span>Rotar cámara</span>
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={stopActiveMedia}
              >
                Cancelar
              </Button>
            </div>

            {cameraMode === 'VIDEO_PREVIEW' ? (
              <Button
                type="button"
                size="sm"
                onClick={startVideoRecording}
              >
                <Video data-icon="inline-start" />
                <span>Iniciar grabación</span>
              </Button>
            ) : (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={stopVideoRecording}
              >
                <Square data-icon="inline-start" />
                <span>Detener y guardar</span>
              </Button>
            )}
          </div>
        </div>
      )}

      {mediaError && (
        <Alert variant="destructive">
          <AlertTitle className="text-xs font-semibold">Aviso de multimedia</AlertTitle>
          <AlertDescription className="text-xs">{mediaError}</AlertDescription>
        </Alert>
      )}

      {/* Galería de evidencias adjuntas */}
      {adjuntos.length > 0 && (
        <>
          <Separator />
          <div className="flex flex-col gap-2">
            {images.length > 0 && (
              <div className={compact ? 'grid grid-cols-2 sm:grid-cols-3 gap-2' : 'grid grid-cols-2 sm:grid-cols-4 gap-2'}>
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="group relative overflow-hidden rounded-lg border border-border bg-muted/40 aspect-square"
                  >
                    <img
                      src={img.url}
                      alt={img.nombreOriginal}
                      className="size-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                      onClick={() => setLightboxItem(img)}
                    />
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-background/85 px-1.5 py-1 backdrop-blur-xs">
                      <span className="text-xs font-mono text-muted-foreground truncate">
                        {formatBytes(img.tamanoBytes)}
                      </span>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setLightboxItem(img)}
                          title="Ver imagen completa"
                          aria-label="Ver imagen completa"
                        >
                          <Maximize2 className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleRemoveAdjunto(img)}
                          disabled={deleteMutation.isPending}
                          title="Eliminar imagen"
                          aria-label="Eliminar imagen"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {audios.map((aud) => (
              <div
                key={aud.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card p-2"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Mic className="size-4" />
                  </div>
                  <audio controls src={aud.url} className="h-8 w-full max-w-xs" preload="metadata" />
                  <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                    {aud.duracionSegundos !== null && (
                      <Badge variant="outline" className="text-xs font-mono tabular-nums">
                        {formatDuration(aud.duracionSegundos)}
                      </Badge>
                    )}
                    <span className="text-xs font-mono tabular-nums text-muted-foreground">
                      {formatBytes(aud.tamanoBytes)}
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:text-destructive shrink-0"
                  onClick={() => handleRemoveAdjunto(aud)}
                  disabled={deleteMutation.isPending}
                  title="Eliminar audio"
                  aria-label="Eliminar audio"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}

            {videos.map((vid) => (
              <div
                key={vid.id}
                className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-2"
              >
                <video
                  controls
                  playsInline
                  preload="metadata"
                  src={vid.url}
                  className="w-full max-h-48 rounded-md bg-muted object-contain"
                />
                <div className="flex items-center justify-between gap-2 px-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Film className="size-3.5 text-primary shrink-0" />
                    <span className="text-xs font-medium text-foreground truncate max-w-44 tracking-tight">
                      {vid.nombreOriginal}
                    </span>
                    {vid.duracionSegundos !== null && (
                      <Badge variant="secondary" className="text-xs font-mono tabular-nums">
                        {formatDuration(vid.duracionSegundos)}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs font-mono tabular-nums">
                      {formatBytes(vid.tamanoBytes)}
                    </Badge>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:text-destructive shrink-0"
                    onClick={() => handleRemoveAdjunto(vid)}
                    disabled={deleteMutation.isPending}
                    title="Eliminar video"
                    aria-label="Eliminar video"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Lightbox Dialog para ampliar fotografía */}
      <Dialog open={Boolean(lightboxItem)} onOpenChange={(open) => !open && setLightboxItem(null)}>
        <DialogContent className="sm:max-w-2xl p-4">
          <DialogHeader>
            <DialogTitle className="text-xs font-semibold truncate">
              {lightboxItem?.nombreOriginal}
            </DialogTitle>
            <DialogDescription className="text-xs font-mono">
              {lightboxItem ? formatBytes(lightboxItem.tamanoBytes) : ''}
            </DialogDescription>
          </DialogHeader>
          {lightboxItem && (
            <div className="flex items-center justify-center overflow-hidden rounded-lg bg-muted/40">
              <img
                src={lightboxItem.url}
                alt={lightboxItem.nombreOriginal}
                className="max-h-[75vh] w-auto object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
