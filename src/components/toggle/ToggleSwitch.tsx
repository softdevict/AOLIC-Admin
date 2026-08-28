import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface ToggleSwitchProps {
  apiUrl: string;
  fetchUrl: string;
  onToggle?: (isChecked: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ apiUrl, fetchUrl, onToggle }) => {
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchInitialValue = async () => {
      try {
        const res = await axios.get(fetchUrl);
        setIsChecked(res.data?.toggle ?? false);
      } catch (error) {
        console.error('Failed to fetch toggle status:', error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchInitialValue();
  }, [fetchUrl]);

  const handleToggle = async () => {
    const newValue = !isChecked;
    setIsChecked(newValue);
    onToggle?.(newValue);

    setIsLoading(true);
    try {
      await axios.patch(apiUrl, { value: newValue });
    } catch (error) {
      console.error('API toggle failed', error);
      setIsChecked(!newValue);
      onToggle?.(!newValue);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loader until we know the value
  if (isFetching) {
    return <p className='h-[2.4rem] flex items-center'>Loading toggle...</p>; // can replace with a spinner
  }

  return (
    <div className="flex items-center gap-2">
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={isChecked}
          onChange={handleToggle}
          disabled={isLoading}
        />
        <div
          className={`w-14 h-8 
          ${isChecked ? 'bg-green-500' : 'bg-gray-300'} 
          peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 
          rounded-full peer transition-all duration-300 shadow-inner`}
        >
          <div
            className={`absolute top-0.5 left-0.5 
              w-7 h-7 bg-white rounded-full shadow-md 
              transform transition-all duration-300
              ${isChecked ? 'translate-x-6' : 'translate-x-0'}`}
          >
            <svg
              className={`absolute inset-0 m-auto h-3 w-3 transition-opacity duration-300 ${isChecked ? 'opacity-100' : 'opacity-0'}`}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M20.285 6.708l-11.482 11.482-5.285-5.285 1.414-1.414 3.871 3.871 10.068-10.068z" />
            </svg>
            <svg
              className={`absolute inset-0 m-auto h-3 w-3 text-red-600 transition-opacity duration-300 ${!isChecked ? 'opacity-100' : 'opacity-0'}`}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M18.364 5.636l-1.414-1.414L12 9.172 7.05 4.222 5.636 5.636 10.586 10.586 5.636 15.536l1.414 1.414L12 12.828l4.95 4.95 1.414-1.414-4.95-4.95z" />
            </svg>
          </div>
        </div>
      </label>
    </div>
  );
};

export default ToggleSwitch;
