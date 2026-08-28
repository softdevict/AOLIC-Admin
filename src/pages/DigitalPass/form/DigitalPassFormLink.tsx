import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { eventPass_format, eventPass_applyPass, digital_pass } from "../../../api/config";
import logo from "../../../assets/img/AOL LOGO BANGALORE ASHRAM BLACK.png"
import { Check, Upload, X } from 'lucide-react';
import axios from 'axios';

interface Field {
    _id?: string;
    label: string;
    type: 'text' | 'file' | 'date' | 'time';
    required: boolean;
    placeholder?: string;
}

interface Event {
    _id: string;
    name: string;
    startDate: string;
    endDate: string;
}

interface FormData {
    _id?: string;
    event: Event;
    title: string;
    description: string;
    fields: Field[];
    mandatoryFields: Field[];
    fieldsCount: number;
    mandatoryFieldsCount: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface TimeSlot {
    start: string;
    end: string;
}

interface Location {
    _id: string;
    name: string;
}

function DigitalPassFormLink() {
    const [useToday, setUseToday] = useState(false);
    const { formId } = useParams<{ formId: string }>();
    const [formData, setFormData] = useState<FormData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [formValues, setFormValues] = useState<{ [key: string]: string | File | null }>({});
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
    const [data, setData] = useState<any>(null);
    // console.log("🚀 ~ DigitalPassFormLink ~ data:", data)
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [selectedSlotIndex, setSelectedSlotIndex] = useState(-1);
    const [locations, setLocations] = useState<Location[]>([]);
    const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
    const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

    useEffect(() => {
        if (!formData) return;

        const today = new Date().toISOString().split("T")[0];
        const eventStartDate = new Date().toISOString().split("T")[0];
        // const eventStartDate = formData.event.startDate.split("T")[0];
        const eventEndDate = formData.event.endDate.split("T")[0];

        if (useToday) {
            setFormValues(prev => ({
                ...prev,
                "Start Date": today,
                "End Date": today
            }));
            validateDates(today, today);
        } else {
            setFormValues(prev => ({
                ...prev,
                "Start Date": eventStartDate,
                "End Date": eventEndDate
            }));
            validateDates(eventStartDate, eventEndDate);
        }
    }, [useToday, formData]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${digital_pass}/ApplayFormTemplate`);
                console.log("GET Response:====", res.data);
                if (res.data.success) {
                    setData(res.data.data); // save response
                }
            } catch (err) {
                console.error("GET Error:", err);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        fetchFormTemplate();
    }, [formId]);

    useEffect(() => {
        const fetchTimeSlots = async () => {
            if (!formData?.event?._id) return;
            try {
                const res = await axios.get(`${digital_pass}/fullDetails/times/${formData.event._id}`);
                if (res.data.success) {
                    setTimeSlots(res.data.timeSlots);
                }
            } catch (err) {
                console.error("Error fetching time slots:", err);
            }
        };
        fetchTimeSlots();
    }, [formData?.event?._id]);

    useEffect(() => {
        const fetchLocations = async () => {
            if (!formData?.event?._id) return;
            try {
                const res = await axios.get(`${digital_pass}/fullDetails/locations/${formData.event._id}`);
                if (res.data.success) {
                    const locationNames = res.data.locationNames || [];
                    const processedLocations = locationNames.map((name: string, index: number) => ({
                        _id: `loc_${index}`,
                        name
                    }));
                    setLocations(processedLocations);
                }
            } catch (err) {
                console.error("Error fetching locations:", err);
            }
        };
        fetchLocations();
    }, [formData?.event?._id]);

    // Make address field not required if locations available
    useEffect(() => {
        if (locations.length > 0 && formData) {
            const isAddressField = (label: string) => label.toLowerCase() === 'address';
            let updated = false;

            // Update fields
            const updatedFields = formData.fields.map(field => {
                if (isAddressField(field.label) && field.required) {
                    updated = true;
                    return { ...field, required: false };
                }
                return field;
            });

            // Update mandatoryFields
            const updatedMandatoryFields = formData.mandatoryFields.map(field => {
                if (isAddressField(field.label) && field.required) {
                    updated = true;
                    return { ...field, required: false };
                }
                return field;
            });

            if (updated) {
                setFormData(prev => ({
                    ...prev!,
                    fields: updatedFields,
                    mandatoryFields: updatedMandatoryFields
                }));
            }
        }
    }, [locations, formData]);

    const validateDates = (startDate: string, endDate: string) => {
        const errors: { [key: string]: string } = {};
        const eventStartDate = formData!.event.startDate.split('T')[0];
        const eventEndDate = formData!.event.endDate.split('T')[0];
        if (startDate < eventStartDate) {
            errors['Start Date'] = 'Start date cannot be before event start date';
        }
        if (endDate > eventEndDate) {
            errors['End Date'] = 'End date cannot be after event end date';
        }
        if (startDate > endDate) {
            errors['Start Date'] = 'Start date cannot be after end date';
            errors['End Date'] = 'End date cannot be before start date';
        }
        setFieldErrors(errors);
    };

    const fetchFormTemplate = async () => {
        if (!formId) {
            setError('No form ID provided');
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`${eventPass_format}/formDetails/${formId}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch form: ${response.statusText}`);
            }
            const data = await response.json();
            if (data.success) {
                // Process fields to make 'vehicle', 'count', 'Start Time', and 'End Time' optional
                const processedMandatoryFields = data.form.mandatoryFields?.map((field: Field) => {
                    if (field.label.toLowerCase() === 'vehicle' || field.label.toLowerCase() === 'count' || field.label.toLowerCase() === 'start time' || field.label.toLowerCase() === 'end time') {
                        return { ...field, required: false };
                    }
                    return field;
                }) || [];
                const processedFields = data.form.fields?.map((field: Field) => {
                    if (field.label.toLowerCase() === 'vehicle' || field.label.toLowerCase() === 'count' || field.label.toLowerCase() === 'start time' || field.label.toLowerCase() === 'end time') {
                        return { ...field, required: false };
                    }
                    return field;
                }) || [];
                const processedFormData = {
                    ...data.form,
                    mandatoryFields: processedMandatoryFields,
                    fields: processedFields
                };
                setFormData(processedFormData);
                const allFields = [...processedMandatoryFields, ...processedFields];
                const initialValues: { [key: string]: string | File | null } = {};
                allFields.forEach((field: Field) => {
                    if (field.label.toLowerCase() === 'count') {
                        initialValues[field.label] = "1"; // default value
                    } else {
                        initialValues[field.label] = field.type === 'file' ? null : '';
                    }
                });

                setFormValues(initialValues);
            } else {
                throw new Error(data.message || 'Failed to fetch form');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
            console.error('Fetch error:', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (label: string, value: string | File | null) => {
        setFormValues((prev) => ({ ...prev, [label]: value }));
        // Validate dates
        if (label === 'Start Date' || label === 'End Date') {
            const startDate = label === 'Start Date' ? (value as string) : (formValues['Start Date'] as string || '');
            const endDate = label === 'End Date' ? (value as string) : (formValues['End Date'] as string || '');
            validateDates(startDate, endDate);
        }
        // Handle photo preview for profile photo field
        if (value instanceof File && (label.toLowerCase().includes('photo') || label.toLowerCase().includes('image'))) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(value);
        }
    };

    const handleTimeSlotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const index = parseInt(e.target.value);
        setSelectedSlotIndex(index);
        setError(null); // Clear any previous errors
        if (index >= 0 && timeSlots[index]) {
            const slot = timeSlots[index];
            // Set both times in a single state update to ensure both are applied
            setFormValues(prev => ({
                ...prev,
                'Start Time': slot.start,
                'End Time': slot.end
            }));
        } else {
            // Clear times if no slot selected
            setFormValues(prev => ({
                ...prev,
                'Start Time': '',
                'End Time': ''
            }));
        }
    };

    const handleLocationToggle = (locationName: string, checked: boolean) => {
        setSelectedLocations(prev =>
            checked ? [...prev, locationName] : prev.filter(l => l !== locationName)
        );
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData || !formId) {
            setError('Form data or ID missing');
            setSubmitStatus('error');
            return;
        }
        // Check field errors
        if (Object.keys(fieldErrors).length > 0) {
            setError('Please fix the date errors before submitting');
            setSubmitStatus('error');
            return;
        }
        const allFields = [...formData.mandatoryFields, ...formData.fields];
        // Check for required photo
        const photoField = allFields.find((field) => field.required && field.type === 'file' && isPhotoField(field.label));
        if (photoField && !formValues[photoField.label]) {
            setToast({ message: 'Please upload a photo', type: 'error' });
            return;
        }
        const hasErrors = allFields.some((field) => field.required && !formValues[field.label]);
        if (hasErrors) {
            setError('Please fill all required fields');
            setSubmitStatus('error');
            return;
        }
        // Check time slot selection if slots available
        if (timeSlots.length > 0 && selectedSlotIndex === -1) {
            setError('Please select a time slot');
            setSubmitStatus('error');
            return;
        }
        // Check location
        if (locations.length > 0 && selectedLocations.length === 0) {
            setError('Please select at least one location');
            setSubmitStatus('error');
            return;
        }
        setSubmitStatus('submitting');
        setError(null);
        try {
            const submitData = new FormData();
            allFields.forEach((field) => {
                const value = formValues[field.label];
                if (value !== null && value !== undefined && value !== '') {
                    if (field.type === 'file' && value instanceof File) {
                        submitData.append(field.label, value);
                    } else {
                        submitData.append(field.label, value as string);
                    }
                }
            });
            // Append selected locations as multiple 'address' values to match field label
            selectedLocations.forEach(loc => submitData.append('address', loc));
            submitData.append('eventId', formData.event._id);
            submitData.append('formTemplateId', formId);
            const response = await fetch(`${eventPass_applyPass}/${formId}`, {
                method: 'POST',
                body: submitData,
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to submit form: ${response.statusText}`);
            }
            const result = await response.json();
            if (result.success) {
                setSubmitStatus('success');
                // Reset form and return to idle after success
                setTimeout(() => {
                    const allFields = [...formData.mandatoryFields, ...formData.fields];
                    const resetValues: { [key: string]: string | File | null } = {};
                    allFields.forEach((field: Field) => {
                        if (field.label.toLowerCase() === 'count') {
                            resetValues[field.label] = "1";
                        } else {
                            resetValues[field.label] = field.type === 'file' ? null : '';
                        }
                    });
                    setFormValues(resetValues);
                    setPhotoPreview(null);
                    setSelectedSlotIndex(-1);
                    setSelectedLocations([]);
                    setFieldErrors({});
                    setSubmitStatus('idle');
                }, 5000);
            } else {
                throw new Error(result.message || 'Submission failed');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Submission error';
            setSubmitStatus('error');
            setError(errorMessage);
            console.error('Submit error:', errorMessage);
        }
    };

    // Toast auto-dismiss
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const isPhotoField = (label: string) => {
        return label.toLowerCase().includes('photo') || label.toLowerCase().includes('image') || label.toLowerCase().includes('picture');
    };

    const isCountField = (label: string) => {
        return label.toLowerCase() === 'count';
    };

    // Full Screen Success Component
    const FullScreenSuccess = () => (
        <div className="
        fixed inset-0
        bg-gradient-to-br from-yellow-100 via-orange-100 to-rose-100
        flex flex-col items-center justify-center
        text-center p-6 z-[999]
        animate-in fade-in duration-700
    ">
            {/* Card Wrapper */}
            <div className="
            bg-white/40 backdrop-blur-xl
            p-10 rounded-3xl shadow-2xl
            max-w-lg w-full
            border border-white/30
            animate-in fade-in zoom-in duration-700
        ">
                {/* Image */}
                {data?.img && (
                    <div className="flex justify-center mb-6">
                        <img
                            src={data.img}
                            alt="Template"
                            className="
                            w-40 h-auto rounded-2xl shadow-lg
                            ring-4 ring-white/50 hover:scale-105
                            transition-transform duration-300
                        "
                        />
                    </div>
                )}
                {/* Title */}
                <h1 className="
                text-4xl md:text-5xl font-extrabold
                text-gray-900 mb-4 tracking-wide
                animate-in fade-in duration-700 delay-200
            ">
                    {data?.title}
                </h1>
                {/* Body */}
                <p className="
                text-lg md:text-xl text-gray-700
                leading-relaxed max-w-md mx-auto
                animate-in fade-in duration-700 delay-300
            ">
                    {data?.body}
                </p>
                {/* Sub Body */}
                {data?.subBody && (
                    <p className="
                    text-lg text-gray-600 mt-4 font-medium
                    animate-in fade-in duration-700 delay-500
                ">
                        {data.subBody}
                    </p>
                )}
                {/* Divider */}
                <div className="my-6 border-t border-gray-300/40 w-32 mx-auto" />
                {/* Footer Line */}
                <div className="
                text-2xl md:text-3xl font-semibold
                text-orange-700 animate-in fade-in duration-700 delay-600
            ">
                    {data?.endLine}
                </div>
                <br />
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="fixed inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center z-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-orange-800 font-medium">Loading sacred form...</p>
                </div>
            </div>
        );
    }

    if (error && !formData) {
        return (
            <div className="fixed inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl p-8 max-w-md mx-4 border-2 border-red-200">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <X className="w-8 h-8 text-red-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Error</h3>
                        <p className="text-gray-600">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!formData) {
        return (
            <div className="fixed inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center z-50">
                <div className="text-center">
                    <p className="text-gray-600">Form not found</p>
                </div>
            </div>
        );
    }

    // Show full screen success when submission is successful
    if (submitStatus === 'success') {
        return <FullScreenSuccess />;
    }

    const allFields = [...formData.mandatoryFields, ...formData.fields];
    const eventStartDate = formData.event.startDate.split('T')[0];
    const eventEndDate = formData.event.endDate.split('T')[0];
    const currentStartDate = formValues['Start Date'] as string || eventStartDate;
    const isAddressField = (label: string) => label.toLowerCase() === 'address';

    return (
        <div className="fixed inset-0 top-0 left-0 w-screen h-screen overflow-y-auto bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 z-50">
            {/* Header with Logo */}
            <div className="bg-white shadow-md border-b-4 border-orange-400">
                <img src={logo} className="h-20 md:h-24 mx-auto py-4" alt="Ashram Logo" />
            </div>
            {/* Main Content */}
            <div className="max-w-2xl mx-auto px-4 py-8 pb-16">
                {/* Event Header */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border-t-4 border-orange-500">
                    <div className="text-center">
                        <div className="inline-block bg-orange-100 text-orange-800 px-4 py-1 rounded-full text-sm font-medium mb-4">
                            Digital Pass Application
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
                            {formData.event.name}
                        </h1>
                        {formData.description && (
                            <p className="text-gray-600 leading-relaxed max-w-xl mx-auto">
                                {formData.description}
                            </p>
                        )}
                        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
                            <span className="px-3 py-1 bg-orange-50 rounded-full">
                                {new Date(formData.event.startDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </span>
                            <span>to</span>
                            <span className="px-3 py-1 bg-orange-50 rounded-full">
                                {new Date(formData.event.endDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </span>
                        </div>
                    </div>
                </div>
                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-orange-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {allFields.map((field, index) => (
                            <React.Fragment key={field._id || field.label}>
                                {/* Use Today Checkbox before Start Date */}
                                {field.label === 'Start Date' && (
                                    <div className="space-y-2 mb-6">
                                        <div className="flex items-center gap-2 bg-orange-50 p-3 rounded-xl shadow">
                                            <input
                                                type="checkbox"
                                                checked={useToday}
                                                onChange={(e) => setUseToday(e.target.checked)}
                                                className="w-5 h-5 text-orange-600"
                                            />
                                            <span className="text-gray-700 font-medium">
                                                Use today's date for Start & End Date
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* ======================= */}
                                {/* Skip rendering Address field if locations dropdown is available */}
                                {locations.length > 0 && isAddressField(field.label) ? null : (
                                    // Conditionally render Start Time and End Time only if timeSlots exist
                                    ((field.label !== 'Start Time' && field.label !== 'End Time') || timeSlots.length > 0) && (
                                        <div className="space-y-2">
                                            {/* <label className="block font-semibold text-gray-700 text-base">
                                                {field.label.toLowerCase() === "count"
                                                    ? "Total Count (including you)"
                                                    : field.label
                                                }
                                                {field.required && <span className="text-red-500 ml-1">*</span>}
                                            </label> */}
                                            <label className="block font-semibold text-gray-700 text-base">
                                                {field.label.toLowerCase().includes("phone")
                                                    ? <>       Phone Number{" "}
        <span className="text-sm text-gray-500 font-normal">
            (For Indian numbers, enter only the 10-digit mobile number. Do not include 0 or +91.)
        </span>
</>
                                                    : field.label.toLowerCase() === "count"
                                                        ? "Total Count (including you)"
                                                        : field.label
                                                }
                                                {field.required && <span className="t   ext-red-500 ml-1">*</span>}
                                            </label>



                                            {field.type === "file" ? (
                                                isPhotoField(field.label) ? (
                                                    // Circular photo upload for profile photos
                                                    <div className="flex flex-col items-center">
                                                        <div className="relative">
                                                            <div className="w-32 h-32 rounded-full border-4 border-orange-200 overflow-hidden bg-orange-50 flex items-center justify-center shadow-lg">
                                                                {photoPreview ? (
                                                                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <Upload className="w-12 h-12 text-orange-300" />
                                                                )}
                                                            </div>
                                                            <label className="absolute bottom-0 right-0 w-10 h-10 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-colors">
                                                                <Upload className="w-5 h-5 text-white" />
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    required={field.required}
                                                                    onChange={(e) => {
                                                                        const file = e.target.files?.[0] || null;
                                                                        handleInputChange(field.label, file);
                                                                    }}
                                                                    className="hidden"
                                                                />
                                                            </label>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-3 text-center">
                                                            Click the camera icon to upload
                                                        </p>
                                                    </div>
                                                ) : (
                                                    // Regular file upload
                                                    <div className="relative">
                                                        <input
                                                            type="file"
                                                            required={field.required}
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0] || null;
                                                                handleInputChange(field.label, file);
                                                            }}
                                                            className="w-full border-2 border-gray-300 rounded-xl p-3 bg-white focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
                                                        />
                                                    </div>
                                                )
                                            ) : (
                                                (() => {
                                                    let inputType = field.type === 'date' || field.type === 'time' ? field.type : 'text';
                                                    if (field.label.toLowerCase().includes('email')) {
                                                        inputType = 'email';
                                                    }
                                                    // if (field.label.toLowerCase().includes('phone')) {
                                                    //     inputType = 'tel';
                                                    // }
                                                    if (field.label.toLowerCase().includes('phone')) {
                                                        inputType = 'number';
                                                    }
                                                    if (isCountField(field.label)) {
                                                        inputType = 'number';
                                                    }
                                                    const isDateField = field.label === 'Start Date' || field.label === 'End Date';
                                                    const isTimeField = field.label === 'Start Time' || field.label === 'End Time';
                                                    const isReadOnly = isTimeField;
                                                    const startDateMin = eventStartDate;
                                                    const endDateMax = eventEndDate;
                                                    const endDateMin = currentStartDate;
                                                    const countMin = isCountField(field.label) ? 1 : undefined;
                                                    return (
                                                        <input
                                                            type={inputType}
                                                            min={isDateField && field.label === 'Start Date' ? startDateMin : (field.label === 'End Date' ? endDateMin : countMin)}
                                                            max={isDateField && field.label === 'End Date' ? endDateMax : undefined}
                                                            step={isCountField(field.label) ? 1 : undefined}
                                                            placeholder={
                                                                isReadOnly
                                                                    ? undefined
                                                                    : (
                                                                        field.label.toLowerCase() === "count"
                                                                            ? "Enter Total Count (including you)"
                                                                            : (field.placeholder || `Enter ${field.label.toLowerCase()}`)
                                                                    )
                                                            }


                                                            value={(formValues[field.label] as string) || ""}
                                                            required={field.required}
                                                            disabled={isReadOnly}
                                                            onChange={(e) => !isReadOnly && handleInputChange(field.label, e.target.value)}
                                                            className={`w-full border-2 border-gray-300 rounded-xl p-3 bg-white focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all text-gray-700 placeholder-gray-400 ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''} ${fieldErrors[field.label] ? 'border-red-500' : ''}`}
                                                        />
                                                    );
                                                })()
                                            )}
                                            {fieldErrors[field.label] && (
                                                <p className="text-red-500 text-sm mt-1">{fieldErrors[field.label]}</p>
                                            )}
                                        </div>
                                    )
                                )}

                                {/* =============================== */}
                                {/* Time Slot Selector after End Date */}
                                {field.label === 'End Date' && timeSlots.length > 0 && (
                                    <div className="space-y-2">
                                        <label className="block font-semibold text-gray-700 text-base">
                                            Select Time Slot
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <select
                                            value={selectedSlotIndex}
                                            onChange={handleTimeSlotChange}
                                            className="w-full border-2 border-gray-300 rounded-xl p-3 bg-white focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all text-gray-700"
                                        >
                                            <option value={-1}>Choose a time slot</option>
                                            {timeSlots.map((slot, index) => (
                                                <option key={index} value={index}>
                                                    Slot {index + 1}: {slot.start} - {slot.end}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                        {/* Location Selector - Multi Select Checkboxes */}
                        {locations.length > 0 && (
                            <div className="space-y-2">
                                <label className="block font-semibold text-gray-700 text-base">
                                    Select Locations
                                    <span className="text-red-500 ml-1">*</span>
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                                    {locations.map((loc) => (
                                        <label key={loc._id} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-white rounded">
                                            <input
                                                type="checkbox"
                                                checked={selectedLocations.includes(loc.name)}
                                                onChange={(e) => handleLocationToggle(loc.name, e.target.checked)}
                                                className="rounded border-gray-300 text-orange-600 focus:ring-orange-400 h-4 w-4"
                                            />
                                            <span className="text-sm text-gray-700">{loc.name}</span>
                                        </label>
                                    ))}
                                </div>
                                {selectedLocations.length > 0 && (
                                    <p className="text-sm text-gray-600 mt-1">
                                        Selected: {selectedLocations.join(', ')}
                                    </p>
                                )}
                            </div>
                        )}
                        {/* Error Message */}
                        {submitStatus === 'error' && error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                                <div className="flex items-center">
                                    <X className="w-5 h-5 text-red-500 mr-2" />
                                    <p className="text-red-700 font-medium">{error}</p>
                                </div>
                            </div>
                        )}
                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={submitStatus === "submitting" || Object.keys(fieldErrors).length > 0}
                            className={`w-full py-4 text-white text-center font-semibold rounded-xl transition-all shadow-lg text-lg
                                ${submitStatus === "submitting" || Object.keys(fieldErrors).length > 0
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transform hover:scale-[1.02] active:scale-[0.98]"
                                }`}
                        >
                            {submitStatus === "submitting" ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Submitting...
                                </span>
                            ) : (
                                "Submit Application"
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer Message */}
                <div className="text-center mt-8 text-gray-500 text-sm">
                    <p>🙏 Namaste • All information will be kept confidential</p>
                </div>
            </div>
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-4 right-4 z-[1000] p-4 rounded-lg shadow-lg transform transition-all duration-300 ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                    {toast.message}
                </div>
            )}
        </div>
    );
}

export default DigitalPassFormLink;