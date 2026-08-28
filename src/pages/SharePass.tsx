import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import PersonIcon from "@mui/icons-material/Person";
import { digital_pass } from "../api/config";
import logo from "../../src/assets/img/favicon.png"

function SharePass() {
    const { passId } = useParams<{ passId: string }>();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPass = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${digital_pass}/fullDetails/${passId}`);

                if (res.data.success) {
                    setData(res.data.data);
                } else {
                    setError("Failed to fetch pass details");
                }
            } catch (err) {
                setError("Unable to load pass. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        if (passId) fetchPass();
    }, [passId]);

    if (loading) {
        return (
            <div className="h-screen bg-gray-100 flex items-center justify-center">
                <p className="text-center text-lg text-gray-600">Loading Pass...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="absolute bg-white h-screen top-0 left-0 z-50 w-screen  flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-2">
                        {error || "Pass not found"}
                    </h2>
                    <p className="text-gray-600 text-lg">
                        We couldn’t find any pass for this link.
                    </p>
                </div>
            </div>
        );
    }


    const formatAddress = (addr: any) => {
        try {
            // If addr is a string like '["Kaveri"]'
            if (typeof addr === "string" && addr.startsWith("[")) {
                const parsed = JSON.parse(addr); // Convert to array
                return parsed.join(", ");
            }

            // If it's already an array
            if (Array.isArray(addr)) {
                return addr.join(", ");
            }

            // Otherwise return as is
            return addr;
        } catch {
            return addr;
        }
    };


    const { card, userPass: user } = data;

    // ⭐ Extract submission data properly
    const submission = user.record?.submissionData || {};
    console.log("🚀 ~ SharePass ~ user:", user)


    const Name = submission["Name"] || user.name;
    const startDate = submission["Start Date"] || user.startDate;
    const endDate = submission["End Date"] || user.endDate;
    const startTime = submission["Start Time"] || user.startTime;
    const endTime = submission["End Time"] || user.endTime;
    const address = submission["Address"] || submission["address"] || user.address;
    const count = user.seats;
    const status = user.status;
    const eventName = card.name;
    // Background style
    const backgroundStyle: React.CSSProperties = card.backgroundImg
        ? {
            backgroundImage: `url('${encodeURI(card.backgroundImg)}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
        }
        : {
            backgroundColor: card.bgColorCode?.startsWith("#")
                ? card.bgColorCode
                : `#${card.bgColorCode || "E6F3FF"}`,
        };

    const textColor = card.textColorCode?.startsWith("#")
        ? card.textColorCode
        : `#${card.textColorCode || "000000"}`;

    return (
        <>
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 absolute z-50 w-screen h-screen top-0 left-0">
                <div
                    className="w-full max-w-md min-h-[667px] p-6 rounded-3xl shadow-2xl flex flex-col items-center relative overflow-hidden"
                    style={backgroundStyle}
                >
                    {/* Profile Photo */}
                    <div className="w-32 h-32 rounded-full overflow-hidden shadow-xl border-4 border-white mt-4 bg-white">
                        {user.photo ? (
                            <img
                                src={user.photo}
                                alt={`${user.name}'s profile`}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex justify-center items-center text-gray-400">
                                <PersonIcon sx={{ fontSize: 60 }} />
                            </div>
                        )}

                    </div>
                    {/* Name */}
                    <h2
                        className="mt-4 text-2xl font-bold text-center tracking-wide"
                        style={{ color: textColor }}
                    >
                        {eventName}
                    </h2>

             
                    <div className="relative bg-white p-1 rounded-2xl shadow-md mt-6 w-fit">
                        {/* QR Code */}
                        <QRCodeSVG
                            value={user.uniquePassCode}
                            size={150}
                            level="H"          // REQUIRED for logo overlay
                            includeMargin={true}
                        />

                        {/* Center Logo Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <img
                                src={logo}
                                alt="logo"
                                className="w-8 h-8 rounded-full object-contain bg-white p-1"
                            />
                        </div>
                    </div>


                    {/* Pass ID */}
                    <div className="bg-black text-white px-6 py-2 rounded-lg mt-6 text-sm font-bold shadow-md"
                    // style={{ color: textColor }}
                    >
                        Pass ID: {user.uniquePassCode}
                    </div>
                    {count > 0 && count != null && (
                        <div className="flex items-center gap-2 mt-4">
                            <span className="text-gray-600" style={{ color: textColor }}>Approved Count:</span>
                            <span className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-lg text-sm font-semibold">

                                {count}
                            </span>
                        </div>
                    )}

                    {/* ⭐ DISPLAY DETAILS */}
                    <div className="mt-4 text-sm text-white space-y-1 font-semibold text-center">
                        <div className="flex justify-between gap-4"
                            style={{ color: textColor }}>

                            <p>Start Date: {String(startDate).slice(0, 10)}</p>
                            <p>End Date: {String(endDate).slice(0, 10)}</p>
                        </div>
                        <div className="flex justify-between gap-4"
                            style={{ color: textColor }}>
                            {
                                startTime && (
                                    <p>Start Time: {startTime}</p>
                                )
                            }
                            {endTime && (
                                <p>End Time: {endTime}</p>
                            )}
                        </div>
                        {/* <p style={{ color: textColor }}>Address: {Array.isArray(address) ? address.join(", ") : address}</p> */}
                        {address &&
                            <p style={{ color: textColor }}>
                                Address: {formatAddress(address)}
                            </p>
                        }


                    </div>


                    {/* Footer */}
                    <p
                        className="mt-6 text-xs opacity-80 text-center"
                        style={{ color: textColor }}
                    >
                        Please show this pass at the entrance
                    </p>
                </div>
            </div>
        </>
    );
}

export default SharePass;
