import { useState } from 'react';
import api from '../lib/api';

interface UploadState {
  uploading: boolean;
  error: string | null;
}

export function useImageUpload() {
  const [state, setState] = useState<UploadState>({ uploading: false, error: null });

  const upload = async (file: File): Promise<string | null> => {
    const MAX_SIZE = 5 * 1024 * 1024;
    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

    if (!ALLOWED.includes(file.type)) {
      setState({ uploading: false, error: 'Solo se permiten imágenes JPG, PNG o WebP.' });
      return null;
    }
    if (file.size > MAX_SIZE) {
      setState({ uploading: false, error: 'La imagen no puede superar 5 MB.' });
      return null;
    }

    setState({ uploading: true, error: null });
    try {
      const form = new FormData();
      form.append('image', file);
      const { data } = await api.post<{ data: { url: string } }>('/upload/image', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setState({ uploading: false, error: null });
      return data.data.url;
    } catch {
      setState({ uploading: false, error: 'Error al subir la imagen. Intenta de nuevo.' });
      return null;
    }
  };

  const clearError = () => setState((s) => ({ ...s, error: null }));

  return { upload, uploading: state.uploading, error: state.error, clearError };
}
