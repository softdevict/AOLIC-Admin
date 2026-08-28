import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { attendance_display } from "../../../api/config";
import debounce from "lodash.debounce";
import {
    Celebration,
    Person,
    Email,
    Phone,
    Assessment,
    CalendarToday,
    Search,
    Clear,
    GetApp,
    Assignment
} from '@mui/icons-material';

interface EventType {
    Event_Type_ID: string;
    Event_Type_Name: string;
    ID: string;
    zc_display_value: string;
}

interface AttendanceRecord {
    Status: string;
    Date_Time: string;
    Date_field: string;
    Email: string;
    Events: EventType[];
    Employee_Name: string;
    Phone_Number: string;
    ID: string;
    Event_Name: string;
}

function AttendancePage() {
    const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ✅ Pagination states
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // ✅ Filter states
    const [filters, setFilters] = useState({
        Status: "",
        Date_Time: "",
        Date_field: "",
        Email: "",
        Employee_Name: "",
        Phone_Number: "",
        Event_Name: "",
    });

    // ✅ Handle input changes with debounce
    const debouncedFetch = useCallback(
        debounce(async (updatedFilters) => {
            await fetchAttendance(updatedFilters);
        }, 600),
        []
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const newFilters = { ...filters, [name]: value };
        setFilters(newFilters);
        debouncedFetch(newFilters);
    };

    // ✅ Clear filters
    const clearFilters = () => {
        setFilters({
            Status: "",
            Date_Time: "",
            Date_field: "",
            Email: "",
            Employee_Name: "",
            Phone_Number: "",
            Event_Name: "",
        });
        fetchAttendance({});
    };

    // ✅ Download to Excel
    const downloadExcel = () => {
        if (attendanceData.length === 0) {
            alert("No data to download!");
            return;
        }

        // Prepare data for export (flatten Events for Excel, add serial number)
        const exportData = attendanceData.map((record, index) => ({
            Serial: index + 1,
            ...record,
            Events: record.Events.map(e => e.Event_Type_Name).join(", "),
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Attendance Records");
        XLSX.writeFile(wb, `Attendance_Records_${new Date().toISOString().split('T')[0]}.xlsx`);
    };



    const fetchAttendance = async (customFilters: Partial<typeof filters> = filters) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(attendance_display, {
                headers: { Accept: "application/json" },
                params: customFilters,
            });

            let result: AttendanceRecord[] = [];

            if (response.data.code === 3000 && Array.isArray(response.data.data)) {
                result = response.data.data;
            } else if (response.data.success && response.data.data?.data) {
                result = response.data.data.data;
            } else if (response.data.success && Array.isArray(response.data.data)) {
                result = response.data.data;
            }

            // ⭐ SORT BY DATE + TIME DESCENDING ⭐
            result.sort((a, b) => {
                const dateA = new Date(`${a.Date_field} ${a.Date_Time}`).getTime();
                const dateB = new Date(`${b.Date_field} ${b.Date_Time}`).getTime();
                return dateB - dateA; // descending
            });

            setAttendanceData(result);
        } catch (err: any) {
            setError(err.response?.data?.message || "Error fetching data");
        } finally {
            setLoading(false);
        }
    };


    // ✅ Initial fetch
    useEffect(() => {
        fetchAttendance();
    }, []);

    // ✅ Pagination handlers
    const handleChangePage = (event: any, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // ✅ Paginated Data
    const paginatedData = attendanceData.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    // ✅ Simple pagination controls
    const handlePrevPage = () => page > 0 && setPage(page - 1);
    const handleNextPage = () => page < Math.ceil(attendanceData.length / rowsPerPage) - 1 && setPage(page + 1);

    // ✅ Extract time from Date_Time
    const extractTime = (dateTime: string) => {
        if (!dateTime) return "-";
        return dateTime.split(" ")[1] || "-";
    };

    return (
        <div className="p-5">
            <h1 className="text-2xl font-bold text-center text-[#4A70A9] mb-6 flex items-center justify-center">
                <Assignment className="mr-2" />
                Attendance Records
            </h1>

            {/* 🔍 Enhanced Filter Section */}

            <div className="p-6 mb-6 bg-gradient-to-br from-[#EFECE3] to-[#D5D1B6] rounded-xl shadow-lg border border-[#D5D1B6]/30">
                <div className="flex items-center mb-6">
                  
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {[
                        { label: "Event Name", name: "Event_Name", type: "text", placeholder: "Enter event name...", icon: <Celebration /> },
                        { label: "Employee Name", name: "Employee_Name", type: "text", placeholder: "Enter employee name...", icon: <Person /> },
                        { label: "Email", name: "Email", type: "email", placeholder: "Enter email address...", icon: <Email /> },
                        { label: "Phone Number", name: "Phone_Number", type: "tel", placeholder: "Enter phone number...", icon: <Phone /> },
                        { label: "Status", name: "Status", type: "text", placeholder: "e.g., PA, P, A", icon: <Assessment /> },
                        { label: "Date", name: "Date_field", type: "date", placeholder: "Select date...", icon: <CalendarToday /> },
                    ].map((field, index) => (
                        <div key={index} className="relative group">
                            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">{field.label}</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#4A70A9] transition-colors">
                                    {field.icon}
                                </span>
                                <input
                                    type={field.type}
                                    name={field.name}
                                    value={filters[field.name as keyof typeof filters]}
                                    onChange={handleChange}
                                    placeholder={field.placeholder}
                                    className="w-full pl-10 pr-4 py-3 bg-white/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A70A9]/50 focus:border-[#4A70A9]/30 transition-all duration-200 hover:shadow-md group-hover:bg-white"
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-3 flex-1">
                        <button
                            onClick={() => fetchAttendance()}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-[#4A70A9] to-[#8FABD4] hover:from-[#8FABD4] hover:to-[#4A70A9] text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-md hover:shadow-lg flex items-center justify-center"
                        >
                            <Search className="mr-2" />
                            Apply Filters
                        </button>
                        <button
                            onClick={clearFilters}
                            className="flex-1 px-6 py-3 border-2 border-[#4A70A9] hover:bg-[#4A70A9] hover:text-white text-[#4A70A9] font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-md hover:shadow-lg flex items-center justify-center bg-white"
                        >
                            <Clear className="mr-2" />
                            Reset All
                        </button>
                    </div>
                    <button
                        onClick={downloadExcel}
                        disabled={attendanceData.length === 0 || loading}
                        className="px-8 py-3 bg-gradient-to-r from-[#27AE60] to-[#2ECC71] hover:from-[#2ECC71] hover:to-[#27AE60] disabled:from-gray-400 disabled:to-gray-300 disabled:cursor-not-allowed disabled:transform-none text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-md hover:shadow-lg flex items-center justify-center disabled:shadow-none min-w-[200px]"
                    >
                        <GetApp className="mr-2" />
                        Download Excel ({attendanceData.length} records)
                    </button>
                </div>
            </div>

            {/* 📊 Enhanced Table Section */}
            {loading ? (
                <div className="text-center mt-10">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#4A70A9]"></div>
                    <p className="mt-2 text-[#4A70A9]">Loading attendance records...</p>
                </div>
            ) : error ? (
                <div className="p-6 text-center bg-red-50 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-red-600 mb-2">❌ {error}</h3>
                    <button
                        onClick={() => fetchAttendance()}
                        className="px-4 py-2 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-semibold rounded-md transition-colors"
                    >
                        Retry Fetch
                    </button>
                </div>
            ) : (
                <div className="rounded-lg overflow-hidden shadow-lg">
                    <div className="max-h-[600px] overflow-y-auto">
                        <table className="w-full table-auto">
                            <thead className="bg-[#8FABD4] sticky top-0">
                                <tr>
                                    <th className="px-4 py-2 text-left text-white font-bold">#</th>
                                    <th className="px-4 py-2 text-left text-white font-bold">Name</th>
                                    <th className="px-4 py-2 text-left text-white font-bold">Email</th>
                                    <th className="px-4 py-2 text-left text-white font-bold">Phone Number</th>
                                    <th className="px-4 py-2 text-left text-white font-bold">Events</th>
                                    <th className="px-4 py-2 text-left text-white font-bold">Status</th>
                                    <th className="px-4 py-2 text-left text-white font-bold">Date</th>
                                    <th className="px-4 py-2 text-left text-white font-bold">Time</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((record, index) => (
                                        <tr key={record.ID || index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-2 font-medium">{(page * rowsPerPage) + index + 1}</td>
                                            <td className="px-4 py-2 break-words max-w-xs">{record.Employee_Name || "-"}</td>
                                            <td className="px-4 py-2 break-words max-w-xs">{record.Email || "-"}</td>
                                            <td className="px-4 py-2">{record.Phone_Number || "-"}</td>
                                            <td className="px-4 py-2 break-words max-w-xs">
                                                {record.Events && record.Events.length > 0
                                                    ? record.Events.map(e => e.Event_Type_Name).join(", ")
                                                    : record.Event_Name || "-"}
                                            </td>
                                            <td className={`px-4 py-2 font-bold ${record.Status === "PA" ? "text-orange-500" : "text-green-500"}`}>
                                                {record.Status || "-"}
                                            </td>
                                            <td className="px-4 py-2">{record.Date_field || "-"}</td>
                                            <td className="px-4 py-2">{extractTime(record.Date_Time)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-8 text-center">
                                            <h6 className="text-lg text-gray-500">No records found matching the filters.</h6>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* ✅ Enhanced Pagination Controls */}
                    {attendanceData.length > 0 && (
                        <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                <span className="font-medium">
                                    {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, attendanceData.length)} of {attendanceData.length}
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <label className="text-sm text-gray-700 mr-2">Rows per page:</label>
                                <select
                                    value={rowsPerPage}
                                    onChange={handleChangeRowsPerPage}
                                    className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A70A9]"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                </select>
                                <div className="flex items-center space-x-1">
                                    <button
                                        onClick={handlePrevPage}
                                        disabled={page === 0}
                                        className="px-3 py-1 text-sm border border-gray-300 disabled:bg-gray-200 disabled:cursor-not-allowed rounded-md hover:bg-gray-50 transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm text-gray-700 px-3">Page {page + 1}</span>
                                    <button
                                        onClick={handleNextPage}
                                        disabled={page >= Math.ceil(attendanceData.length / rowsPerPage) - 1}
                                        className="px-3 py-1 text-sm border border-gray-300 disabled:bg-gray-200 disabled:cursor-not-allowed rounded-md hover:bg-gray-50 transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default AttendancePage;