

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { editScheduleNotefication, future_notification, stopScheduleNotefication } from '../../api/config';
import { Link } from 'react-router-dom';
import IconPencilPaper from '../../components/Icon/IconPencilPaper';
import IconTrash from '../../components/Icon/IconTrash';
import { toast } from 'react-toastify';

interface DeviceToken {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface Notification {
  _id: string;
  title: string;
  body: string;
  NotificationTime: string;
  sent: boolean;
  deviceTokens: DeviceToken[];
  groupName?: string;
}

const ScheduleNotification: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<Notification | null>(null);

  const fetchNotifications = () => {
    axios
      .get(future_notification)
      .then((response) => {
        if (response.data.success) {
          setNotifications(response.data.data);
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error('Failed to fetch notifications');
      });
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleOpenEditModal = (notification: Notification) => {
    setEditData(notification);
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!editData) return;

    try {
      const { _id, title, body, NotificationTime } = editData;
      const formattedTime = new Date(NotificationTime).toISOString(); // Ensures UTC time is passed
      await axios.patch(`${editScheduleNotefication}/${_id}`, {
        title: title.trim(),
        body: body.trim(),
        NotificationTime: formattedTime,
      });

      toast.success('Notification updated!');
      setShowEditModal(false);
      setEditData(null);
      fetchNotifications();
    } catch (error) {
      console.error('Edit failed:', error);
      toast.error('Failed to update notification');
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      axios
        .post(`${stopScheduleNotefication}/${id}`)
        .then(() => {
          toast.success('Notification deleted');
          fetchNotifications();
        })
        .catch((error) => {
          console.error(error);
          toast.error('Failed to delete notification');
        });
    }
  };

  function formatToLocalInput(isoString: string): string {
    const date = new Date(isoString);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60000);
    return localDate.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
  }


  return (
    <>
      <ol className="flex text-gray-500 font-semibold dark:text-white-dark space-x-2 mb-4">
        <Link to="/">
          <button className="hover:text-gray-500/70 dark:hover:text-white-dark/70">Home</button>
        </Link>
        <li>/</li>
        <Link to="/history">
          <button className="hover:text-gray-500/70 dark:hover:text-white-dark/70">History</button>
        </Link>
        <li>/</li>
        <li>
          <button className="text-black dark:text-white-light hover:text-black/70 dark:hover:text-white-light/70">
            Scheduled Notifications
          </button>
        </li>
      </ol>

      <div className='overflow-x-auto'>
        <h2 className="text-2xl font-semibold mb-4">Scheduled Notifications</h2>
        <table border={1} cellPadding={10} className='w-full table-auto border-collapse border' >
          <thead>
            <tr>
              <th>Sl. NO</th>
              <th>Title</th>
              <th>Body</th>
              <th>Notification Time</th>
              <th>Group / User</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {notifications.length > 0 ? (
              notifications.map((noti, index) => (
                <tr key={noti._id}>
                  <td>{index + 1}</td>
                  <td>{noti.title}</td>
                  <td>{noti.body}</td>
                  <td>{new Date(noti.NotificationTime).toLocaleString()}</td>
                  <td>
                    {noti.groupName && isNaN(Number(noti.groupName)) ? (
                      <span>{noti.groupName}</span>
                    ) : noti.deviceTokens && noti.deviceTokens.length > 0 ? (
                      <ul>
                        {noti.deviceTokens.map((user) => (
                          <li key={user._id}>{user.email}</li>
                        ))}
                      </ul>
                    ) : (
                      'all'
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => handleOpenEditModal(noti)}
                      className="p-2 text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      <IconPencilPaper />
                    </button>
                    <button
                      onClick={() => handleDelete(noti._id)}
                      className="p-2 text-red-500 hover:text-red-600 transition-colors"
                    >
                      <IconTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center' }}>
                  No scheduled notifications.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {showEditModal && editData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-md space-y-4">
            <h3 className="text-xl font-semibold">Edit Notification</h3>

            <label className="block">
              Title:
              <input
                type="text"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                className="w-full border px-2 py-1 mt-1 rounded"
              />
            </label>

            <label className="block">
              Body:
              <textarea
                value={editData.body}
                onChange={(e) => setEditData({ ...editData, body: e.target.value })}
                className="w-full border px-2 py-1 mt-1 rounded"
              />
            </label>

            <label className="block">
              Notification Time:
              <input
                type="datetime-local"
                className="p-4 border-2 focus:outline-none rounded-lg"
                value={formatToLocalInput(editData.NotificationTime)}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    NotificationTime: new Date(e.target.value).toISOString(), // returns full ISO: 2025-07-30T05:59:00.000Z
                  })
                }
              />


            </label>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditData(null);
                }}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button onClick={handleUpdate} className="px-4 py-2 bg-blue-600 text-white rounded">
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ScheduleNotification;
