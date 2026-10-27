
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  Camera,
  CheckCircle2,
  Flame,
  HeartPulse,
  MapPin,
  Navigation,
  RotateCcw,
  ShieldAlert,
  Square,
  Video,
  X,
} from "lucide-react";

type IncidentType =
  | "Road accident"
  | "Fire outbreak"
  | "Medical emergency"
  | "Other";

const API_URL = "http://localhost:4000/api/reports";

const incidentOptions: {
  label: IncidentType;
  description: string;
  icon: typeof ShieldAlert;
}[] = [
  {
    label: "Road accident",
    description: "Vehicle collisions and road crashes",
    icon: ShieldAlert,
  },
  {
    label: "Fire outbreak",
    description: "Buildings, vehicles, or other fires",
    icon: Flame,
  },
  {
    label: "Medical emergency",
    description: "Urgent illness or injury",
    icon: HeartPulse,
  },
  {
    label: "Other",
    description: "Another type of emergency",
    icon: MapPin,
  },
];

export default function IncidentReport() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [incidentType, setIncidentType] =
    useState<IncidentType | "">("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [locationMessage, setLocationMessage] = useState("");
  const [cameraMessage, setCameraMessage] = useState("");
  const [recording, setRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<Blob | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (
        recorderRef.current &&
        recorderRef.current.state !== "inactive"
      ) {
        recorderRef.current.onstop = null;
        recorderRef.current.stop();
      }

      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const getLocation = () => {
    setError("");
    setLocationMessage("Getting your location...");

    if (!navigator.geolocation) {
      setLocationMessage(
        "Geolocation is not supported by this browser."
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationMessage("Location retrieved successfully.");
      },
      (geoError) => {
        const message =
          geoError.code === geoError.PERMISSION_DENIED
            ? "Location permission was denied. Allow location access in your browser and try again."
            : geoError.code === geoError.TIMEOUT
              ? "Location request timed out. Please try again."
              : "Unable to retrieve location. Check your device settings and try again.";

        setLocationMessage(message);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const startCamera = async () => {
    setError("");
    setCameraMessage("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraMessage(
        "Camera access is unavailable. Use HTTPS or localhost and a supported browser."
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraActive(true);
      setCameraMessage("Camera ready.");
    } catch {
      setCameraMessage(
        "Unable to access the camera or microphone. Check browser permissions."
      );
    }
  };

  const stopCamera = () => {
    if (
      recorderRef.current &&
      recorderRef.current.state !== "inactive"
    ) {
      recorderRef.current.stop();
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraActive(false);
    setRecording(false);
    setCameraMessage("Camera stopped.");
  };

  const startRecording = () => {
    const stream = streamRef.current;

    if (!stream) {
      setCameraMessage("Start the camera before recording.");
      return;
    }

    if (typeof MediaRecorder === "undefined") {
      setCameraMessage(
        "Video recording is not supported by this browser."
      );
      return;
    }

    try {
      const mimeType = [
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm",
      ].find((type) => MediaRecorder.isTypeSupported(type));

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      chunksRef.current = [];
      setRecordedVideo(null);

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, {
            type: recorder.mimeType || "video/webm",
          });

          setRecordedVideo(blob);
          setCameraMessage("Video recorded on this device.");
        }

        setRecording(false);
      };

      recorder.onerror = () => {
        setRecording(false);
        setCameraMessage("Recording failed. Please try again.");
      };

      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
      setCameraMessage("Recording in progress...");
    } catch {
      setCameraMessage("Could not start recording.");
    }
  };

  const stopRecording = () => {
    if (
      recorderRef.current &&
      recorderRef.current.state !== "inactive"
    ) {
      recorderRef.current.stop();
    }
  };

  const resetForm = () => {
    setIncidentType("");
    setDescription("");
    setLocation(null);
    setLocationMessage("");
    setCameraMessage("");
    setRecordedVideo(null);
    setSuccess(false);
    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess(false);

    if (!incidentType) {
      setError("Please select an incident type.");
      return;
    }

    if (!description.trim()) {
      setError("Please describe the incident.");
      return;
    }

    if (recording) {
      setError("Stop the video recording before submitting.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          incidentType,
          description: description.trim(),
          latitude: location?.latitude ?? null,
          longitude: location?.longitude ?? null,
          submittedAt: new Date().toISOString(),
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.error ||
            result?.message ||
            `Report submission failed (${response.status}).`
        );
      }

      setSuccess(true);
      setIncidentType("");
      setDescription("");
      setLocation(null);
      setLocationMessage("");
      setError("");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? `${submitError.message} Make sure the RescueCare backend is running on port 4000.`
          : "Could not submit the report. Check your backend connection."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
          <ShieldAlert size={16} />
          Emergency incident reporting
        </span>

        <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Report an Incident
        </h2>

        <p className="mx-auto mt-3 max-w-2xl text-slate-600">
          Share incident details and your location so the response team
          can review the report.
        </p>
      </div>

      {success && (
        <div
          role="status"
          className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800"
        >
          <CheckCircle2 className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Report submitted successfully</p>
            <p className="mt-1 text-sm">
              Your report has been sent to the RescueCare API for review.
            </p>
          </div>
          <button
            type="button"
            aria-label="Dismiss success message"
            className="ml-auto"
            onClick={() => setSuccess(false)}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800"
        >
          <ShieldAlert className="mt-0.5 shrink-0" />
          <p className="text-sm">{error}</p>
          <button
            type="button"
            aria-label="Dismiss error message"
            className="ml-auto"
            onClick={() => setError("")}
          >
            <X size={18} />
          </button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
      >
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            1. Incident type
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Choose the category that best describes the incident.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {incidentOptions.map((option) => {
              const Icon = option.icon;
              const selected = incidentType === option.label;

              return (
                <button
                  key={option.label}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setIncidentType(option.label)}
                  className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                    selected
                      ? "border-red-500 bg-red-50 ring-2 ring-red-100"
                      : "border-slate-200 hover:border-slate-400"
                  }`}
                >
                  <span
                    className={`rounded-lg p-2 ${
                      selected
                        ? "bg-red-100 text-red-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <Icon size={21} />
                  </span>
                  <span>
                    <span className="block font-semibold text-slate-900">
                      {option.label}
                    </span>
                    <span className="mt-1 block text-sm text-slate-500">
                      {option.description}
                    </span>
                  </span>
                  {selected && (
                    <CheckCircle2
                      size={19}
                      className="ml-auto shrink-0 text-red-600"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label
            htmlFor="incident-description"
            className="block text-lg font-bold text-slate-900"
          >
            2. Describe the incident
          </label>
          <p className="mt-1 text-sm text-slate-500">
            Include the situation and any details that may help responders.
          </p>

          <textarea
            id="incident-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={5}
            maxLength={2000}
            required
            placeholder="Describe what happened, any visible hazards, and relevant details..."
            className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
          />

          <p className="mt-1 text-right text-xs text-slate-500">
            {description.length}/2000 characters
          </p>
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900">
            3. Incident location
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Location is optional, but helps responders identify the incident.
            Your browser may ask for permission.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={getLocation}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Navigation size={18} />
              Get my location
            </button>

            {location && (
              <button
                type="button"
                onClick={() => {
                  setLocation(null);
                  setLocationMessage("Location cleared.");
                }}
                className="inline-flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                <RotateCcw size={16} />
                Clear location
              </button>
            )}
          </div>

          {locationMessage && (
            <p className="mt-3 text-sm text-slate-600" role="status">
              {locationMessage}
            </p>
          )}

          {location && (
            <div className="mt-3 flex items-start gap-3 rounded-xl bg-slate-50 p-4">
              <MapPin className="mt-0.5 shrink-0 text-green-700" size={20} />
              <div className="text-sm text-slate-700">
                <p className="font-semibold">Coordinates captured</p>
                <p>
                  Latitude: {location.latitude.toFixed(6)}
                </p>
                <p>
                  Longitude: {location.longitude.toFixed(6)}
                </p>
                <a
                  className="mt-2 inline-block font-semibold text-blue-700 underline"
                  href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View location on map
                </a>
              </div>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900">
            4. Optional video evidence
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            You can preview your camera or record a short clip on this device.
          </p>

          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-950">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              controls={Boolean(recordedVideo)}
              className="aspect-video max-h-[420px] w-full object-contain"
            />

            {!cameraActive && !recordedVideo && (
              <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center text-slate-300">
                <Camera size={32} />
                <p className="text-sm">Camera preview is not active</p>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {!cameraActive ? (
              <button
                type="button"
                onClick={startCamera}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Camera size={18} />
                Start camera
              </button>
            ) : (
              <button
                type="button"
                onClick={stopCamera}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                <X size={18} />
                Stop camera
              </button>
            )}

            {cameraActive && !recording && (
              <button
                type="button"
                onClick={startRecording}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700"
              >
                <Video size={18} />
                Start recording
              </button>
            )}

            {recording && (
              <button
                type="button"
                onClick={stopRecording}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800"
              >
                <Square size={16} />
                Stop recording
              </button>
            )}

            {recordedVideo && (
              <button
                type="button"
                onClick={() => {
                  setRecordedVideo(null);
                  if (videoRef.current) {
                    videoRef.current.controls = false;
                    videoRef.current.srcObject =
                      streamRef.current;
                  }
                  setCameraMessage("Recorded clip cleared.");
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                <RotateCcw size={18} />
                Clear recording
              </button>
            )}
          </div>

          {cameraMessage && (
            <p className="mt-3 text-sm text-slate-600" role="status">
              {cameraMessage}
            </p>
          )}

          {recordedVideo && (
            <p className="mt-2 text-sm text-amber-700">
              A clip is recorded locally, but this prototype does not upload
              video to the backend. Only the incident details and coordinates
              are submitted.
            </p>
          )}
        </div>

        <div className="border-t border-slate-200 pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-xs leading-5 text-slate-500">
              This student prototype sends reports to a local development
              server. It is not connected to emergency dispatch. For a real
              emergency, contact your local emergency services.
            </p>

            <button
              type="submit"
              disabled={submitting || recording}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-bold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Submitting...
                </>
              ) : (
                <>
                  <ShieldAlert size={18} />
                  Submit incident report
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
