"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, Upload, Music, AlertCircle } from "lucide-react"
import { generateMusicFromImage } from "@/app/actions"
import AudioPlayer from "@/components/audio-player"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ImageToMusic() {
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [description, setDescription] = useState<string>("")
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [step, setStep] = useState<"upload" | "describing" | "generating" | "playing">("upload")
  const [error, setError] = useState<string | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImage(file)
      setImagePreview(URL.createObjectURL(file))
      setStep("upload")
      setAudioUrl(null)
      setDescription("")
      setError(null)
    }
  }

  const handleGenerate = async () => {
    if (!image) return

    setIsGenerating(true)
    setError(null)
    setStep("describing")

    try {
      const formData = new FormData()
      formData.append("image", image)

      const result = await generateMusicFromImage(formData)

      setDescription(result.description ?? "")
      setStep("generating")

      setAudioUrl(result.audioUrl ?? null)

      if (result.audioUrl) {
        setStep("playing")
      } else {
        setError("Failed to retrieve audio URL after description.")
        setStep("upload")
      }
    } catch (err) {
      console.error("Error generating music:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      setStep("upload")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Synesthesia.ai</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="p-6 mb-8">
        <div className="flex flex-col items-center gap-6">
          <div className="w-full">
            <label
              htmlFor="image-upload"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-900 border-gray-300 dark:border-gray-700"
            >
              {imagePreview ? (
                <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="h-full object-contain" />
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG or WEBP (MAX. 10MB)</p>
                </div>
              )}
              <Input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>

          <Button onClick={handleGenerate} disabled={!image || isGenerating} className="w-full md:w-auto">
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {step === "describing" ? "Analyzing Image..." : "Generating Music..."}
              </>
            ) : (
              <>
                <Music className="mr-2 h-4 w-4" />
                Generate Music
              </>
            )}
          </Button>
        </div>
      </Card>

      {description && !error && (
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-2">Image Description</h2>
          <p className="text-gray-700 dark:text-gray-300">{description}</p>
        </Card>
      )}

      {audioUrl && !error && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Generated Music</h2>
          <AudioPlayer audioUrl={audioUrl} />
        </Card>
      )}
    </div>
  )
}

