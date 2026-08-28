import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  MenuItem,
  Card,
  CardContent,
  Chip,
  Avatar,
  IconButton,
  Paper,
  Alert,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  Person as PersonIcon,
  ClearAll as ClearAllIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { nested_my_dashboard_api, my_dashboard_user } from '../../api/config';
import { useLocation, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { toast, ToastContainer } from 'react-toastify';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface User {
  _id: string;
  email: string;
  phone: string;
}

interface AssignedUser {
  id: string;
  link: string;
  phone: string;
}

interface Props {
  parentId?: string;
}

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: '800px',
  margin: 'auto',
  marginTop: theme.spacing(4),
  padding: theme.spacing(3),
  borderRadius: theme.spacing(1),
  background: '#ffffff',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
}));

const NestedForm: React.FC<Props> = ({ parentId }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState('');
  const [commonLink, setCommonLink] = useState('');
  const [assignedUsers, setAssignedUsers] = useState<AssignedUser[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [openClearDialog, setOpenClearDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [userLink, setUserLink] = useState('');

  const location = useLocation();
  const effectiveParentId = location.state?.id || parentId;
  const navigate = useNavigate();

  // Fetch available users
  useEffect(() => {
    if (!effectiveParentId) return;

    axios
      .get(`${my_dashboard_user}/${effectiveParentId}`)
      .then((res) => {
        const fetchedUsers = Array.isArray(res.data.data) ? res.data.data : [];
        setUsers(fetchedUsers);
      })
      .catch(() => {
        setUsers([]);
        setMessage({ type: 'error', text: 'Failed to fetch users.' });
      });
  }, [effectiveParentId]);

  // Handle Excel file upload
  const handleExcelChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[];

      // Extract headers and normalize to lowercase
      const headers = (jsonData[0] as string[]).map((header) => header?.toString().toLowerCase());
      const emailCol = headers.find((h) => h === 'email' || h === 'Email');
      const phoneCol = headers.find((h) => h === 'phone' || h === 'Phone');
      const linkCol = headers.find((h) => h === 'link' || h === 'Link'); // linkCol can be undefined

      if (!emailCol || !phoneCol) {
        setMessage({
          type: 'error',
          text: 'Excel file must contain columns: Email, Phone (case-insensitive). Link is optional.',
        });
        return;
      }

      const newUsers: AssignedUser[] = [];
      const errors: string[] = [];

      // Process rows starting from index 1 (skip header)
      jsonData.slice(1).forEach((row, index) => {
        const rowData = row as any[];
        const email = rowData[headers.indexOf(emailCol)]?.toString().trim();
        const phone = rowData[headers.indexOf(phoneCol)]?.toString().trim();
        const link = linkCol ? rowData[headers.indexOf(linkCol)]?.toString().trim() || '' : '';

        // Validate mandatory fields
        if (!email || !phone) {
          errors.push(`Row ${index + 2}: Missing Email or Phone.`);
          return;
        }

        // Validate phone format (basic regex for numbers, allowing + and -)
        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        if (!phoneRegex.test(phone)) {
          errors.push(`Row ${index + 2}: Invalid Phone number format for ${email}.`);
          return;
        }

        // Find user by email
        const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (!user) {
          errors.push(`Row ${index + 2}: Email ${email} not found in users.`);
          return;
        }

        // Check if phone matches the user's phone
        if (user.phone !== phone) {
          errors.push(`Row ${index + 2}: Phone ${phone} does not match user ${email}'s phone.`);
          return;
        }

        // Check for duplicates
        if (
          !newUsers.some((u) => u.id === user._id && u.link === link && u.phone === phone) &&
          !assignedUsers.some((u) => u.id === user._id && u.link === link && u.phone === phone)
        ) {
          newUsers.push({ id: user._id, link, phone });
        }
      });

      if (errors.length > 0) {
        setMessage({ type: 'error', text: errors.join('\n') });
      } else {
        setAssignedUsers((prev) => [
          ...prev,
          ...newUsers.filter(
            (nu) => !prev.some((p) => p.id === nu.id && p.link === nu.link && p.phone === nu.phone)
          ),
        ]);
        setMessage({
          type: 'success',
          text: `Successfully added ${newUsers.length} users from Excel.`,
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleAddUser = () => {
    if (!selectedUserId) {
      setMessage({ type: 'error', text: 'Please select an Email.' });
      return;
    }

    const selectedUser = users.find((u) => u._id === selectedUserId);
    if (!selectedUser) {
      setMessage({ type: 'error', text: 'Selected user not found.' });
      return;
    }

    const newUser: AssignedUser = {
      id: selectedUserId,
      link: userLink.trim() || '', // Allow empty link
      phone: selectedUser.phone,
    };

    if (!assignedUsers.some((u) => u.id === newUser.id && u.link === newUser.link && u.phone === newUser.phone)) {
      setAssignedUsers([...assignedUsers, newUser]);
      setMessage({ type: 'success', text: 'User added successfully.' });
    } else {
      setMessage({ type: 'error', text: 'This user with the same Link and Phone already exists.' });
    }

    setSelectedUserId('');
    setUserLink('');
  };

  const handleRemoveUser = (userId: string, link: string, phone: string) => {
    setAssignedUsers(assignedUsers.filter((u) => !(u.id === userId && u.link === link && u.phone === phone)));
  };

  const handleClearAssignedUsers = () => {
    setAssignedUsers([]);
    setMessage({ type: 'success', text: 'All assigned users cleared.' });
    setOpenClearDialog(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Basic URL validation: must start with https://
    if (!name.trim() || !commonLink.trim()) {
      setMessage({ type: 'error', text: 'Name and Common Link are required fields.' });
      setLoading(false);
      return;
    }

    if (!commonLink.startsWith('https://')) {
      setMessage({ type: 'error', text: 'Common Link must start with "https://".' });
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('commonLink', commonLink);
    files.forEach((file) => formData.append('img', file));

    if (assignedUsers.length) {
      formData.append('userIds', JSON.stringify(assignedUsers));
    }

    try {
      const url = effectiveParentId
        ? `${nested_my_dashboard_api}/${effectiveParentId}`
        : nested_my_dashboard_api;

      const res = await axios.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage({ type: 'success', text: res.data.message });
      setName('');
      setCommonLink('');
      setAssignedUsers([]);
      setFiles([]);
      toast.success('Card created successfully!');
      setTimeout(() => {
        navigate('/my_dashboard/nested', { state: { id: effectiveParentId } });
      }, 2000)
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Server error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (

    <>
      <ToastContainer />
      <StyledCard elevation={3}>
        <CardContent>
          <div className='flex  justify-between '>

            <Typography
              variant="h5"
              component="h1"
              fontWeight={700} // bolder
              color="#0D1B2A" // blackish-blue
              mb={3} // spacing below
              sx={{
                letterSpacing: '0.5px',
              }}
            >
              Create Nested Dashboard Card
            </Typography>


            <ArrowBackIcon
              sx={{

                cursor: 'pointer',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.2)', // enlarge slightly on hover
                  color: 'primary.main',   // optional color change
                },
              }}
              onClick={() => navigate('/my_dashboard/nested', { state: { id: effectiveParentId } })}
            />


          </div>
          {/* <Typography variant="body2" color="text.secondary" mb={3}>
            Add a new card to your dashboard with optional user assignments
          </Typography> */}

          <Divider sx={{ mb: 3 }} />

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Name */}
              <TextField
                fullWidth
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                variant="outlined"
                sx={{
                  backgroundColor: 'white',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                  },
                }}
                error={name.trim() === '' && message?.type === 'error'}
                helperText={name.trim() === '' && message?.type === 'error' ? 'Name is required' : ''}
              />

              {/* Common Link */}
              <TextField
                fullWidth
                label="Common Link"
                value={commonLink}
                onChange={(e) => setCommonLink(e.target.value)}
                variant="outlined"
                sx={{
                  backgroundColor: 'white',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                  },
                }}
                error={
                  (commonLink.trim() === '' ||
                    (commonLink.trim() !== '' && !commonLink.startsWith('https://'))) &&
                  message?.type === 'error'
                }
                helperText={
                  commonLink.trim() === ''
                    ? 'Common Link is required'
                    : !commonLink.startsWith('https://')
                      ? 'Link must start with "https://"'
                      : ''
                }
              />

              {/* User Assignment */}
              <Box>
                <Typography variant="h6" fontWeight="500" mb={1}>
                  User Assignment
                </Typography>
                <Autocomplete
                  fullWidth
                  options={users}
                  getOptionLabel={(option) => `${option.email} (${option.phone})`}
                  renderOption={(props, option) => (
                    <li {...props} key={option._id}>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: 'primary.main' }}>
                          <PersonIcon sx={{ fontSize: 16 }} />
                        </Avatar>
                        {option.email} ({option.phone})
                      </Box>
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Search Email"
                      variant="outlined"
                      sx={{
                        backgroundColor: 'white',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1,
                        },
                      }}
                    />
                  )}
                  value={users.find((u) => u._id === selectedUserId) || null}
                  onChange={(event, newValue) => {
                    setSelectedUserId(newValue?._id || '');
                  }}
                  isOptionEqualToValue={(option, value) => option._id === value._id}
                  noOptionsText="No users found"
                />
                <TextField
                  fullWidth
                  label="User-specific Link (Optional)"
                  value={userLink}
                  onChange={(e) => setUserLink(e.target.value)}
                  variant="outlined"
                  sx={{
                    mt: 2,
                    backgroundColor: 'white',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                    },
                  }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleAddUser}
                  sx={{ mt: 2, borderRadius: 1 }}
                >
                  Add User
                </Button>
              </Box>

              {/* Excel Upload */}
              <Box>
                <Typography variant="subtitle1" mb={1}>
                  Bulk Upload from Excel (Columns: Email, Phone - required; Link - optional)
                </Typography>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={{ borderRadius: 1 }}
                >
                  Upload Excel
                  <VisuallyHiddenInput type="file" accept=".xlsx,.xls" onChange={handleExcelChange} />
                </Button>
              </Box>

              {/* Assigned Users */}
              {assignedUsers.length > 0 && (
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle1" fontWeight="500">
                      Assigned Users ({assignedUsers.length})
                    </Typography>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<ClearAllIcon />}
                      onClick={() => setOpenClearDialog(true)}
                      sx={{ borderRadius: 1 }}
                    >
                      Clear All
                    </Button>
                  </Box>
                  <Box display="flex" flexDirection="column" gap={2}>
                    {assignedUsers.map((user) => {
                      const userData = users.find((u) => u._id === user.id);
                      return (
                        <Box
                          key={`${user.id}-${user.link}-${user.phone}`}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: 'grey.50',
                            borderRadius: 1,
                            p: 1,
                          }}
                        >
                          <Chip
                            avatar={<Avatar>{userData?.email?.charAt(0).toUpperCase() || 'U'}</Avatar>}
                            label={`${userData?.email || user.id} (${user.phone})`}
                            variant="outlined"
                            sx={{ flex: 1, justifyContent: 'flex-start' }}
                          />
                          <TextField
                            value={user.link}
                            onChange={(e) => {
                              setAssignedUsers((prev) =>
                                prev.map((u) =>
                                  u.id === user.id && u.phone === user.phone ? { ...u, link: e.target.value } : u
                                )
                              );
                            }}
                            size="small"
                            sx={{ flex: 2, mx: 1, backgroundColor: 'white' }}
                            placeholder="User-specific Link"
                          />
                          <IconButton
                            onClick={() => handleRemoveUser(user.id, user.link, user.phone)}
                            color="error"
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      );
                    })}
                  </Box>
                </Paper>
              )}

              {/* Image Upload */}
              <Box>
                <Typography variant="h6" fontWeight="500" mb={1}>
                  Upload Images
                </Typography>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={{ borderRadius: 1 }}
                >
                  Select Images
                  <VisuallyHiddenInput
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFiles(Array.from(e.target.files || []))}
                  />
                </Button>
                {files.length > 0 && (
                  <Chip
                    label={`${files.length} file(s) selected`}
                    variant="filled"
                    color="primary"
                    size="small"
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>

              {/* Image Previews */}
              {files.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" mb={1}>
                    Image Previews:
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={2}>
                    {files.map((file, index) => (
                      <Box
                        key={index}
                        sx={{
                          position: 'relative',
                          border: '1px solid',
                          borderColor: 'grey.300',
                          borderRadius: 1,
                          overflow: 'hidden',
                          width: 100,
                          height: 100,
                        }}
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`preview-${index}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            backgroundColor: 'rgba(255,255,255,0.8)',
                          }}
                          onClick={() => setFiles(files.filter((_, i) => i !== index))}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Submit Button */}
              <Box display="flex" justifyContent="flex-end">

                <Button

                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={loading}
                  // startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
                  sx={{
                    width: "100%",
                    borderRadius: 1,
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    textTransform: 'none',
                    background: loading
                      ? '#9CA3AF' // Matches Tailwind's bg-gray-400 for disabled/loading state
                      : 'linear-gradient(to bottom right, #27ae60, #27ae93)', // Gradient from #27ae60 to #27ae93
                    color: 'white', // Matches text-white
                    transition: 'all 0.3s ease', // Matches Tailwind's transition-all
                    '&:hover': {
                      background: loading
                        ? '#9CA3AF' // Keep disabled background on hover
                        : 'linear-gradient(to bottom right, #2ecc71, #2ea4a1)', // Slightly lighter gradient for hover
                      // Only apply shadow and transform if not loading
                      ...(loading
                        ? {}
                        : {
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', // Matches hover:shadow-lg
                          transform: 'translateY(-0.125rem)', // Matches hover:-translate-y-0.5
                        }),
                    },
                    '&.Mui-disabled': {
                      color: 'white', // Ensure text remains white when disabled
                      opacity: 0.7, // Slightly reduce opacity for disabled state
                    },
                  }}
                >
                  {loading ? 'Submitting...' : 'Submit'}
                </Button>
              </Box>


              {/* Alert */}
              {message && (
                <Alert
                  severity={message.type}
                  sx={{ mt: 3, borderRadius: 1 }}
                  onClose={() => setMessage(null)}
                >
                  {message.text}
                </Alert>
              )}
            </Box>
          </form>
        </CardContent>

        <Dialog
          open={openClearDialog}
          onClose={() => setOpenClearDialog(false)}
          aria-labelledby="clear-dialog-title"
        >
          <DialogTitle id="clear-dialog-title">Clear Assigned Users</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to clear all assigned users? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenClearDialog(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={handleClearAssignedUsers} color="error" autoFocus>
              Clear
            </Button>
          </DialogActions>
        </Dialog>
      </StyledCard>
    </>
  );
};

export default NestedForm;