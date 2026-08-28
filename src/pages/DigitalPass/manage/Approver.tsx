import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { digital_pass, sub_admin } from "../../../api/config";
import {
    Container,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Select,
    MenuItem,
    Chip,
    Box,
    FormControl,
    InputLabel,
    OutlinedInput,
    CircularProgress,
    SelectChangeEvent,
    Checkbox,
} from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface DigitalPass {
    _id: string;
    name: string;
    passId: string;
    active: boolean;
}

interface Approver {
    _id: string;
    name: string;
    passId: string;
    active: boolean;
}

interface HOD {
    _id: string;
    name: string;
    passId: string;
    active: boolean;
}

interface SubAdmin {
    _id: string;
    name: string;
    email: string;
    type: string;
    isActive: boolean;
    approver: Approver[];
    hod: HOD[];
    isHod: boolean;
    createdAt: string;
    updatedAt: string;
}

const SubAdminApproverManagement: React.FC = () => {
    const [subAdmins, setSubAdmins] = useState<SubAdmin[]>([]);
    const [digitalPasses, setDigitalPasses] = useState<DigitalPass[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    // Fetch sub-admins & digital passes
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [adminRes, passRes] = await Promise.all([
                    axios.get(`${sub_admin}`),
                    axios.get(`${digital_pass}/all`),
                ]);

                console.log('Sub-admins data:', adminRes.data);
                console.log('Digital passes data:', passRes.data);

                setSubAdmins(adminRes.data.data || []);
                setDigitalPasses((passRes.data.data || []).map((p: any) => ({
                    _id: p._id,
                    name: p.name,
                    passId: p.passId,
                    active: p.active,
                })));

                toast.success('Data loaded successfully!');
            } catch (err: any) {
                console.error('Error fetching data:', err);
                toast.error(err.response?.data?.message || 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Handle Approver selection change
    const handleApproverChange = async (subAdminId: string, selectedPassIds: string[]) => {
        try {
            setUpdating(subAdminId);

            console.log('Updating approvers for sub-admin:', subAdminId);
            console.log('Selected pass IDs:', selectedPassIds);

            const response = await axios.put(`${digital_pass}/approver/${subAdminId}`, {
                approver: selectedPassIds, // array of digital pass _id
            });

            console.log('Update response:', response.data);

            // Refresh the sub-admins list to get updated data
            const adminRes = await axios.get(`${sub_admin}`);
            setSubAdmins(adminRes.data.data || []);

            toast.success('Approvers updated successfully!');
        } catch (err: any) {
            console.error('Error updating approvers:', err);
            toast.error(err.response?.data?.message || 'Failed to update approvers');
        } finally {
            setUpdating(null);
        }
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <CircularProgress size={60} />
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />

            {/* Header */}
            <Paper
                elevation={3}
                sx={{
                    p: 3,
                    mb: 3,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                }}
            >
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Sub-Admin Approver Management
                </Typography>
                <Typography variant="body1">
                    Total Sub-Admins: {subAdmins.length}
                </Typography>
            </Paper>

            {/* Table */}
            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead sx={{ bgcolor: 'primary.main' }}>
                        <TableRow>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '20%' }}>
                                Sub-Admin Name
                            </TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '20%' }}>
                                Email
                            </TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '30%' }}>
                                Assigned Approvers
                            </TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '30%' }}>
                                Update Approvers
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {subAdmins.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                    <Typography color="textSecondary">No sub-admins found</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            subAdmins.map((admin, index) => {
                                const currentApproverIds = admin.approver?.map(a => a._id) || [];

                                return (
                                    <TableRow
                                        key={admin._id}
                                        sx={{
                                            '&:hover': { bgcolor: 'action.hover' },
                                            bgcolor: index % 2 === 0 ? 'white' : 'grey.50'
                                        }}
                                    >
                                        <TableCell sx={{ fontWeight: 'medium' }}>
                                            {admin.name}
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{admin.email}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            {admin.approver && admin.approver.length > 0 ? (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {admin.approver.map((approver) => (
                                                        <Chip
                                                            key={approver._id}
                                                            label={`${approver.name} (${approver.passId})`}
                                                            size="small"
                                                            color="primary"
                                                            variant="outlined"
                                                        />
                                                    ))}
                                                </Box>
                                            ) : (
                                                <Typography variant="body2" color="textSecondary" fontStyle="italic">
                                                    No approvers assigned
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <FormControl fullWidth size="small">
                                                <InputLabel>Select Approvers</InputLabel>
                                                <Select
                                                    multiple
                                                    value={currentApproverIds}
                                                    onChange={(event: SelectChangeEvent<string[]>) => {
                                                        const value = event.target.value;
                                                        handleApproverChange(
                                                            admin._id,
                                                            typeof value === 'string' ? value.split(',') : value
                                                        );
                                                    }}
                                                    input={<OutlinedInput label="Select Approvers" />}
                                                    renderValue={(selected) => (
                                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                            {(selected as string[]).map((value) => {
                                                                const pass = digitalPasses.find(p => p._id === value);
                                                                return (
                                                                    <Chip
                                                                        key={value}
                                                                        label={pass ? `${pass.name} (${pass.passId})` : value}
                                                                        size="small"
                                                                    />
                                                                );
                                                            })}
                                                        </Box>
                                                    )}
                                                    disabled={updating === admin._id}
                                                    MenuProps={{
                                                        PaperProps: {
                                                            style: {
                                                                maxHeight: 300,
                                                            },
                                                        },
                                                    }}
                                                >
                                                    {digitalPasses.map((pass) => (
                                                        <MenuItem key={pass._id} value={pass._id}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                                                <Checkbox checked={currentApproverIds.indexOf(pass._id) > -1} />
                                                                <Box sx={{ flexGrow: 1, ml: 1 }}>
                                                                    <Typography variant="body2" fontWeight="medium">
                                                                        {pass.name}
                                                                    </Typography>
                                                                    <Typography variant="caption" color="textSecondary">
                                                                        Pass ID: {pass.passId}
                                                                    </Typography>
                                                                </Box>
                                                                {pass.active && (
                                                                    <Chip
                                                                        label="Active"
                                                                        size="small"
                                                                        color="success"
                                                                    />
                                                                )}
                                                            </Box>
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                            {updating === admin._id && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                                    <CircularProgress size={20} sx={{ mr: 1 }} />
                                                    <Typography variant="caption" color="textSecondary">
                                                        Updating...
                                                    </Typography>
                                                </Box>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default SubAdminApproverManagement;