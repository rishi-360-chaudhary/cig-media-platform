import React, {useState, useEffect} from 'react';
import axios from 'axios';

function PhotoModal({photo,onClose, onDeleteSuccess}){
    const [details, setDetails] = useState({totalLikes: 0, hasLiked: false, comments: []});
    const [newComment, setNewComment] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // for fetching details
    useEffect(() => {
        const fetchDetails = async () => {
            try{
                const response = await axios.get(`/api/v1/media/${photo._id}/details`, {withCredentials: true});
                setDetails(response.data);
            } 
            catch(err) {
                console.error("Failed to load photo details", err);
            }
        };
        fetchDetails();
    },[photo._id]);

    // for likes
    const handleLike = async () => {
        try{
            await axios.post(`/api/v1/media/${photo._id}/like`, {}, {withCredentials: true});
            setDetails(prev => ({
                ...prev,
                hasLiked: !prev.hasLiked,
                totalLikes: prev.hasLiked ? prev.totalLikes - 1 : prev.totalLikes + 1
            }));
        } 
        catch(err) {
            console.error("Failed to toggle like", err);
        }
    };

    // for comments
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if(!newComment.trim())return;

        try{
            const response = await axios.post(`/api/v1/media/${photo._id}/comment`, { content: newComment }, { withCredentials: true });
            setDetails(prev => ({
                ...prev,
                comments: [response.data.comment, ...prev.comments]
            }));
            setNewComment(''); // clear input
        } 
        catch(err) {
            console.error("Failed to post comment", err);
        }
    };

    // for watermarking
    const handleDownload = async () => {
        setIsDownloading(true);
        try{
            const response = await axios.get(`/api/v1/media/${photo._id}/download`, { 
                withCredentials: true,
                responseType: 'blob' 
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `watermarked_${photo._id}.jpg`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } 
        catch(err) {
            console.error("Failed to download image", err);
            alert("Failed to download image.");
        }
        finally{
            setIsDownloading(false);
        }
    };

    // for deleting
    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to permanently delete this photo? This will remove it from S3 and AI Face Search."))return;
        setIsDeleting(true);

        try{
            await axios.delete(`/api/v1/media/${photo._id}`, {withCredentials: true});
            onDeleteSuccess(photo._id);
        }
        catch(err) {
            console.error("Delete failed:", err);
            alert(err.response?.data?.message || "Failed to delete photo. Are you the uploader or an Admin?");
            setIsDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 md:p-8">
            <div className="absolute inset-0" onClick={onClose}></div>
            <div className="relative bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-700 w-full max-w-5xl flex flex-col md:flex-row h-full max-h-[90vh]">

                <button onClick={onClose} className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white bg-black/50 rounded-full p-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>

                <button 
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="absolute top-4 left-4 z-20 bg-red-600/80 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2 backdrop-blur-sm transition font-semibold disabled:bg-gray-600"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    {isDeleting ? 'Deleting...' : 'Delete'}
                </button>

                <div className="md:w-2/3 bg-black flex items-center justify-center relative">
                    <img src={photo.url} alt="Event" className="max-w-full max-h-full object-contain" />

                    <button 
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="absolute bottom-4 right-4 bg-gray-800/80 hover:bg-gray-700 text-white px-4 py-2 rounded flex items-center gap-2 backdrop-blur-sm transition"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        {isDownloading ? 'Downloading...' : 'Download'}
                    </button>
                </div>

                <div className="md:w-1/3 flex flex-col h-full bg-gray-900 border-l border-gray-800">

                    <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                        <div className="flex gap-2 flex-wrap">
                            {photo.tags?.map((tag, i) => (
                                <span key={i} className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded">#{tag}</span>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 border-b border-gray-800 flex items-center gap-4">
                        <button onClick={handleLike} className="flex items-center gap-2 focus:outline-none">
                            <svg className={`w-8 h-8 transition-colors ${details.hasLiked ? 'text-red-500 fill-current' : 'text-gray-400 hover:text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                            </svg>
                            <span className="text-white font-bold">{details.totalLikes}</span>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700">
                        {details.comments.length === 0 ? (
                            <p className="text-gray-500 text-center mt-10">No comments yet. Be the first!</p>
                            ) : (
                                details.comments.map(comment => (
                                    <div key={comment._id} className="bg-gray-800 p-3 rounded-lg">
                                        <span className="font-bold text-blue-400 text-sm mr-2">
                                            {comment.commentedBy?.username || 'User'}
                                        </span>
                                        <span className="text-gray-300 text-sm">{comment.content}</span>
                                    </div>
                            ))
                        )}
                    </div>

                    <div className="p-4 border-t border-gray-800 bg-gray-900">
                        <form onSubmit={handleCommentSubmit} className="flex gap-2">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                className="flex-1 bg-gray-800 text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 border border-gray-700"
                            />
                            <button
                                type="submit"
                                disabled={!newComment.trim()}
                                className="text-blue-500 font-bold px-4 py-2 hover:text-blue-400 disabled:text-gray-600 disabled:cursor-not-allowed"
                            >
                                Post
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PhotoModal;