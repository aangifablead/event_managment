import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addEvent, updateEvent, deleteEvent } from '../features/eventSlice';
import useApi from '../hooks/useApi';

const AddEventModal = ({ isOpen, onClose, editingEvent }) => {
    const dispatch = useDispatch();
    const { execute } = useApi();
    const today = new Date().toISOString().split('T')[0];

    const initialFormState = {
        title: '', category: 'Music', price: '', capacity: '',
        description: '', coverImage: null, gallery: [],
        venue: '', city: '', state: '', time: '', date: ''
    };

    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});

    // Helper: Convert File to Base64 String
    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = () => resolve(fileReader.result);
            fileReader.onerror = (error) => reject(error);
        });
    };

    useEffect(() => {
        if (editingEvent && isOpen) {
            setFormData({
                ...initialFormState,
                ...editingEvent,
                title: editingEvent.title || editingEvent.name,
                venue: editingEvent.venue || editingEvent.venue,
                gallery: editingEvent.gallery || [],
                coverImage: editingEvent.image || editingEvent.coverImage
            });
        } else if (!editingEvent && isOpen) {
            setFormData(initialFormState);
        }
        setErrors({});
    }, [editingEvent, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: false }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (name === 'coverImage') {
            setFormData(prev => ({ ...prev, coverImage: files[0] }));
            if (errors.coverImage) setErrors(prev => ({ ...prev, coverImage: false }));
        } else if (name === 'gallery') {
            setFormData(prev => ({ ...prev, gallery: Array.from(files) }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Validation
        const requiredFields = ['title', 'price', 'capacity', 'description', 'time', 'date', 'venue', 'city', 'state'];
        if (!editingEvent) requiredFields.push('coverImage');

        const newErrors = {};
        requiredFields.forEach(field => {
            if (!formData[field]) newErrors[field] = true;
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            // 2. Process Media: Convert new Files to Base64 strings
            let mainImage = formData.coverImage;
            if (formData.coverImage instanceof File) {
                mainImage = await convertToBase64(formData.coverImage);
            }

            const galleryImages = await Promise.all(
                formData.gallery.map(async (item) => {
                    if (item instanceof File) return await convertToBase64(item);
                    return item; // Keep existing URL strings
                })
            );

            // 3. Construct JSON Payload (Mapping to Backend Names)
            const payload = {
                name: formData.title,
                venue: formData.venue,
                category: formData.category,
                price: Number(formData.price),
                capacity: Number(formData.capacity),
                description: formData.description,
                time: formData.time,
                date: formData.date,
                city: formData.city,
                state: formData.state,
                image: mainImage,           // Field: image (string)
                gallery: galleryImages      // Field: gallery (array of strings)
            };

            // 4. API Request
            if (editingEvent) {
                const id = editingEvent.id || editingEvent._id;
                const { data } = await execute(`/events/${id}`, 'PUT', payload);
                if (data) {
                    dispatch(updateEvent(data));
                    onClose();
                }
            } else {
                const { data } = await execute('/events', 'POST', payload);
                if (data) {
                    dispatch(addEvent(data));
                    onClose();
                }
            }
        } catch (err) {
            console.error("Error submitting form:", err);
            alert("Failed to process images. Ensure files aren't too large.");
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this event?")) {
            const id = editingEvent.id || editingEvent._id;
            const { error } = await execute(`/events/${id}`, 'DELETE');
            if (!error) {
                dispatch(deleteEvent(id));
                onClose();
            }
        }
    };

    const ErrorMsg = () => <span className="text-[10px] text-rose-500 font-bold ml-2 italic">Required</span>;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-start">
                    <div>
                        <h2 className="text-[22px] font-bold text-slate-900">
                            {editingEvent ? 'Edit Event' : 'Create New Event'}
                        </h2>
                        <p className="text-[13px] text-slate-500 mt-1">Manage your event details and media.</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors text-2xl px-2">✕</button>
                </div>

                <form className="p-8 overflow-y-auto space-y-7 no-scrollbar" onSubmit={handleSubmit}>
                    {/* Media Upload Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                Main Cover Image {errors.coverImage && <ErrorMsg />}
                            </label>
                            <div className={`border-2 border-dashed rounded-xl p-4 h-32 relative flex flex-col items-center justify-center text-center transition-colors ${errors.coverImage ? 'border-rose-500 bg-rose-50' : 'border-slate-200 bg-slate-50'}`}>
                                <span className="text-xl mb-1">{formData.coverImage ? '✅' : '🖼️'}</span>
                                <p className="text-[10px] font-bold text-slate-600 truncate w-full px-2">
                                    {formData.coverImage instanceof File ? formData.coverImage.name : (formData.coverImage ? 'Image Loaded' : 'Upload Thumbnail')}
                                </p>
                                <input name="coverImage" type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Event Gallery (Optional)</label>
                            <div className="border-2 border-dashed border-slate-200 bg-slate-50 rounded-xl p-4 h-32 relative flex flex-col items-center justify-center text-center">
                                <span className="text-xl mb-1">📸</span>
                                <p className="text-[10px] font-bold text-slate-600">
                                    {formData.gallery.length > 0 ? `${formData.gallery.length} Photos Added` : 'Add Photos'}
                                </p>
                                <input name="gallery" type="file" multiple onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                            </div>
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Event Title {errors.title && <ErrorMsg />}</label>
                            <input name="title" value={formData.title} onChange={handleChange} type="text" placeholder="e.g. music show" className={`w-full px-4 py-3 border rounded-xl text-sm outline-none ${errors.title ? 'border-rose-500' : 'border-slate-200 focus:border-[#FF3B8B]'}`} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
                            <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white outline-none">
                                <option>Music</option>
                                <option>Fashion</option>
                                <option>Tech</option>
                                <option>Business</option>
                                <option>Entertainment</option>
                            </select>
                        </div>
                    </div>

                    {/* Location Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Venue {errors.venue && <ErrorMsg />}</label>
                            <input name="venue" value={formData.venue} onChange={handleChange} type="text" placeholder="Grand Arena" className={`w-full px-4 py-3 border rounded-xl text-sm outline-none ${errors.venue ? 'border-rose-500' : 'border-slate-200 focus:border-[#FF3B8B]'}`} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">City {errors.city && <ErrorMsg />}</label>
                            <input name="city" value={formData.city} onChange={handleChange} type="text" className={`w-full px-4 py-3 border rounded-xl text-sm outline-none ${errors.city ? 'border-rose-500' : 'border-slate-200 focus:border-[#FF3B8B]'}`} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">State {errors.state && <ErrorMsg />}</label>
                            <input name="state" value={formData.state} onChange={handleChange} type="text" className={`w-full px-4 py-3 border rounded-xl text-sm outline-none ${errors.state ? 'border-rose-500' : 'border-slate-200 focus:border-[#FF3B8B]'}`} />
                        </div>
                    </div>

                    {/* Time and Price */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date {errors.date && <ErrorMsg />}</label>
                            <input name="date" value={formData.date} onChange={handleChange} type="date" min={today} className="w-full px-3 py-3 border border-slate-200 rounded-xl text-[13px] outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Time {errors.time && <ErrorMsg />}</label>
                            <input name="time" value={formData.time} onChange={handleChange} type="time" className="w-full px-3 py-3 border border-slate-200 rounded-xl text-[13px] outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Price (₹) {errors.price && <ErrorMsg />}</label>
                            <input name="price" value={formData.price} onChange={handleChange} type="number" className="w-full px-3 py-3 border border-slate-200 rounded-xl text-[13px] outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Capacity {errors.capacity && <ErrorMsg />}</label>
                            <input name="capacity" value={formData.capacity} onChange={handleChange} type="number" className="w-full px-3 py-3 border border-slate-200 rounded-xl text-[13px] outline-none" />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">About {errors.description && <ErrorMsg />}</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className={`w-full px-4 py-3 border rounded-xl text-sm outline-none resize-none ${errors.description ? 'border-rose-500' : 'border-slate-200 focus:border-[#FF3B8B]'}`} />
                    </div>
                </form>

                {/* Actions */}
                <div className="px-8 py-6 border-t border-slate-100 flex justify-between items-center bg-white rounded-b-2xl">
                    <div className="flex-1">
                        {editingEvent && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="text-sm font-bold text-rose-500 hover:text-rose-700 transition-colors"
                            >
                                Delete Event
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-6">
                        <button onClick={onClose} className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">Discard</button>
                        <button onClick={handleSubmit} className="px-10 py-3.5 text-[13px] font-bold text-white bg-[#FF3B8B] hover:bg-[#E12D76] rounded-xl shadow-lg transition-all active:scale-95">
                            {editingEvent ? 'Save Changes' : 'Create Event'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddEventModal;