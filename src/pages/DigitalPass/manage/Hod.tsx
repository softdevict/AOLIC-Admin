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
    Button,
    SelectChangeEvent,
} from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface DigitalPass {
    _id: string;
    name: string;
    passId: string;
}

interface SubAdmin {
    _id: string;
    name: string;
    email: string;
    hod: { _id: string; name: string }[];
    isHod: boolean;
}

const SubAdminHodManagement: React.FC = () => {
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

                setSubAdmins(adminRes.data.data || []);
                setDigitalPasses((passRes.data.data || []).map((p: any) => ({
                    _id: p._id,
                    name: p.name,
                    passId: p.passId,
                })));

                toast.success('Data loaded successfully!');
            } catch (err) {
                console.error(err);
                toast.error('Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Handle HOD selection change
    const handleHodChange = async (subAdminId: string, selectedPassIds: string[]) => {
        try {
            setUpdating(subAdminId);
            await axios.put(`${digital_pass}/hod/${subAdminId}`, {
                hod: selectedPassIds, // array of digital pass _id
            });

            // Update local state optimistically
            setSubAdmins(prev =>
                prev.map(admin =>
                    admin._id === subAdminId
                        ? {
                            ...admin,
                            hod: digitalPasses
                                .filter(pass => selectedPassIds.includes(pass._id))
                                .map(pass => ({ _id: pass._id, name: pass.name })),
                        }
                        : admin
                )
            );

            toast.success('HOD updated successfully!');
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to update HOD');
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
            <ToastContainer />

            {/* Header */}
            <Paper elevation={3} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Sub-Admin HOD Management
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
                                Assigned HODs
                            </TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '30%' }}>
                                Update HODs
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
                            subAdmins.map((admin) => {
                                const currentHodIds = admin.hod?.map(h => h._id) || [];

                                return (
                                    <TableRow
                                        key={admin._id}
                                        sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                                    >
                                        <TableCell sx={{ fontWeight: 'medium' }}>
                                            {admin.name}
                                        </TableCell>
                                        <TableCell>{admin.email}</TableCell>
                                        <TableCell>
                                            {admin.hod && admin.hod.length > 0 ? (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {admin.hod.map((h) => (
                                                        <Chip
                                                            key={h._id}
                                                            label={h.name}
                                                            size="small"
                                                            color="primary"
                                                            variant="outlined"
                                                        />
                                                    ))}
                                                </Box>
                                            ) : (
                                                <Typography variant="body2" color="textSecondary" fontStyle="italic">
                                                    No HOD assigned
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <FormControl fullWidth size="small">
                                                <InputLabel>Select HODs</InputLabel>
                                                <Select
                                                    multiple
                                                    value={currentHodIds}
                                                    onChange={(event: SelectChangeEvent<string[]>) => {
                                                        const value = event.target.value;
                                                        handleHodChange(
                                                            admin._id,
                                                            typeof value === 'string' ? value.split(',') : value
                                                        );
                                                    }}
                                                    input={<OutlinedInput label="Select HODs" />}
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
                                                >
                                                    {digitalPasses.map((pass) => (
                                                        <MenuItem key={pass._id} value={pass._id}>
                                                            <Box>
                                                                <Typography variant="body2" fontWeight="medium">
                                                                    {pass.name}
                                                                </Typography>
                                                                <Typography variant="caption" color="textSecondary">
                                                                    Pass ID: {pass.passId}
                                                                </Typography>
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

export default SubAdminHodManagement;