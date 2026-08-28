import React, { useEffect, useState } from 'react';
import { module_linkLog } from '../../api/config';
import axios from 'axios';
import InfoIcon from '@mui/icons-material/Info';
import { IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Pagination } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import * as XLSX from 'xlsx';
import { Link } from 'react-router-dom';

interface ClickLogEntry {
    cardId: string;
    cardName: string;
    headline: string;
    date: string;
    count: number;
    userEmails: string[];
}

const formatDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    };
    return new Date(dateStr).toLocaleDateString(undefined, options);
};

const ModuleLinkLog: React.FC = () => {
    const [data, setData] = useState<ClickLogEntry[]>([]);
    const [filteredData, setFilteredData] = useState<ClickLogEntry[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<ClickLogEntry | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const rowsPerPage = 50;
    const adminType = localStorage.getItem("adminType")
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(module_linkLog);
                const apiData = response.data.data || response.data;
                setData(apiData);
                setFilteredData(apiData);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch click log data:', err);
                setError('Failed to load click log data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredData(data);
        } else {
            const lowercasedSearch = searchTerm.toLowerCase();
            const filtered = data.filter(
                (entry) =>
                    entry.cardName.toLowerCase().includes(lowercasedSearch) ||
                    (entry.headline && entry.headline.toLowerCase().includes(lowercasedSearch)) ||
                    entry.date.toLowerCase().includes(lowercasedSearch)
            );
            setFilteredData(filtered);
            setPage(1); // Reset to first page on search
        }
    }, [searchTerm, data]);

    const handleOpenDialog = (entry: ClickLogEntry) => {
        setSelectedEntry(entry);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedEntry(null);
    };

    const exportToExcel = () => {
        if (!Array.isArray(filteredData) || filteredData.length === 0) {
            console.warn('No data to export.');
            return;
        }

        // Prepare data for Excel
        const excelData = filteredData.map((entry) => ({
            'Card Name': entry.cardName ?? 'N/A',
            Date: entry.date ? formatDate(entry.date) : 'N/A',
            'User Count': typeof entry.count === 'number' ? entry.count : 0,
            'User Emails': Array.isArray(entry.userEmails) && entry.userEmails.length > 0 ? entry.userEmails.join(', ') : 'None',
        }));

        // Calculate and add total row
        const totalCount = filteredData.reduce((sum, entry) => sum + (entry.count || 0), 0);
        console.log('🚀 Total Click Count:', totalCount);

        excelData.push({
            'Card Name': 'TOTAL',
            Date: '',
            'User Count': totalCount,
            'User Emails': '',
        });

        // Create worksheet and workbook
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Module Click Logs');

        // Define column widths
        worksheet['!cols'] = [
            { wch: 25 }, // Card Name
            { wch: 15 }, // Date
            { wch: 10 }, // User Count
            { wch: 40 }, // User Emails
        ];

        // Export Excel file
        XLSX.writeFile(workbook, 'Module_Click_Logs.xlsx');
    };

    const handleChangePage = (event: React.ChangeEvent<unknown>, newPage: number) => {
        setPage(newPage);
    };

    // Calculate the data slice for the current page
    const paginatedData = filteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    if (loading) {
        return <div className="p-6 text-center">Loading...</div>;
    }

    // if (error) {
    //     return <div className="p-6 text-center text-red-500">{error}</div>;
    // }

    // if (data.length === 0) {
    //     return <div className="p-6 text-center">No click log data available</div>;
    // }

    return (
        <>
            {adminType === "super admin" && (
                <ol className="flex text-gray-500 font-semibold dark:text-white-dark space-x-2">
                    <Link to="/">
                        <button className="hover:text-gray-500/70 dark:hover:text-white-dark/70"

                        >Home</button>
                    </Link>

                    <li>/</li>
                    <Link to="/analytics">
                        <button className="hover:text-gray-500/70 dark:hover:text-white-dark/70"

                        >Analytics</button>
                    </Link>
                    <li>/</li>
                    <li>
                        <button className="text-black dark:text-white-light hover:text-black/70 dark:hover:text-white-light/70">Module Link Logs</button>
                    </li>
                </ol>
            )}
            <div className="p-0 md:p-6 max-w-7xl mx-auto">
                <div className="flex md:flex-row flex-col justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 py-4">Module Click Logs</h2>
                    <div className="flex  sm:items-center sm:justify-between gap-4  ">
                        <TextField
                            variant="outlined"
                            size="small"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                            }}
                        />
                        <Button sx={{ maxWidth: '14rem' }} variant="contained" color="primary" startIcon={<DownloadIcon />} onClick={exportToExcel}>
                            Export <span className='ml-2 lg:inline hidden ' >Excel</span>
                        </Button>
                    </div>
                </div>

                <div className="overflow-auto rounded-lg shadow-lg border border-gray-200">
                    <table className="min-w-full border-collapse">
                        <thead className="bg-gray-100 text-gray-700 uppercase text-sm font-semibold">
                            <tr>
                                <th className="px-5 py-3 border-b border-gray-300 text-left">Sl.NO</th>
                                <th className="px-5 py-3 border-b border-gray-300 text-left">Card Name</th>
                                <th className="px-5 py-3 border-b border-gray-300 text-left">Date</th>
                                <th className="px-5 py-3 border-b border-gray-300 text-center">Users Count</th>
                                <th className="px-5 py-3 border-b border-gray-300 text-center">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.map((entry, index) => (
                                <tr key={`${entry.cardId}-${entry.date}`} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                    <td className="px-5 py-4 border-b border-gray-200">{(page - 1) * rowsPerPage + index + 1}</td>
                                    <td className="px-5 py-4 border-b border-gray-200">{entry.cardName}</td>
                                    <td className="px-5 py-4 border-b border-gray-200">{formatDate(entry.date)}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 text-center">
                                        <span className="font-medium">{entry.count}</span>
                                    </td>
                                    <td className="px-5 py-4 border-b border-gray-200 text-center">
                                        <Tooltip title="View user details">
                                            <IconButton onClick={() => handleOpenDialog(entry)} size="small" className="hover:bg-blue-50" disabled={entry.userEmails.length === 0}>
                                                <InfoIcon color={entry.userEmails.length === 0 ? 'disabled' : 'primary'} fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {paginatedData.length === 0 && <div className="p-4 text-center text-gray-500">No matching records found</div>}
                </div>

                <div className="flex justify-center mt-4">
                    <Pagination count={Math.ceil(filteredData.length / rowsPerPage)} page={page} onChange={handleChangePage} color="primary" />
                </div>

                {/* User Details Dialog */}
                <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                    <DialogTitle>User Details</DialogTitle>
                    <DialogContent dividers>
                        {selectedEntry && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Card Name</p>
                                        <p className="font-medium">{selectedEntry.cardName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Date</p>
                                        <p className="font-medium">{formatDate(selectedEntry.date)}</p>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <p className="text-sm text-gray-500 mb-2">User Emails ({selectedEntry.count}):</p>
                                    {selectedEntry.userEmails.length > 0 ? (
                                        <ul className="space-y-1">
                                            {selectedEntry.userEmails.map((email, i) => (
                                                <li key={i} className="flex items-center">
                                                    <span className="w-8 text-gray-500">{i + 1}.</span>
                                                    <span>{email || 'Unknown'}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-500">No user data available</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog} color="primary">
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </>
    );
};

export default ModuleLinkLog;
