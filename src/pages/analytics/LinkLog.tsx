import React, { useEffect, useState } from 'react';
import { user_linkLog } from '../../api/config';
import axios from 'axios';
import InfoIcon from '@mui/icons-material/Info';
import { IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Pagination } from '@mui/material';
import * as XLSX from 'xlsx';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import { Link } from 'react-router-dom';

interface ClickLogEntry {
    userEmail: string;
    cardName: string;
    date: string;
    clickCount: number;
    times: string[];
}

const formatDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    };
    return new Date(dateStr).toLocaleDateString(undefined, options);
};

const formatTime = (timeStr: string, dateStr: string) => {
    const date = new Date(`${dateStr}T${timeStr}`);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const LinkLog: React.FC = () => {
    const [data, setData] = useState<ClickLogEntry[]>([]);
    const [filteredData, setFilteredData] = useState<ClickLogEntry[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<ClickLogEntry | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const rowsPerPage = 50;

    const adminType = localStorage.getItem("adminType");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(user_linkLog);
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
                (entry) => entry.userEmail.toLowerCase().includes(lowercasedSearch) || entry.cardName.toLowerCase().includes(lowercasedSearch) || entry.date.toLowerCase().includes(lowercasedSearch)
            );
            setFilteredData(filtered);
        }
        setPage(1); // Reset to first page on search
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
        // Prepare the data
        const excelData = filteredData.map((entry) => ({
            'User Email': entry.userEmail,
            'Card Name': entry.cardName,
            Date: formatDate(entry.date),
            'Click Count': entry.clickCount,
            'Click Times': entry.times.map((time) => formatTime(time, entry.date)).join(', '),
        }));

        // Calculate total clicks
        const totalClicks = filteredData.reduce((sum, entry) => sum + entry.clickCount, 0);

        // Add summary row
        const summaryRow = {
            'User Email': 'TOTAL',
            'Card Name': '',
            Date: '',
            'Click Count': totalClicks,
            'Click Times': '',
        };
        excelData.push(summaryRow);

        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(excelData);

        // Create workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Click Logs');

        // Set column widths
        const cols = [
            { wch: 30 }, // User Email width
            { wch: 25 }, // Card Name width
            { wch: 15 }, // Date width
            { wch: 12 }, // Click Count width
            { wch: 40 }, // Click Times width
        ];
        worksheet['!cols'] = cols;

        // Style the header and summary row
        const headerStyle = {
            font: { bold: true, color: { rgb: 'FFFFFF' } },
            fill: { fgColor: { rgb: '4F81BD' } },
            alignment: { horizontal: 'center' },
        };

        const summaryStyle = {
            font: { bold: true },
            fill: { fgColor: { rgb: 'F2F2F2' } },
        };

        // Apply styles
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:E1');

        // Style headers (first row)
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: C });
            if (!worksheet[cellAddress]) continue;
            worksheet[cellAddress].s = headerStyle;
        }

        // Style summary row (last row)
        const lastRow = excelData.length;
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: lastRow, c: C });
            if (!worksheet[cellAddress]) continue;
            worksheet[cellAddress].s = summaryStyle;
        }

        // Export the file
        XLSX.writeFile(workbook, 'Click_Logs_Report.xlsx', {
            bookType: 'xlsx',
            type: 'array',
        });
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
                        <button className="text-black dark:text-white-light hover:text-black/70 dark:hover:text-white-light/70">Link Logs</button>
                    </li>
                </ol>

            )}
            <div className="p-0 md:p-6 max-w-7xl mx-auto ">
                <div className="flex md:flex-row flex-col justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 py-4">User Click Logs</h2>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4 md:w-[50%] w-full ">
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
                                Export  <span className='ml-2 lg:inline hidden ' >Excel</span>
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="overflow-auto rounded-lg shadow-lg border border-gray-200">
                    <table className="min-w-full border-collapse">
                        <thead className="bg-gray-100 text-gray-700 uppercase text-sm font-semibold">
                            <tr>
                                <th className="px-5 py-3 border-b border-gray-300 text-left">Sl.No</th>
                                <th className="px-5 py-3 border-b border-gray-300 text-left">User Email</th>
                                <th className="px-5 py-3 border-b border-gray-300 text-left">Card Name</th>
                                <th className="px-5 py-3 border-b border-gray-300 text-left">Date</th>
                                <th className="px-5 py-3 border-b border-gray-300 text-center">Clicks</th>
                                <th className="px-5 py-3 border-b border-gray-300 text-center">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.map((entry, index) => (
                                <tr key={`${entry.userEmail}-${entry.cardName}-${entry.date}`} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                    <td className="px-5 py-4 border-b border-gray-200">{(page - 1) * rowsPerPage + index + 1}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 break-words max-w-xs">
                                        {entry.userEmail === 'Unknown' ? <span className="text-gray-500">Unknown</span> : entry.userEmail}
                                    </td>
                                    <td className="px-5 py-4 border-b border-gray-200">{entry.cardName}</td>
                                    <td className="px-5 py-4 border-b border-gray-200">{formatDate(entry.date)}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 text-center">
                                        <span className="font-medium">{entry.clickCount}</span>
                                    </td>
                                    <td className="px-5 py-4 border-b border-gray-200 text-center">
                                        <Tooltip title="View click times">
                                            <IconButton onClick={() => handleOpenDialog(entry)} size="small" className="hover:bg-blue-50">
                                                <InfoIcon color="primary" fontSize="small" />
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

                <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                    <DialogTitle>Click Times Details</DialogTitle>
                    <DialogContent dividers>
                        {selectedEntry && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">User Email</p>
                                        <p className="font-medium">{selectedEntry.userEmail}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Card Name</p>
                                        <p className="font-medium">{selectedEntry.cardName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Date</p>
                                        <p className="font-medium">{formatDate(selectedEntry.date)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Total Clicks</p>
                                        <p className="font-medium">{selectedEntry.clickCount}</p>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <p className="text-sm text-gray-500 mb-2">Click Times:</p>
                                    <ul className="space-y-1">
                                        {selectedEntry.times.map((time, i) => (
                                            <li key={i} className="flex items-center">
                                                <span className="w-8 text-gray-500">{i + 1}.</span>
                                                <span>{formatTime(time, selectedEntry.date)}</span>
                                            </li>
                                        ))}
                                    </ul>
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

export default LinkLog;
