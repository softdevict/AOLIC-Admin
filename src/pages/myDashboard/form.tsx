import React, { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import { displayAllUSer_email_phone, my_dashboard_api, searchUser_email_phone } from '../../api/config';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import CloseIcon from '@mui/icons-material/Close';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Autocomplete,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { toast, ToastContainer } from 'react-toastify'; // Assuming a toast library for notifications

// Constants
enum Mode {
  NONE = '',
  ID_ONLY = 'id-only',
  ID_WITH_LINK = 'id-with-link',
}

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

// Interfaces
interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

interface SpecifyLinkUser {
  id: string;
  link: string;
}

interface ExcelRow {
  Email?: string;
  Phone?: string;
  Link?: string;
}

// Custom hook for Excel processing
const useExcelProcessor = (
  allUsers: User[],
  mode: Mode,
  setAllowUser: React.Dispatch<React.SetStateAction<string[]>>,
  setSpecifyLink: React.Dispatch<React.SetStateAction<SpecifyLinkUser[]>>,
  setError: React.Dispatch<React.SetStateAction<string>>
) => {
  const isValidUrl = useCallback((url: string): boolean => {
    if (!url) return true;
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }, []);

  const processExcelFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          if (!sheetName) {
            setError('Excel file is empty.');
            return;
          }
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(sheet);

          if (jsonData.length === 0) {
            setError('Excel file contains no data.');
            return;
          }

          // Validate headers
          const headers = XLSX.utils.sheet_to_json(sheet, { header: 1 })[0] as string[];
          if (!headers.includes('Email') || !headers.includes('Phone')) {
            setError('Excel file must contain "Email" and "Phone" columns.');
            return;
          }

          const newAllowUser: string[] = [];
          const newSpecifyLink: SpecifyLinkUser[] = [];
          const errors: string[] = [];

          jsonData.forEach((row, index) => {
            const email = row.Email?.trim();
            const phone = row.Phone?.trim();
            const link = row.Link?.trim();

            if (!email || !phone) {
              errors.push(`Row ${index + 2}: Missing email or phone.`);
              return;
            }

            const user = allUsers.find(
              (u) => u.email.toLowerCase() === email.toLowerCase() && u.phone === phone
            );

            if (!user) {
              errors.push(`Row ${index + 2}: No user found for email ${email} and phone ${phone}.`);
              return;
            }

            if (mode === Mode.ID_WITH_LINK) {
              if (link && !isValidUrl(link)) {
                errors.push(`Row ${index + 2}: Invalid link for ${email}. Must start with https:// if provided.`);
                return;
              }
              if (!newSpecifyLink.some((u) => u.id === user._id && u.link === (link || ''))) {
                newSpecifyLink.push({ id: user._id, link: link || '' });
              }
            } else if (mode === Mode.ID_ONLY) {
              if (!newAllowUser.includes(user._id)) {
                newAllowUser.push(user._id);
              }
            }
          });

          if (errors.length > 0) {
            setError(errors.join('\n'));
            return;
          }

          if (newAllowUser.length === 0 && newSpecifyLink.length === 0) {
            setError(`No new users added from Excel file in ${mode} mode.`);
            return;
          }

          setAllowUser((prev) => [...new Set([...prev, ...newAllowUser])]);
          setSpecifyLink((prev) => [...new Set([...prev, ...newSpecifyLink])]);
          setError('');
          toast.success(`Successfully added ${newAllowUser.length + newSpecifyLink.length} users from Excel.`);
        } catch (error) {
          console.error('Error processing Excel file:', error);
          setError('Failed to process Excel file. Ensure it has valid Email and Phone columns.');
        }
      };
      reader.readAsArrayBuffer(file);
    },
    [allUsers, mode, setAllowUser, setSpecifyLink, setError, isValidUrl]
  );

  return { processExcelFile, isValidUrl };
};

// Sub-component for user selection with search
const UserSelection: React.FC<{
  mode: Mode;
  allUsers: User[];
  selectedUserId: string;
  setSelectedUserId: React.Dispatch<React.SetStateAction<string>>;
  userLink: string;
  setUserLink: React.Dispatch<React.SetStateAction<string>>;
  handleAddUser: () => void;
  isValidUrl: (url: string) => boolean;
}> = ({ mode, allUsers, selectedUserId, setSelectedUserId, userLink, setUserLink, handleAddUser, isValidUrl }) => {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <Autocomplete
        options={allUsers}
        getOptionLabel={(user) => `${user.email} (${user.phone})`}
        disabled={mode === Mode.NONE}
        value={allUsers.find((user) => user._id === selectedUserId) || null}
        onChange={(event, newValue) => {
          setSelectedUserId(newValue ? newValue._id : '');
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search User by Email or Phone"
            variant="outlined"
            className={`flex-1 min-w-[200px] bg-white ${mode === Mode.NONE ? 'bg-gray-200' : ''}`}
            InputProps={{
              ...params.InputProps,
              className: `p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all ${mode === Mode.NONE ? 'bg-gray-200 cursor-not-allowed' : ''}`,
            }}
            aria-label="Search user"
          />
        )}
        filterOptions={(options, { inputValue }) => {
          const input = inputValue.toLowerCase();
          return options.filter(
            (user) =>
              (user.email?.toLowerCase() || '').includes(input) ||
              (user.phone?.toLowerCase() || '').includes(input)
          );
        }}
        renderOption={(props, user) => (
          <li {...props} key={user._id}>
            {user.email} ({user.phone})
          </li>
        )}
        className="flex-1 min-w-[200px]"
      />


      {mode === Mode.ID_WITH_LINK && (
        <input
          type="text"
          placeholder="User-specific link (optional)"
          value={userLink}
          onChange={(e) => setUserLink(e.target.value)}
          className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none bg-gray-50 transition-all"
          aria-label="User-specific link"
        />
      )}

      <button
        type="button"
        onClick={handleAddUser}
        disabled={mode === Mode.NONE}
        className={`px-5 py-3 rounded-lg font-semibold transition-all ${mode === Mode.NONE ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-gradient-to-br from-[#27ae60] to-[#27ae93] text-white hover:shadow-lg hover:-translate-y-0.5'}`}
        aria-label="Add user"
      >
        Add User
      </button>
    </div>
  );
};

const MyDashboardForm: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [commonLink, setCommonLink] = useState<string>('');
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [userLink, setUserLink] = useState<string>('');
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const [loadingExcel, setLoadingExcel] = useState<boolean>(false);
  const [mode, setMode] = useState<Mode>(Mode.NONE);
  const [allowUser, setAllowUser] = useState<string[]>([]);
  const [specifyLink, setSpecifyLink] = useState<SpecifyLinkUser[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { processExcelFile, isValidUrl } = useExcelProcessor(
    allUsers,
    mode,
    setAllowUser,
    setSpecifyLink,
    setError
  );

  // Fetch users
  useEffect(() => {
    axios
      .get(displayAllUSer_email_phone)
      .then((response) => {
        if (response.data && Array.isArray(response.data.data)) {
          setAllUsers(response.data.data);
        } else {
          setAllUsers([]);
          setError('No users found.');
        }
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
        setAllUsers([]);
        setError(`Failed to fetch users: ${error.message}`);
      })
      .finally(() => setLoadingUsers(false));
  }, []);

  // Handle image change
  const handleImgChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (file.size > MAX_IMAGE_SIZE) {
        setError('Image file size exceeds 10MB.');
        return;
      }
      setImgFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImg(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImgFile(null);
      setPreviewImg(null);
    }
    setError('');
  }, []);

  // Handle Excel file upload
  const handleExcelChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (mode === Mode.NONE) {
        setError('Please select a mode before uploading an Excel file.');
        return;
      }
      const file = e.target.files?.[0] || null;
      if (file) {
        setLoadingExcel(true);
        processExcelFile(file);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
      setLoadingExcel(false);
    },
    [mode, processExcelFile]
  );

  // Handle adding a user manually
  const handleAddUser = useCallback(() => {
    if (mode === Mode.NONE) {
      setError('Please select a mode before adding a user.');
      return;
    }
    if (!selectedUserId) {
      setError('Please select a user.');
      return;
    }

    if (mode === Mode.ID_WITH_LINK) {
      if (userLink && !isValidUrl(userLink)) {
        setError('User-specific link must be a valid URL starting with https:// if provided.');
        return;
      }
      if (specifyLink.some((u) => u.id === selectedUserId && u.link === (userLink.trim() || ''))) {
        setError('This user with the same link is already added.');
        return;
      }
      setSpecifyLink((prev) => [...prev, { id: selectedUserId, link: userLink.trim() || '' }]);
    } else {
      if (allowUser.includes(selectedUserId)) {
        setError('This user is already added in Nested Card mode.');
        return;
      }
      setAllowUser((prev) => [...prev, selectedUserId]);
    }

    setSelectedUserId('');
    setUserLink('');
    setError('');
    toast.success('User added successfully.');
  }, [mode, selectedUserId, userLink, specifyLink, allowUser, isValidUrl]);

  // Handle link change for specific link users
  const handleLinkChange = useCallback((index: number, newLink: string) => {
    setSpecifyLink((prev) =>
      prev.map((u, i) => (i === index ? { ...u, link: newLink } : u))
    );
  }, []);

  // Handle removing users
  const handleRemoveAllowUser = useCallback((index: number) => {
    setAllowUser((prev) => prev.filter((_, idx) => idx !== index));
    setError('');
  }, []);

  const handleRemoveSpecifyLink = useCallback((index: number) => {
    setSpecifyLink((prev) => prev.filter((_, idx) => idx !== index));
    setError('');
  }, []);

  // Clear all users
  const handleClearAllAllowUsers = useCallback(() => {
    setAllowUser([]);
    setError('');
    toast.info('All nested users cleared.');
  }, []);

  const handleClearAllSpecifyLink = useCallback(() => {
    setSpecifyLink([]);
    setError('');
    toast.info('All specific link users cleared.');
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsSubmitting(true);
      setError('');

      if (!name.trim()) {
        setError('Name is required.');
        setIsSubmitting(false);
        return;
      }

      if (!imgFile) {
        setError('Image is required.');
        setIsSubmitting(false);
        return;
      }

      if (mode === Mode.NONE) {
        setError('Please select a mode.');
        setIsSubmitting(false);
        return;
      }

      if (mode === Mode.ID_WITH_LINK && !commonLink.trim()) {
        setError('Common Link is required in Specific Link mode.');
        setIsSubmitting(false);
        return;
      }

      if (commonLink.trim() && !isValidUrl(commonLink.trim())) {
        setError('Common Link must be a valid URL starting with https://.');
        setIsSubmitting(false);
        return;
      }

      if (mode === Mode.ID_ONLY && allowUser.length === 0) {
        setError('Please add at least one user in Nested Card mode.');
        setIsSubmitting(false);
        return;
      }

      if (mode === Mode.ID_WITH_LINK && specifyLink.length === 0) {
        setError('Please add at least one user in Specific Link mode.');
        setIsSubmitting(false);
        return;
      }

      if (mode === Mode.ID_WITH_LINK) {
        const invalidLinks = specifyLink.filter((u) => u.link && !isValidUrl(u.link));
        if (invalidLinks.length > 0) {
          setError('All user-specific links must be valid URLs starting with https:// or empty.');
          setIsSubmitting(false);
          return;
        }
      }

      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('commonlink', commonLink.trim());
      formData.append('img', imgFile);
      formData.append('allowUser', JSON.stringify(allowUser));
      formData.append('specifyLink', JSON.stringify(specifyLink));

      try {
        await axios.post(my_dashboard_api, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        setName('');
        setCommonLink('');
        setImgFile(null);
        setPreviewImg(null);
        setAllowUser([]);
        setSpecifyLink([]);
        setMode(Mode.NONE);
        setSelectedUserId('');
        setUserLink('');
        setError('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        toast.success('Card created successfully!');
        setTimeout(() => {

          navigate('/my_dashboard');
        }, 2000)
      } catch (error: any) {
        console.error('Error:', error);
        const message =
          error.response?.status === 400
            ? 'Invalid data submitted. Please check your inputs.'
            : error.response?.data?.message || 'Failed to create card.';
        setError(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [name, imgFile, mode, commonLink, allowUser, specifyLink, isValidUrl, navigate]
  );

  return (
    <>
      <ToastContainer />

      <div className="mx-auto p-6 bg-white max-w-[60rem] shadow-2xl rounded-lg">
        <div className="flex justify-between items-center mb-6 px-8">
          <div></div>
          <h2 className="text-2xl font-semibold">Create Dashboard Card</h2>
          <button
            onClick={() => navigate('/my_dashboard')}
            className="text-gray-600 hover:text-gray-800"
            aria-label="Close form"
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
          )}

          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700">Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none bg-gray-50 transition-all"
              aria-label="Card name"
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700">Image:</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50 hover:border-indigo-400 transition-all relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImgChange}
                required
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                aria-label="Upload image"
              />
              <div className="text-gray-600">{imgFile ? 'Change image' : 'Click to upload or drag and drop'}</div>
              <div className="text-gray-400 text-sm mt-1">PNG, JPG, GIF up to 10MB</div>
            </div>
          </div>

          {previewImg && (
            <div className="mb-6 text-center">
              <p className="font-semibold text-gray-700 mb-2">Image Preview:</p>
              <img
                src={previewImg}
                alt="Preview"
                className="max-w-xs max-h-48 rounded-lg border border-gray-300 shadow-sm mx-auto"
              />
            </div>
          )}

          <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <label className="block mb-2 font-semibold text-gray-700">Selection Mode:</label>
            <select
              value={mode}
              onChange={(e) => {
                setMode(e.target.value as Mode);
                setError('');
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-white transition-all mb-4"
              aria-label="Selection mode"
            >
              <option value={Mode.NONE}>-- Select Mode --</option>
              <option value={Mode.ID_ONLY}>Nested Card</option>
              <option value={Mode.ID_WITH_LINK}>Common Link & Specific User Link</option>
            </select>

            {mode === Mode.ID_WITH_LINK && (
              <div className="mb-6">
                <label className="block mb-2 font-semibold text-gray-700">Common Link:</label>
                <input
                  type="text"
                  value={commonLink}
                  onChange={(e) => {
                    setCommonLink(e.target.value);
                    setError('');
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none bg-gray-50 transition-all"
                  aria-label="Common link"
                />
                {commonLink && !isValidUrl(commonLink) && (
                  <p className="text-red-600 text-sm mt-1">Common Link must start with https://</p>
                )}
              </div>
            )}

            <div className="mb-6">
              <label className="block mb-2 font-semibold text-gray-700">Upload Excel File:</label>
              <div
                className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50 transition-all relative ${mode === Mode.NONE ? 'opacity-50 cursor-not-allowed' : 'hover:border-indigo-400'}`}
              >
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleExcelChange}
                  ref={fileInputRef}
                  disabled={mode === Mode.NONE || loadingExcel}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  aria-label="Upload Excel file"
                />
                <div className="text-gray-600">
                  {loadingExcel
                    ? 'Processing Excel file...'
                    : mode === Mode.NONE
                      ? 'Select a mode to enable Excel upload'
                      : 'Click to upload or drag and drop Excel file'}
                </div>
                <div className="text-gray-400 text-sm mt-1">
                  XLSX or XLS with Email and Phone columns (Link column optional)
                </div>
              </div>
            </div>

            {loadingUsers ? (
              <div className="text-center p-6 text-gray-600 bg-gray-50 rounded-lg">
                Loading users...
              </div>
            ) : allUsers.length === 0 ? (
              <div className="text-center p-6 text-gray-600 bg-gray-50 rounded-lg">
                No users available
              </div>
            ) : (
              <UserSelection
                mode={mode}
                allUsers={allUsers}
                selectedUserId={selectedUserId}
                setSelectedUserId={setSelectedUserId}
                userLink={userLink}
                setUserLink={setUserLink}
                handleAddUser={handleAddUser}
                isValidUrl={isValidUrl}
              />
            )}
          </div>

          {mode === Mode.ID_ONLY && (
            <div className="mb-6">
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="nested-card-content"
                  id="nested-card-header"
                  className="bg-gray-100"
                >
                  <Typography variant="h6" className="font-semibold">
                    Nested Card: {allowUser.length} users added
                  </Typography>
                </AccordionSummary>
                <AccordionDetails className="bg-gray-50">
                  {allowUser.length === 0 ? (
                    <p className="text-gray-500 italic p-4 text-center bg-gray-50 rounded-lg">No users added.</p>
                  ) : (
                    <div className="max-h-48 overflow-y-auto">
                      {allowUser.map((id, index) => {
                        const fullUser = allUsers.find((u) => u._id === id);
                        return (
                          <div
                            key={id}
                            className="flex justify-between items-center p-3 bg-gray-50 mb-3 rounded-lg shadow-sm"
                          >
                            <span className="text-gray-700 font-medium">
                              {fullUser ? `${fullUser.email} (${fullUser.phone})` : id}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveAllowUser(index)}
                              className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                              aria-label={`Remove ${fullUser?.email || id}`}
                            >
                              Remove
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {allowUser.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllAllowUsers}
                      className="mt-4 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                      aria-label="Clear all nested users"
                    >
                      Clear All
                    </button>
                  )}
                </AccordionDetails>
              </Accordion>
            </div>
          )}

          {mode === Mode.ID_WITH_LINK && (
            <div className="mb-6">
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="specific-link-content"
                  id="specific-link-header"
                  className="bg-gray-100"
                >
                  <Typography variant="h6" className="font-semibold">
                    Specific Link: {specifyLink.length} users added
                  </Typography>
                </AccordionSummary>
                <AccordionDetails className="bg-gray-50">
                  {specifyLink.length === 0 ? (
                    <p className="text-gray-500 italic p-4 text-center bg-gray-50 rounded-lg">No user-link pairs added.</p>
                  ) : (
                    <div className="max-h-48 overflow-y-auto">
                      {specifyLink.map((user, index) => {
                        const fullUser = allUsers.find((u) => u._id === user.id);
                        return (
                          <div
                            key={`${user.id}-${index}`}
                            className="p-4 bg-gray-50 mb-3 rounded-lg shadow-sm"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-semibold text-gray-700">
                                {fullUser ? `${fullUser.email} (${fullUser.phone})` : user.id}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveSpecifyLink(index)}
                                className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                                aria-label={`Remove ${fullUser?.email || user.id}`}
                              >
                                Remove
                              </button>
                            </div>
                            <TextField
                              label="User-specific Link (optional)"
                              value={user.link}
                              onChange={(e) => handleLinkChange(index, e.target.value)}
                              fullWidth
                              size="small"
                              error={!!user.link && !isValidUrl(user.link)}
                              helperText={user.link && !isValidUrl(user.link) ? 'Link must start with https:// if provided' : ''}
                              className="bg-white"
                              aria-label={`Link for ${fullUser?.email || user.id}`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {specifyLink.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllSpecifyLink}
                      className="mt-4 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                      aria-label="Clear all specific link users"
                    >
                      Clear All
                    </button>
                  )}
                </AccordionDetails>
              </Accordion>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full p-4 text-white rounded-lg font-semibold transition-all ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-br from-[#27ae60] to-[#27ae93] hover:shadow-lg hover:-translate-y-0.5'}`}
            aria-label="Create card"
          >
            {isSubmitting ? 'Creating...' : 'Create Card'}
          </button>
        </form>
      </div>
    </>
  );
};

export default MyDashboardForm;