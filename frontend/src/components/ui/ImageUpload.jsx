import { useState, useRef, useCallback } from 'react';
import { HiOutlinePhotograph, HiOutlineX, HiCheck } from 'react-icons/hi';
import axios from 'axios';
import ReactCrop from 'react-image-crop';
import { FaUpload } from "react-icons/fa6";
import 'react-image-crop/dist/ReactCrop.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export default function ImageUpload({ value, onChange, label = 'Upload Image' }) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [showCrop, setShowCrop] = useState(false);
    const [imageSrc, setImageSrc] = useState('');
    const [crop, setCrop] = useState({ unit: '%', width: 90, aspect: 1 });
    const [completedCrop, setCompletedCrop] = useState(null);
    const imgRef = useRef(null);
    const fileRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size must be less than 5MB');
            return;
        }

        setError('');
        fileRef.current = file;

        // Read the file as data URL for cropping
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            setImageSrc(reader.result?.toString() || '');
            setShowCrop(true);
        });
        reader.readAsDataURL(file);
    };

    const onImageLoad = useCallback((e) => {
        const { width, height } = e.currentTarget;

        // Calculate square crop size based on the smaller dimension
        const minDimension = Math.min(width, height);
        const cropSize = minDimension * 0.9; // 90% of the smaller dimension

        // Convert to percentage for both width and height
        const widthPercent = (cropSize / width) * 100;
        const heightPercent = (cropSize / height) * 100;

        const newCrop = {
            unit: '%',
            width: widthPercent,
            height: heightPercent,
            x: (100 - widthPercent) / 2,
            y: (100 - heightPercent) / 2,
            aspect: 1
        };

        setCrop(newCrop);
    }, []);

    const getCroppedImage = async () => {
        if (!imgRef.current || !completedCrop) {
            return null;
        }

        const image = imgRef.current;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('No 2d context');
        }

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        // Set canvas size to desired output size (1:1 Instagram square)
        const outputWidth = 1080;
        const outputHeight = 1080; // 1:1 square ratio

        canvas.width = outputWidth;
        canvas.height = outputHeight;

        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(
            image,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            outputWidth,
            outputHeight
        );

        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => {
                    resolve(blob);
                },
                'image/jpeg',
                0.95
            );
        });
    };

    const handleCropComplete = async () => {
        try {
            setUploading(true);
            const croppedBlob = await getCroppedImage();

            if (!croppedBlob) {
                setError('Failed to crop image');
                return;
            }

            const formData = new FormData();
            formData.append('thumbnail', croppedBlob, 'thumbnail.jpg');

            const token = localStorage.getItem('authToken');
            const response = await axios.post(
                `${API_BASE_URL}/api/upload/project-thumbnail`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: token
                    }
                }
            );

            if (response.data.success) {
                onChange(response.data.thumbnail);
                setShowCrop(false);
                setImageSrc('');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleCancelCrop = () => {
        setShowCrop(false);
        setImageSrc('');
        setCrop({ unit: '%', width: 90, aspect: 1 });
        setCompletedCrop(null);
    };

    const handleRemove = () => {
        onChange('');
        setError('');
    };

    if (showCrop) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
                    <div className="p-6">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-light text-gray-700">Crop Image</h3>
                            <button
                                type="button"
                                onClick={handleCancelCrop}
                                disabled={uploading}
                                className="p-2 text-gray-400 hover:text-gray-600 transition"
                            >
                                <HiOutlineX size={20} />
                            </button>
                        </div>

                        {/* Crop Area */}
                        <div className="mb-6">
                            <p className="text-sm text-gray-600 font-light mb-3">
                                Adjust the crop area (Instagram square format 1:1)
                            </p>
                            <div className="flex items-center justify-center bg-gray-50 rounded-lg p-4">
                                <ReactCrop
                                    crop={crop}
                                    onChange={(c) => setCrop(c)}
                                    onComplete={(c) => setCompletedCrop(c)}
                                    aspect={1}
                                    locked={true}
                                    className="max-w-full"
                                >
                                    <img
                                        ref={imgRef}
                                        src={imageSrc}
                                        alt="Crop preview"
                                        onLoad={onImageLoad}
                                        style={{ maxHeight: '60vh', width: 'auto' }}
                                        className="max-w-full h-auto"
                                    />
                                </ReactCrop>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleCancelCrop}
                                disabled={uploading}
                                className="px-6 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition font-light"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleCropComplete}
                                disabled={uploading || !completedCrop}
                                className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-light"
                            >
                                {uploading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <HiCheck size={16} />
                                        Apply & Upload
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <p className="text-xs text-red-500 mt-4 font-light">{error}</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            {value ? (
                <div className="relative group">
                    <img
                        src={value}
                        alt="Upload"
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute top-2 right-2 p-2 bg-white text-red-600 rounded-full shadow-md hover:bg-red-50 transition opacity-0 group-hover:opacity-100"
                    >
                        <HiOutlineX size={16} />
                    </button>
                </div>
            ) : (
                <label className="block w-full h-48 border-2 border-dashed border-gray-200 rounded-lg hover:border-gray-300 transition cursor-pointer">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <HiOutlinePhotograph size={32} className="mb-2" />
                        <p className="text-sm font-light">{label}</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                    </div>
                </label>
            )}
            {error && (
                <p className="text-xs text-red-500 mt-2 font-light">{error}</p>
            )}
        </div>
    );
}
