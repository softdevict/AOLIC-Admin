import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { display_default_audioTour, add_default_audioTour, update_default_audioTour } from '../../api/config';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/button/Button';

interface AudioTourData {
  audioDirectionImg: File | null;
  audioLink: File | null;
  audioDirectionText: string;
  videoLink: string;
}

const defaultValues: AudioTourData = {
  audioDirectionImg: null,
  audioLink: null,
  audioDirectionText: '',
  videoLink: '',
};

function AddAndModDefaultTour() {
  const [formData, setFormData] = useState<AudioTourData>(defaultValues);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImg, setPreviewImg] = useState('');
  const [previewAudio, setPreviewAudio] = useState('');
  const [existingImgUrl, setExistingImgUrl] = useState('');
  const [existingAudioUrl, setExistingAudioUrl] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        const res = await fetch(display_default_audioTour);
        const data = await res.json();

        if (data?.audioDirectionText || data?.audioDirectionImg || data?.audioLink) {
          setFormData({
            audioDirectionImg: null,
            audioLink: null,
            audioDirectionText: data.audioDirectionText || '',
            videoLink: data.videoLink || ''
          });
          setExistingImgUrl(data.audioDirectionImg || '');
          setExistingAudioUrl(data.audioLink || '');
          setPreviewImg(data.audioDirectionImg || '');
          setPreviewAudio(data.audioLink || '');
          setIsUpdateMode(true);
        }
      } catch (error) {
        console.error('Failed to fetch default tour:', error);
      }
    };

    fetchExistingData();
  }, []);

  const handleTextChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    const file = files?.[0];

    if (!file) return;

    if (name === 'audioDirectionImg') {
      setFormData({ ...formData, audioDirectionImg: file });
      setPreviewImg(URL.createObjectURL(file));
      setExistingImgUrl('');
    }

    if (name === 'audioLink') {
      setFormData({ ...formData, audioLink: file });
      const audioUrl = URL.createObjectURL(file);
      setPreviewAudio(audioUrl);
      setExistingAudioUrl('');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = new FormData();
    form.append('audioDirectionText', formData.audioDirectionText);
    form.append('videoLink', formData.videoLink);
    if (formData.audioDirectionImg) form.append('audioDirectionImg', formData.audioDirectionImg);
    if (formData.audioLink) form.append('audioLink', formData.audioLink);

    try {
      const response = await fetch(isUpdateMode ? update_default_audioTour : add_default_audioTour, {
        method: isUpdateMode ? 'PATCH' : 'POST',
        body: form,
      });

      if (!response.ok) throw new Error('Request failed');
      navigate('/direction');
    } catch (error) {
      console.error('Error uploading data:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previewImg) URL.revokeObjectURL(previewImg);
      if (previewAudio) URL.revokeObjectURL(previewAudio);
    };
  }, [previewImg, previewAudio]);
  const adminType = localStorage.getItem("adminType");
  return (
    <>
      {adminType === "super admin" && (
        <ol className="flex text-gray-500 font-semibold dark:text-white-dark space-x-2">
          <Link to="/">
            <button className="hover:text-gray-500/70 dark:hover:text-white-dark/70">Home</button>
          </Link>
          <li>/</li>
          <Link to="/direction">
            <button className="hover:text-gray-500/70 dark:hover:text-white-dark/70">Map and Tour</button>
          </Link>
          <li>/</li>
          <li>
            <button className="text-black dark:text-white-light hover:text-black/70 dark:hover:text-white-light/70">
              {isUpdateMode ? 'Update Audio Tour' : 'Add Audio Tour'}
            </button>
          </li>
        </ol>
      )}

      <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          {isUpdateMode ? 'Update Audio Tour' : 'Add Audio Tour'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Textarea */}
          <div>
            <label className="block text-sm font-medium mb-1">Instrumental Audio Text:</label>
            <textarea
              name="audioDirectionText"
              value={formData.audioDirectionText}
              onChange={handleTextChange}
              className="w-full h-20 p-2 border rounded-md resize-none"
              placeholder="Enter direction text"
              required
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-1">Upload Image:</label>
            <input
              type="file"
              name="audioDirectionImg"
              accept="image/*"
              onChange={handleFileChange}
              className="block"
              required={!isUpdateMode && !existingImgUrl}
            />
            {(previewImg || existingImgUrl) && (
              <div className="mt-2">
                <p className="text-sm font-medium mb-1">Image Preview:</p>
                <img
                  src={previewImg || existingImgUrl}
                  alt="Preview"
                  className="w-40 h-40 object-cover rounded-md"
                />
              </div>
            )}
          </div>

          {/* Audio Upload */}
          <div>
            <label className="block text-sm font-medium mb-1">Upload Audio:</label>
            <input
              type="file"
              name="audioLink"
              accept="audio/*"
              onChange={handleFileChange}
              className="block"
              required={!isUpdateMode && !existingAudioUrl}
            />

            {(previewAudio || existingAudioUrl) && (
              <div className="mt-2">
                <p className="text-sm font-medium mb-1">Audio Preview:</p>
                <audio controls className="w-full mt-2">
                  <source src={previewAudio || existingAudioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
          </div>

          {/* Video Link */}
          <div>
            <label className="block text-sm font-medium mb-1">YouTube Video Link:</label>
            <input
              type="url"
              name="videoLink"
              value={formData.videoLink}
              onChange={handleTextChange}
              className="w-full p-2 border rounded-md"
              placeholder="https://youtube.com/..."
              required
            />
          </div>

          {/* Submit */}
          <div>
            <Button text={isUpdateMode ? 'Update' : 'Add'} loading={isSubmitting} />
          </div>
        </form>
      </div>
    </>
  );
}

export default AddAndModDefaultTour;