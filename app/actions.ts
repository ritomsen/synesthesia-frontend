"use server"

import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

// Define the base URL for your backend API
// It's best practice to use an environment variable for this
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function generateMusicFromImage(formData: FormData) {
  // Get the image file from the form data
  const imageFile = formData.get("image") as File

  if (!imageFile) {
    throw new Error("No image provided")
  }

  let description = "";
  let audioUrl: string | null = null;

  try {
    // Step 1: Call the backend to describe the image
    console.log("Sending image to backend for description...");
    const describeResponse = await fetch(`${BACKEND_URL}/describe-image-musically`, {
      method: 'POST',
      body: formData, // Send the whole FormData, FastAPI handles the file
      // No 'Content-Type' header needed; fetch sets it correctly for FormData
    });

    if (!describeResponse.ok) {
      const errorData = await describeResponse.json().catch(() => ({ detail: 'Failed to parse error response' }));
      console.error("Backend error (describe):", errorData);
      throw new Error(`Failed to describe image: ${errorData.detail || describeResponse.statusText}`);
    }

    const describeResult = await describeResponse.json();
    description = describeResult.description;
    console.log("Received description:", description);

    if (!description) {
        throw new Error("Backend returned an empty description.");
    }

    // Step 2: Call the backend to generate audio using the description
    console.log("Sending description to backend for audio generation...");
    const audioFormData = new FormData();
    audioFormData.append('prompt', description);

    const audioResponse = await fetch(`${BACKEND_URL}/generate-audio`, {
      method: 'POST',
      body: audioFormData,
    });

    if (!audioResponse.ok) {
      const errorData = await audioResponse.json().catch(() => ({ detail: 'Failed to parse error response' }));
      console.error("Backend error (generate):", errorData);
      throw new Error(`Failed to generate audio: ${errorData.detail || audioResponse.statusText}`);
    }

    const audioResult = await audioResponse.json();
    audioUrl = audioResult.audio_url;
    console.log("Received audio URL:", audioUrl);

    if (!audioUrl) {
        throw new Error("Backend returned an empty audio URL.");
    }

    return {
      description,
      audioUrl,
    }

  } catch (error) {
    console.error("Error in generateMusicFromImage:", error);
    // Re-throw the error so the component can catch it
    throw error instanceof Error ? error : new Error(String(error));
  }
}

