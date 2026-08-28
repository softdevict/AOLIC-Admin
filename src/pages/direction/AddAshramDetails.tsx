import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { createGeofencingDistance } from '../../api/config';
import { Link } from 'react-router-dom';

const AddAshramDetails = () => {
  const { register, handleSubmit, reset } = useForm();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      const res = await axios.post(createGeofencingDistance, {
        name: data.name,
        lat: data.lat || undefined,
        long: data.long || undefined,
        distance: data.distance,
      });

      console.log(res.data);
      alert(res.data.message);
      reset();
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Breadcrumb */}
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
            Add Ashram Geofencing
          </button>
        </li>
      </ol>

      {/* Form */}
      <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
        <h2 className="text-2xl font-semibold mb-4 text-center">Add Ashram Geofencing</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Location Name:</label>
            <input
              type="text"
              placeholder="Name"
              {...register('name')}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          {/* Latitude */}
          <div>
            <label className="block text-sm font-medium mb-1">Latitude (optional):</label>
            <input
              type="text"
              placeholder="Latitude"
              {...register('lat')}
              className="w-full p-2 border rounded-md"
            />
          </div>

          {/* Longitude */}
          <div>
            <label className="block text-sm font-medium mb-1">Longitude (optional):</label>
            <input
              type="text"
              placeholder="Longitude"
              {...register('long')}
              className="w-full p-2 border rounded-md"
            />
          </div>

          {/* Distance */}
          <div>
            <label className="block text-sm font-medium mb-1">Distance (in meters):</label>
            <input
              type="text"
              placeholder="Distance"
              {...register('distance')}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2 px-4 font-semibold rounded ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </>
  );
};

export default AddAshramDetails;
