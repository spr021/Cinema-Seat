"use client"

import { useEffect, useRef, useState } from "react"
import {
  CheckCircleIcon,
  XCircleIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline"

type ScanResult = {
  ok: boolean
  message: string
  ticketId?: string
}

/**
 * Ticket check-in desk: scan the customer's QR (camera where the browser
 * supports BarcodeDetector, otherwise paste the booking code) and call
 * POST /ticket/validate/:id, which burns the ticket on first use.
 */
export default function Checkin() {
  const [manualCode, setManualCode] = useState("")
  const [result, setResult] = useState<ScanResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [cameraState, setCameraState] = useState<
    "idle" | "starting" | "scanning" | "unsupported" | "error"
  >("idle")
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanLoopRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  const stopCamera = () => {
    if (scanLoopRef.current) window.clearInterval(scanLoopRef.current)
    scanLoopRef.current = null
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setCameraState((state) => (state === "scanning" ? "idle" : state))
  }

  const extractTicketId = (raw: string): string => {
    // Accept a bare id or a full URL/QR payload ending with the id
    const trimmed = raw.trim()
    const lastSegment = trimmed.split("/").filter(Boolean).pop() ?? trimmed
    return lastSegment
  }

  const validateTicket = async (rawCode: string) => {
    const ticketId = extractTicketId(rawCode)
    if (!ticketId) {
      setResult({ ok: false, message: "No ticket code provided." })
      return
    }

    setIsValidating(true)
    setResult(null)
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token")
      if (!token) {
        setResult({ ok: false, message: "No authentication token found." })
        return
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/ticket/validate/${ticketId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      const data = await response.json().catch(() => ({}))

      if (response.ok) {
        setResult({ ok: true, message: "Ticket valid — enjoy the show!", ticketId })
      } else {
        setResult({
          ok: false,
          message: data.message || `Validation failed (${response.status})`,
          ticketId,
        })
      }
    } catch {
      setResult({ ok: false, message: "Network error while validating." })
    } finally {
      setIsValidating(false)
    }
  }

  const startCamera = async () => {
    const detectorAvailable =
      typeof window !== "undefined" && "BarcodeDetector" in window
    if (!detectorAvailable) {
      setCameraState("unsupported")
      return
    }

    setCameraState("starting")
    setResult(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      // @ts-expect-error BarcodeDetector is not in the TS DOM lib yet
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] })
      setCameraState("scanning")

      scanLoopRef.current = window.setInterval(async () => {
        if (!videoRef.current) return
        try {
          const codes = await detector.detect(videoRef.current)
          if (codes.length > 0 && codes[0].rawValue) {
            stopCamera()
            await validateTicket(codes[0].rawValue)
          }
        } catch {
          // transient detection errors are ignored; next tick retries
        }
      }, 400)
    } catch (error) {
      console.error("Camera start failed:", error)
      setCameraState("error")
    }
  }

  return (
    <div className="max-w-xl">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">
            Ticket check-in
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Scan the customer&apos;s QR code or type the booking code. A ticket
            can only be used once — the second scan is rejected.
          </p>
        </div>
      </div>

      {/* Result banner */}
      {result && (
        <div
          className={`mt-6 flex items-center gap-3 rounded-lg p-4 ${
            result.ok
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {result.ok ? (
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          ) : (
            <XCircleIcon className="h-8 w-8 text-red-600" />
          )}
          <div>
            <p className="font-semibold">{result.message}</p>
            {result.ticketId && (
              <p className="text-xs opacity-75">Ticket {result.ticketId}</p>
            )}
          </div>
        </div>
      )}

      {/* Camera scanner */}
      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">Camera scan</p>
            {cameraState === "scanning" ? (
              <button
                type="button"
                onClick={stopCamera}
                className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-700"
              >
                Stop camera
              </button>
            ) : (
              <button
                type="button"
                onClick={startCamera}
                className="flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                <VideoCameraIcon className="h-4 w-4" />
                Start camera
              </button>
            )}
          </div>

          <div className="mt-3 flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-gray-900">
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              muted
              playsInline
            />
            {cameraState !== "scanning" && (
              <p className="absolute p-8 text-center text-sm text-gray-300">
                {cameraState === "unsupported"
                  ? "This browser doesn't support QR detection — use the manual code below (works in any browser)."
                  : cameraState === "error"
                    ? "Could not access the camera. Check permissions or use the manual code."
                    : cameraState === "starting"
                      ? "Starting camera…"
                      : "Camera preview appears here while scanning."}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Manual code input */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
        <label
          htmlFor="ticketCode"
          className="block text-sm font-medium text-gray-900"
        >
          Manual booking code
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id="ticketCode"
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && manualCode.trim()) {
                validateTicket(manualCode)
                setManualCode("")
              }
            }}
            placeholder="e.g. 6651f… or pasted QR content"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
          />
          <button
            type="button"
            disabled={isValidating || !manualCode.trim()}
            onClick={() => {
              validateTicket(manualCode)
              setManualCode("")
            }}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
          >
            {isValidating ? "Checking…" : "Validate"}
          </button>
        </div>
      </div>
    </div>
  )
}
