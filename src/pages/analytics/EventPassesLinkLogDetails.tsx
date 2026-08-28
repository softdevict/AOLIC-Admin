import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { digital_pass } from "../../api/config";
import { format } from "date-fns";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

// Types
interface HistoryItem {
    name: string;
    email: string;
    phoneNumber: string;
    locations: string[];
    count: string;
    vehicleNo: string;
    status: string;
    comment: string;
    date: string;
    time: string;
}

interface ApiResponse {
    success: boolean;
    message: string;
    totalAttendCount: number;
    eventName: string;
    eventId: string;
    attendUsers: HistoryItem[];
}

const EventPassesLinkLogDetails: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const [data, setData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            if (!eventId) return;
            try {
                const res = await axios.get<ApiResponse>(`${digital_pass}/EventPassesLinkLog/${eventId}`);
                if (res.data.success && res.data.attendUsers) {
                    setData(res.data);
                } else {
                    setError("Invalid response data");
                }
            } catch (err: any) {
                setError("Failed to load data");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [eventId]);

    const allHistory = useMemo(() => {
        return data?.attendUsers || [];
    }, [data]);

    // Count only yes/no
    const totalEntries = useMemo(() => {
        return allHistory.filter(item => item.status === "yes").length;
    }, [allHistory]);

    const totalExits = useMemo(() => {
        return allHistory.filter(item => item.status === "no").length;
    }, [allHistory]);

    // Search + Sort DESC
    const filteredHistory = useMemo(() => {
        if (!allHistory.length) return [];
        let history = allHistory;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            history = history.filter(item =>
                item.email.toLowerCase().includes(term) ||
                item.phoneNumber.includes(term) ||
                item.vehicleNo.toLowerCase().includes(term) ||
                item.comment.toLowerCase().includes(term) ||
                item.name.toLowerCase().includes(term)
            );
        }

        return history.sort((a, b) => {
            const dateTimeA = new Date(`${a.date} ${a.time}`).getTime();
            const dateTimeB = new Date(`${b.date} ${b.time}`).getTime();
            return dateTimeB - dateTimeA; // DESC
        });
    }, [allHistory, searchTerm]);

    // Excel export
    const downloadExcel = () => {
        if (!data?.eventName) return;

        const excelData = filteredHistory.map((item, i) => ({
            "Sr No": i + 1,
            "Name": item.name || "-",
            "Vehicle No": item.vehicleNo || "-",
            "Status":
                item.status === "yes"
                    ? "Entry"
                    : item.status === "no"
                        ? "Exit"
                        : item.status,
            "Date": item.date,
            "Time": item.time,
            "Email": item.email,
            "Phone": item.phoneNumber,
            "Locations": item.locations ? item.locations.join(", ") : "-",
            "Comment": item.comment || "-",
            "Count": item.count
        }));

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Attend History");

        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(blob, `${data.eventName}_AttendHistory_${format(new Date(), "dd-MMM-yyyy")}.xlsx`);
    };

    if (loading) return <div className="p-10 text-center text-xl">Loading...</div>;
    if (error) return <div className="p-10 text-center text-red-600 text-xl">Error: {error}</div>;
    if (!data) return <div className="p-10 text-center text-xl">No data available</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="border border-gray-300 bg-white p-6 mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">{data.eventName}</h1>
                <p className="text-gray-600">
                    Total Entries: <strong>{totalEntries}</strong> | Total Exits:{" "}
                    <strong>{totalExits}</strong> | Total Records:{" "}
                    <strong>{filteredHistory.length}</strong>
                </p>
            </div>

            {/* Search + Download */}
            <div className="border border-gray-300 bg-white p-4 mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <input
                    type="text"
                    placeholder="Search by name, email, phone, vehicle, comment..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border border-gray-300 rounded px-4 py-2 w-full sm:w-96 focus:outline-none focus:border-gray-500"
                />
                <button
                    onClick={downloadExcel}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 border border-blue-600 rounded transition"
                >
                    Download Excel ({filteredHistory.length})
                </button>
            </div>

            {/* Table */}
            <div className="border border-gray-300 bg-white overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="border px-6 py-3">Sr</th>
                                <th className="border px-6 py-3">Name</th>
                                <th className="border px-6 py-3">Email</th>
                                <th className="border px-6 py-3">Phone</th>
                                <th className="border px-6 py-3">Count</th>
                                <th className="border px-8 py-3">Status</th>
                                <th className="border px-6 py-3">Date</th>
                                <th className="border px-6 py-3">Time</th>
                                <th className="border px-6 py-3">Locations</th>
                                <th className="border px-6 py-3">Comment</th>
                                <th className="border px-6 py-3">Vehicle No</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredHistory.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={11}
                                        className="border px-6 py-12 text-center text-gray-500"
                                    >
                                        {searchTerm ? "No matching records found" : "No history available"}
                                    </td>
                                </tr>
                            ) : (
                                filteredHistory.map((item, idx) => (
                                    <tr key={idx} className="even:bg-gray-50">
                                        <td className="border px-6 py-4">{idx + 1}</td>
                                        <td className="border px-6 py-4">{item.name}</td>
                                        <td className="border px-6 py-4">{item.email}</td>
                                        <td className="border px-6 py-4">{item.phoneNumber}</td>
                                        <td className="border px-6 py-4 font-bold">{item.count}</td>

                                        {/* STATUS FIXED */}
                                        <td className="border px-6 py-4">
                                            {item.status === "yes" ? (
                                                <span className="px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-800">
                                                    Entry
                                                </span>
                                            ) : item.status === "no" ? (
                                                <span className="px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-800">
                                                    Exit
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 rounded text-xs font-bold bg-blue-100 text-blue-800">
                                                    {item.status}
                                                </span>
                                            )}
                                        </td>

                                        <td className="border px-6 py-4">{item.date}</td>
                                        <td className="border px-6 py-4">{item.time}</td>
                                        <td className="border px-6 py-4">
                                            {item.locations.join(", ")}
                                        </td>
                                        <td className="border px-6 py-4">{item.comment || "-"}</td>
                                        <td className="border px-6 py-4">{item.vehicleNo}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default EventPassesLinkLogDetails;
