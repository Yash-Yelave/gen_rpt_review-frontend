// src/services/images.service.ts
// Handles image replacement for the report image gallery.
// Sends a multipart/form-data POST to the backend which uploads
// the new file to the same R2 key, ensuring the PDF pipeline
// automatically uses the updated image on its next build.

import { useAuthStore } from '@/store/authStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const imagesService = {
  /**
   * Replace a specific image in a report's R2 assets folder.
   * @param reportId - The report document ID / slug
   * @param imageKey - The image filename, e.g. "image-1.png"
   * @param file     - The new image file selected by the user
   * @returns The new presigned URL for the replaced image
   */
  async replaceImage(reportId: string, imageKey: string, file: File): Promise<{ key: string; url: string }> {
    const form = new FormData();
    form.append('image_key', imageKey);
    form.append('file', file);

    const token = useAuthStore.getState().token;
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = token;
    }
    // NOTE: Do NOT set Content-Type manually — the browser sets it automatically
    // with the correct multipart boundary when using FormData.

    const res = await fetch(`${BASE_URL}/reports/${reportId}/replace-image`, {
      method: 'POST',
      headers,
      body: form,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(err.detail ?? `Image upload failed (${res.status})`);
    }

    const body = await res.json();
    return body.data as { key: string; url: string };
  },

  /**
   * Regenerate a specific image in a report's R2 assets folder using AI.
   *
   * @param reportId The ID of the report
   * @param imageKey The key of the image to replace (e.g., 'image-0.png')
   * @param prompt The briefing for the AI to generate the new image
   * @returns The new presigned URL for the replaced image
   */
  async regenerateImage(reportId: string, imageKey: string, prompt: string): Promise<{ key: string; url: string }> {
    const res = await fetch(`${BASE_URL}/reports/${reportId}/regenerate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_key: imageKey,
        prompt: prompt,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to regenerate image');
    }

    return data.data;
  },
};
