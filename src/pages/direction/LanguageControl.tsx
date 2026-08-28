import React, { useEffect, useState } from 'react';
import { audio_language } from '../../api/config';
import axios from 'axios';
import {
    CircularProgress,
    Switch,
    Fade,
    Slide,
    Alert,
    Snackbar
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RefreshIcon from '@mui/icons-material/Refresh';
import LanguageIcon from '@mui/icons-material/Language';
import SettingsIcon from '@mui/icons-material/Settings';
import { Link } from 'react-router-dom';

interface Language {
    _id: string;
    name: string;
    available: boolean;
}

function LanguageControl() {
    const [languages, setLanguages] = useState<Language[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const fetchLanguages = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axios.get(audio_language);
            setLanguages(data.data);
        } catch (error) {
            console.error('Failed to fetch languages', error);
            setError('Failed to load languages. Please try again.');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchLanguages();
    }, []);

    const handleToggle = async (id: string, name: string) => {
        setUpdating(id);
        setError(null);
        try {
            const { data } = await axios.patch(`${audio_language}/${id}`);
            const updatedLanguage = data.data;

            setLanguages(prev =>
                prev.map(lang =>
                    lang._id === id ? { ...lang, available: updatedLanguage.available } : lang
                )
            );

            setSuccess(`Language ${updatedLanguage.available ? 'enabled' : 'disabled'} successfully`);
        } catch (error) {
            console.error('Failed to toggle language availability', error);
            setError('Failed to update language. Please try again.');
        }
        setUpdating(null);
    };

    const handleCloseSnackbar = () => {
        setError(null);
        setSuccess(null);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-64 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <CircularProgress
                    size={48}
                    className="text-blue-500 mb-4"
                />
                <p className="text-gray-600 font-medium">Loading languages...</p>
            </div>
        );
    }
    const adminType = localStorage.getItem("adminType");
    return (

        <>
            {adminType === "super admin" && (
                <ol className="flex text-gray-500 font-semibold dark:text-white-dark space-x-2">
                    <li>
                        <Link to="/">
                            <button className="hover:text-gray-500/70 dark:hover:text-white-dark/70">Home</button>
                        </Link>
                    </li>
                    <li>/</li>
                    <li>
                        <Link to="/direction">
                            <button className="hover:text-gray-500/70 dark:hover:text-white-dark/70"> Maps and Tours</button>
                        </Link>
                    </li>
                    <li>/</li>
                    <li>
                        <button className="text-black dark:text-white-light hover:text-black/70 dark:hover:text-white-light/70">

                            Language Settings
                        </button>
                    </li>
                </ol>
            )}
            <div className="max-w-2xl mx-auto p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <LanguageIcon className="text-blue-600 text-2xl" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Language Settings</h1>
                            <p className="text-gray-600">Manage available audio languages</p>
                        </div>
                    </div>
                    <button
                        onClick={fetchLanguages}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                        <RefreshIcon className="text-gray-500" />
                        Refresh
                    </button>
                </div>

                {/* Error Alert */}
                {error && (
                    <Alert
                        severity="error"
                        className="mb-6 rounded-xl"
                        onClose={() => setError(null)}
                    >
                        {error}
                    </Alert>
                )}

                {/* Languages List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                        <SettingsIcon className="text-gray-500" fontSize="small" />
                        <span className="text-sm font-medium text-gray-700">Available Languages</span>
                    </div>

                    {languages.length === 0 ? (
                        <div className="text-center py-12 px-6">
                            <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <LanguageIcon className="text-gray-400 text-3xl" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No languages found</h3>
                            <p className="text-gray-600 max-w-md mx-auto">
                                There are no languages configured in the system yet.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {languages.map((lang, index) => (
                                <Slide
                                    key={lang._id}
                                    in={true}
                                    direction="up"
                                    timeout={(index + 1) * 100}
                                >
                                    <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${lang.available ? 'bg-green-100' : 'bg-gray-100'}`}>
                                                {lang.available ? (
                                                    <CheckCircleIcon className="text-green-600" />
                                                ) : (
                                                    <CancelIcon className="text-gray-500" />
                                                )}
                                            </div>
                                            <span className="font-medium text-gray-900">{lang.name}</span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {updating === lang._id ? (
                                                <CircularProgress size={20} className="text-blue-500" />
                                            ) : (
                                                <>
                                                    <span className={`text-sm font-medium ${lang.available ? 'text-green-600' : 'text-gray-500'}`}>
                                                        {lang.available ? 'Enabled' : 'Disabled'}
                                                    </span>
                                                    <Switch
                                                        checked={lang.available}
                                                        onChange={() => handleToggle(lang._id, lang.name)}
                                                        disabled={updating !== null}
                                                        color="primary"
                                                        sx={{
                                                            '& .MuiSwitch-switchBase.Mui-checked': {
                                                                color: '#10B981',
                                                            },
                                                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                                backgroundColor: '#10B981',
                                                            },
                                                        }}
                                                    />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </Slide>
                            ))}
                        </div>
                    )}
                </div>



            </div>
        </>
    );
}

export default LanguageControl;