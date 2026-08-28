
import { useEffect, useState } from 'react';
import { Button, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdvertisementCard from '../../components/cards/AdvertisementCard';
import NavButton from '../../components/button/NavButton';
import { advertisement, display_all_advertisement } from '../../api/config';
import DeleteButton from '../../components/button/DelButton';
import AddIcon from '@mui/icons-material/Add';

// Define the shape of an image object
interface Image {
  link: string;
  img: string;
  title: string;
}

// Define the Advertisement interface with nullable img fields
interface Advertisement {
  _id: string;
  img1: Image | null;
  img2: Image | null;
  img3: Image | null;
}

const AdvertisementDisplay: React.FC = () => {
  const navigate = useNavigate();
  const [ads, setAds] = useState<Advertisement | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch advertisements from the API
  useEffect(() => {
    const fetchAdvertisements = async () => {
      try {
        const response = await axios.get(display_all_advertisement);
        const adData = response.data.data;

        if (Array.isArray(adData) && adData.length > 0) {
          const firstAd = adData[0];
          setAds({
            _id: firstAd._id,
            img1:
              firstAd.img1 &&
                'link' in firstAd.img1 &&
                'img' in firstAd.img1 &&
                'title' in firstAd.img1
                ? firstAd.img1
                : null,
            img2:
              firstAd.img2 &&
                'link' in firstAd.img2 &&
                'img' in firstAd.img2 &&
                'title' in firstAd.img2
                ? firstAd.img2
                : null,
            img3:
              firstAd.img3 &&
                'link' in firstAd.img3 &&
                'img' in firstAd.img3 &&
                'title' in firstAd.img3
                ? firstAd.img3
                : null,
          });
        } else {
          // toast.info('No advertisements available.');
        }
      } catch (error) {
        console.error('Error fetching advertisements:', error);
        toast.error('Failed to load advertisements. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdvertisements();
  }, []);

  // Handle card click to navigate to edit form
  const handleEdit = () => {
    if (!ads || !ads.img1 || !ads.img2 || !ads.img3) {
      toast.error('Cannot edit: Advertisement data is incomplete.');
      return;
    }

    const data = {
      title1: ads.img1.title,
      link1: ads.img1.link,
      img1: ads.img1.img,
      title2: ads.img2.title,
      link2: ads.img2.link,
      img2: ads.img2.img,
      title3: ads.img3.title,
      link3: ads.img3.link,
      img3: ads.img3.img,
    };

    navigate('/advertisement/edit', {
      state: {
        isEdit: true,
        id: ads._id,
        data,
      },
    });
  };

  // Handle advertisement deletion
  const handleDelete = async () => {
    if (!ads?._id) {
      toast.error('No Upcoming Programs selected for deletion.');
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`${advertisement}/${ads._id}`);
      toast.success('Upcoming Programs deleted successfully!');
      setAds(null);
    } catch (error) {
      console.error('Error deleting Upcoming Programs:', error);
      toast.error('Failed to delete Upcoming Programs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Check if any advertisement data exists
  const hasAds = ads && (ads.img1 || ads.img2 || ads.img3);
  const adminType = localStorage.getItem("adminType");
  return (
    <div className="container mx-auto p-4">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      {/* Breadcrumb Navigation */}
      {adminType === "super admin" && (
        <nav className="flex text-gray-500 font-semibold dark:text-white-dark space-x-2 mb-6">
          <Link to="/" className="hover:text-gray-500/70 dark:hover:text-white-dark/70">
            Home
          </Link>
          <span>/</span>
          <span className="text-black dark:text-white-light">Upcoming Programs
          </span>
        </nav>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end mb-6 gap-4">
        {hasAds ? (
          <>
            <Button
              variant="contained"
              sx={{
                background: 'linear-gradient(to right, #ff8c00, #ffa500)', // darkorange to orange
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(to right, #e67300, #ff9900)', // darker on hover
                },
                textTransform: 'none', // optional: keep text as-is
              }}
              onClick={handleEdit}
              aria-label="Edit advertisement"
              disabled={loading}
            >
              Edit
            </Button>
            {/* <Button
              variant="contained"
              sx={{
                backgroundColor: 'red',
                '&:hover': { backgroundColor: 'darkred' },
              }}
              onClick={handleDelete}
              aria-label="Delete advertisement"
              disabled={loading}
            >
              Delete
            </Button> */}

            <DeleteButton
              text="Delete"
              loading={loading}
              onClick={handleDelete}
            />
          </>
        ) : (
          <NavButton to="/advertisement/add">

            <AddIcon />
            Create <span className='ml-1 md:inline hidden'>Upcoming Programs</span>
          </NavButton>
        )}
      </div>

      {/* Advertisement Display */}
      {loading ? (
        <Typography className="text-center">Loading Upcoming Programs...</Typography>
      ) : !hasAds ? (
        <Typography className="text-center p-4">No Upcoming Programs found.</Typography>
      ) : (
        <div className="flex gap-4 flex-wrap justify-around pb-12">
          {(['img1', 'img2', 'img3'] as const).map((key, idx) => {
            const ad = ads[key];
            if (!ad) {
              return (
                <Typography
                  key={`slot-${idx}`}
                  className="text-center p-4 border rounded bg-gray-50"
                >
                  No Upcoming Programsx data for slot {idx + 1}
                </Typography>
              );
            }
            return (
              <AdvertisementCard
                key={`${ads._id}-${idx}`}
                id={ads._id}
                link={ad.link}
                img={ad.img}
                name={ad.title}
                index={idx + 1}
                onClick={handleEdit}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdvertisementDisplay;