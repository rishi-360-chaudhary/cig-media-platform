import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from 'axios';
import PhotoModal from '../components/PhotoModal';

function EventGallery() {
    const { eventId } = useParams();
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');   
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState('');
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userRole = storedUser.role || 'viewer';

    useEffect(() => {
        const fetchPhotos = async () => {
            try{
                const response = await axios.get(`/api/v1/media/${eventId}`, {withCredentials: true});
                setPhotos(response.data.media);
                setLoading(false);
            } 
            catch(err) {
                if(err.response?.status === 404) {
                    setPhotos([]);
                } 
                else{
                    setError("Failed to load gallery.");
                }
                setLoading(false);
            }
        }
        fetchPhotos();
    }, [eventId]);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setSelectedFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFiles(Array.from(e.target.files));
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (selectedFiles.length === 0) return;

        setIsUploading(true);
        setUploadMessage('');

        const formData = new FormData();

        selectedFiles.forEach(file => {
            formData.append('mediaFiles', file);
        });

        try{
            const response = await axios.post(`/api/v1/media/${eventId}/upload`, formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setPhotos([...response.data.media, ...photos]);
            setUploadMessage(`Successfully uploaded ${response.data.media.length} photos!`);
            setSelectedFiles([]); // Clear selection
        } 
        catch (err){
            console.error("Upload failed:", err);
            setUploadMessage(err.response?.data?.message || "Upload failed. Check permissions.");
        } 
        finally{
            setIsUploading(false);
        }
    }

    const filteredPhotos = photos.filter(photo => {
        if(!searchQuery)return true;
        const query = searchQuery.toLowerCase();
        
        const hasTag = photo.tags?.some(tag => tag.toLowerCase().includes(query));
        
        const isUploader = photo.uploadedBy?.username?.toLowerCase().includes(query);
        
        return hasTag || isUploader;
    });

    return (
        <div className="min-h-screen bg-gray-900 p-8">
            <div className="max-w-6xl mx-auto">

                <header className="mb-8 flex justify-between items-center flex-wrap gap-4">
                    <div>
                        <Link to="/dashboard" className="text-gray-400 hover:text-white mb-4 inline-block tracking-widest text-sm uppercase">
                            &larr; Back to Dashboard
                        </Link>
                        <h1 className="text-4xl font-bold text-white tracking-widest mt-2">
                            EVENT <span className="text-blue-500">GALLERY</span>
                        </h1>
                    </div>

                    <div className="w-full md:w-auto flex-1 max-w-md relative">
                        <input
                            type="text"
                            placeholder="Search by AI tags (e.g. 'crowd') or username..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-4 pr-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 outline-none"
                        />
                    </div>
                </header>

                {(userRole === 'admin' || userRole === 'photographer') && (
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-10 shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-white">Bulk Photo Upload</h2>
                            {selectedFiles.length > 0 && (
                                <button onClick={() => setSelectedFiles([])} className="text-red-400 hover:text-red-300 text-sm">
                                    Clear Selection
                                </button>
                            )}
                        </div>

                        {uploadMessage && (
                            <div className={`mb-4 p-3 rounded-lg text-sm font-semibold ${uploadMessage.includes('Successfully') ? 'bg-green-500/10 text-green-500 border border-green-500' : 'bg-red-500/10 text-red-500 border border-red-500'}`}>
                                {uploadMessage}
                            </div>
                        )}

                        <form onSubmit={handleUpload}>
                            <div 
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`w-full border-2 border-dashed rounded-xl p-8 text-center transition-colors mb-4
                                    ${isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 bg-gray-900'}
                                    ${selectedFiles.length > 0 ? 'border-green-500' : ''}`}
                            >
                                <input 
                                    type="file"
                                    accept="image/*"
                                    multiple // allows selecting multiple files
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                                    <svg className={`w-12 h-12 mb-3 ${selectedFiles.length > 0 ? 'text-green-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                                    
                                    {selectedFiles.length === 0 ? (
                                        <>
                                            <span className="text-gray-300 font-semibold text-lg">Drag & Drop photos here</span>
                                            <span className="text-gray-500 text-sm mt-1">or click to browse your computer</span>
                                        </>
                                    ) : (
                                        <span className="text-green-400 font-bold text-lg">{selectedFiles.length} files selected ready for upload</span>
                                    )}
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={selectedFiles.length === 0 || isUploading}
                                className={`w-full py-3 rounded-lg font-bold transition duration-200 
                                    ${selectedFiles.length === 0 || isUploading ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'}`}
                            >
                                {isUploading ? `Uploading ${selectedFiles.length} files to Cloud & AI Engine...` : `Upload ${selectedFiles.length} Photos`}
                            </button>
                        </form>
                    </div>
                )}

                {loading && <p className="text-blue-400 animate-pulse">Loading gallery...</p>}
                {error && <p className="text-red-500">{error}</p>}

                {!loading && photos.length === 0 && (
                    <div className="text-center py-16 border-2 border-dashed border-gray-700 rounded-xl bg-gray-800">
                        <p className="text-gray-400 text-lg">No photos have been uploaded to this event yet.</p>
                    </div>
                )}

                {!loading && photos.length > 0 && filteredPhotos.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-400">No photos matched the tag: "{searchQuery}"</p>
                    </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredPhotos.map((photo) => (
                        <div 
                            key={photo._id} 
                            onClick={() => setSelectedPhoto(photo)}
                            className="relative group overflow-hidden rounded-xl border border-gray-700 bg-gray-800 aspect-square cursor-pointer"
                        >
                            <img
                                src={photo.url}
                                alt="Event moment"
                                className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                            />

                            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-4">
                                <div className="flex flex-wrap gap-1 mb-2">
                                    {photo.tags?.slice(0, 3).map((tag, i) => (
                                        <span key={i} className="bg-blue-500/80 text-white text-xs px-2 py-1 rounded-md">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-white text-xs font-semibold">By: {photo.uploadedBy?.username || 'Unknown'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedPhoto && (
                <PhotoModal 
                    photo={selectedPhoto} 
                    onClose={() => setSelectedPhoto(null)} 
                    onDeleteSuccess={(deletedId) => {
                        setPhotos(photos.filter(p => p._id !== deletedId));
                        setSelectedPhoto(null);
                    }}
                />
            )}
        </div>
    )
}

export default EventGallery;