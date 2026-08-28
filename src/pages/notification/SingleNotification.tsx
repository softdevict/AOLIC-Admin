import axios from 'axios';
import React, { useState, ChangeEvent, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import IconTrash from '../../components/Icon/IconTrash';
import { displayAllUSer_email_phone, delete_user } from '../../api/config';

interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
}

function NotificationSingle() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null); // Track deleting user
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const usersPerPage = 20;
  const navigate = useNavigate();
  const adminType = localStorage.getItem("adminType");
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get(displayAllUSer_email_phone, {
          timeout: 10000, // Add timeout to prevent hanging
        });
        const data = Array.isArray(response.data.data) ? response.data.data : [];
        console.log("🚀 ~ fetchUsers ~ data:", data)

        const mappedUsers = data.map((user: any) => ({
          id: user._id || crypto.randomUUID(), // Fallback to UUID if ID is missing
          username: user.username || 'Unknown',
          email: user.email || 'Unknown',
          phone: user.phone || 'Unknown',
        }));

        setUsers(mappedUsers);
        setError(null);
      } catch (error: any) {
        console.error('Error fetching users:', error);
        const message = error.response?.data?.message || 'Failed to load users. Please try again.';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Ensure current page resets when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm)
    );
  }, [users, searchTerm]);

  const totalUsers = filteredUsers.length;
  const totalPages = Math.ceil(totalUsers / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSend = () => {
    if (selectedIds.length === 0) {
      toast.warn('Please select at least one user.');
      return;
    }
    navigate('/sentSingleNotificaton', { state: { selectedIds } }); // Fixed typo in route
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const formatUserId = (index: number): string => {
    return (index + 1).toString().padStart(3, '0');
  };

  const deleteUserById = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setDeleting(id);
    try {
      await axios.delete(`${delete_user}/${id}`);
      setUsers((prev) => prev.filter((user) => user.id !== id));
      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
      toast.success('User deleted successfully');
    } catch (err: any) {
      console.error('Error deleting user:', err);
      const message = err.response?.data?.message || 'Failed to delete user';
      toast.error(message);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen  dark:bg-gray-900">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      {adminType === "super admin" && (
        <nav className="flex space-x-2 text-gray-500 font-semibold dark:text-white-dark mb-6">
          <Link to="/" className="hover:text-gray-500/70 dark:hover:text-white-dark/70">
            Home
          </Link>
          <span>/</span>
          <span className="text-black dark:text-white-light">User</span>
        </nav>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6 max-w-6xl mx-auto">
        {error && (
          <div
            className="mb-4 p-4 bg-red-50 text-red-700 rounded-md"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}
        {loading ? (
          <div className="text-center text-gray-500" aria-live="polite">
            Loading users...
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-2xl font-bold text-gray-800">All Users</h2>
              <div className="relative w-full sm:w-80">
                <label htmlFor="search" className="sr-only">
                  Search users
                </label>
                <input
                  id="search"
                  type="text"
                  placeholder="Search by name, email, or phone"
                  value={searchTerm}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Search users by name, email, or phone"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse table-auto">
                <thead>
                  <tr className="bg-gray-50 text-gray-700">
                    <th className="p-3 text-left w-12" scope="col">
                      <span className="sr-only">Select</span>
                    </th>
                    <th className="p-3 text-left w-24" scope="col">
                      User No
                    </th>
                    <th className="p-3 text-left" scope="col">
                      Email
                    </th>
                    <th className="p-3 text-left" scope="col">
                      Phone
                    </th>
                    <th className="p-3 text-center" scope="col">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.length > 0 ? (
                    paginatedUsers.map((user, index) => (
                      <tr
                        key={user.id}
                        className="border-t border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="p-3">
                          <input
                            type="checkbox"
                            id={`select-${user.id}`}
                            checked={selectedIds.includes(user.id)}
                            onChange={() => handleSelect(user.id)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            aria-label={`Select user ${user.username}`}
                          />
                        </td>
                        <td className="p-3 font-mono">{formatUserId(startIndex + index)}</td>
                        <td className="p-3">{user.email}</td>
                        <td className="p-3">{user.phone}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => deleteUserById(user.id)}
                            disabled={deleting === user.id}
                            className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label={`Delete user ${user.username}`}
                            title="Delete user"
                          >
                            {deleting === user.id ? (
                              <span className="animate-spin inline-block w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full" />
                            ) : (
                              <IconTrash />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-3 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
                aria-label="Previous page"
              >
                Previous
              </button>
              <span className="text-gray-600" aria-live="polite">
                Page {currentPage} of {totalPages} ({totalUsers} users)
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
                aria-label="Next page"
              >
                Next
              </button>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
              <span className="text-gray-600" aria-live="polite">
                Selected: {selectedIds.length} user{selectedIds.length !== 1 ? 's' : ''}
              </span>
              <button
                onClick={handleSend}
                disabled={selectedIds.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
                aria-label="Send notification to selected users"
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default NotificationSingle;