'use client';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { useObjectUrl } from '@/hooks/useObjectUrl';
import { getErrorMessage } from '@/lib/http/errors';
import { studentService } from '@/services/student.service';
import { useRef, useState, type ChangeEvent } from 'react';
import { MAX_PHOTO_MB, PHOTO_INPUT_ACCEPT, validatePhotoFile } from '../photoValidation';

interface PhotoUploaderProps {
  studentId: string;
  studentName: string;
  /** The saved photo, or null */
  photoUrl: string | null;
  /** Called with the new URL after an upload, or null after a removal */
  onPhotoChange: (photoUrl: string | null) => void;
}

type Busy = 'idle' | 'uploading' | 'removing';

export function PhotoUploader({ studentId, studentName, photoUrl, onPhotoChange }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null); // chosen but not uploaded yet
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState<Busy>('idle');

  const previewUrl = useObjectUrl(file);
  const isBusy = busy !== 'idle';

  function handleSelect(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;

    // Clear the input, otherwise choosing the same file twice in a row fires no change event
    event.target.value = '';

    setMessage(null);
    if (!selected) return;

    const problem = validatePhotoFile(selected);
    if (problem) {
      setFile(null);
      setError(problem);
      return;
    }

    setError(null);
    setFile(selected);
  }

  function handleCancel() {
    setFile(null);
    setError(null);
  }

  async function handleUpload() {
    if (!file) return;

    setBusy('uploading');
    setError(null);
    setMessage(null);

    try {
      const newUrl = await studentService.uploadPhoto(studentId, file);
      onPhotoChange(newUrl);
      setFile(null);
      setMessage('Photo saved.');
    } catch (err) {
      setError(getErrorMessage(err)); // includes the server's own message, for example "not a valid image"
    } finally {
      setBusy('idle');
    }
  }

  async function handleRemove() {
    if (!window.confirm(`Remove the photo of ${studentName}?`)) return;

    setBusy('removing');
    setError(null);
    setMessage(null);

    try {
      await studentService.removePhoto(studentId);
      onPhotoChange(null);
      setMessage('Photo removed.');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy('idle');
    }
  }

  return (
    <div className="flex max-w-xl items-start gap-5">
      <Avatar
        name={studentName}
        src={previewUrl ?? photoUrl}
        size={96}
        alt={previewUrl ? 'Preview of the chosen photo' : `Photo of ${studentName}`}
      />

      <div className="grid gap-2">
        <h2 className="text-lg font-semibold">Photo</h2>

        <input
          ref={inputRef}
          type="file"
          accept={PHOTO_INPUT_ACCEPT}
          onChange={handleSelect}
          aria-label="Choose a photo"
          hidden
        />

        <div className="flex flex-wrap gap-2">
          {file ? (
            <>
              <Button type="button" onClick={handleUpload} disabled={isBusy}>
                {busy === 'uploading' ? 'Uploading...' : 'Upload photo'}
              </Button>
              <Button type="button" onClick={handleCancel} disabled={isBusy}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button type="button" onClick={() => inputRef.current?.click()} disabled={isBusy}>
                {photoUrl ? 'Change photo' : 'Choose photo'}
              </Button>
              {photoUrl && (
                <Button type="button" onClick={handleRemove} disabled={isBusy}>
                  {busy === 'removing' ? 'Removing...' : 'Remove photo'}
                </Button>
              )}
            </>
          )}
        </div>

        {file && <p className="text-xs text-amber-700">Not saved yet. Press &quot;Upload photo&quot; to keep it.</p>}

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="text-sm text-green-700">
            {message}
          </p>
        )}

        <p className="text-xs text-gray-500">
          JPEG, PNG or WebP, up to {MAX_PHOTO_MB} MB. It is cropped to a square. The photo is saved on its own,
          separately from the details below.
        </p>
      </div>
    </div>
  );
}
