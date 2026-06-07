import React, {useState} from "react";
import {Link} from 'react-router-dom';
import axios from 'axios';

function FindMe() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [matchedPhotos, setMatchedPhotos] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [message, setMessage] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        if(!selectedFile)return;

        setIsSearching(true);
        setMessage('');

        const formData = new FormData();
        formData.append('selfie', selectedFile);

        try{
            const response = await axios.post('/api/v1/media/find-me', formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setMatchedPhotos(response.data.photos);
            setMessage(response.data.message);
            setHasSearched(true);
        } 
        catch(err) {
            console.error("AI Search failed:", err);
            setMessage(err.response?.data?.message || "Failed to process the image. Please try again.");
        } 
        finally{
            setIsSearching(false);
        }
    };

    const resetSearch = () => {
        setSelectedFile(null);
        setMatchedPhotos([]);
        setHasSearched(false);
        setMessage('');
    };

    return (
        <div className="min-h-screen bg-gray-900 p-8">
            <div className="max-w-6xl mx-auto">

                <header className="mb-10 text-center">
                    <div className="flex justify-start mb-4">
                        <Link to="/dashboard" className="text-gray-400 hover:text-white tracking-widest text-sm uppercase">
                            &larr; Back to Dashboard
                        </Link>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-widest mb-4">
                        AI <span className="text-purple-500">FACE MATCH</span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Upload a quick selfie, and our AI will instantly scan every event to find all your photos.
                    </p>
                </header>

                {!hasSearched ? (
                    <div className="max-w-xl mx-auto bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700">
                        {message && (
                            <div className="mb-6 bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-center font-semibold">
                                {message}
                            </div>
                        )}

                    <form onSubmit={handleSearch} className="flex flex-col items-center gap-6">
                        <div className="w-full relative border-2 border-dashed border-gray-600 rounded-xl p-10 hover:border-purple-500 transition text-center bg-gray-900 cursor-pointer">
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => setSelectedFile(e.target.files[0])}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            {!selectedFile ? (
                                <div>
                                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                    <p className="text-gray-300 font-semibold">Tap to take or upload a selfie</p>
                                    <p className="text-gray-500 text-sm mt-1">Make sure your face is clearly visible</p>
                                 </div>
                            ) : (
                                <div className="text-purple-400 font-bold flex flex-col items-center">
                                    <svg className="mx-auto h-12 w-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    Image Selected: {selectedFile.name}
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={!selectedFile || isSearching}
                            className={`w-full py-4 rounded-xl font-bold text-lg tracking-wider transition duration-300 ${!selectedFile || isSearching ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-purple-500/25'}`}
                        >
                            {isSearching ? 'Scanning Platform...' : 'Find My Photos'}
                        </button>
                    </form>
                </div>
                ) : (
                    <div className="animate-fade-in">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold text-white">
                                Found <span className="text-purple-400">{matchedPhotos.length}</span> Matches
                            </h2>
                            <button onClick={resetSearch} className="text-gray-400 hover:text-white border border-gray-600 hover:border-white px-4 py-2 rounded-lg transition">
                                Search Again
                            </button>
                        </div>

                        {matchedPhotos.length === 0 ? (
                            <div className="text-center py-16 bg-gray-800 rounded-2xl border border-gray-700">
                                <svg className="mx-auto h-16 w-16 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <p className="text-xl text-gray-400 font-semibold mb-2">No matches found.</p>
                                <p className="text-gray-500">We couldn't find your face in any event photos yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {matchedPhotos.map((photo) => (
                                    <div key={photo._id} className="relative group overflow-hidden rounded-xl border border-gray-700 bg-gray-800 aspect-square">
                                        <img 
                                            src={photo.url} 
                                            alt="Matched moment" 
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                                            {photo.tags?.slice(0, 2).map((tag, i) => (
                                                <span key={i} className="bg-black/70 backdrop-blur-sm text-purple-300 text-xs px-2 py-1 rounded">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )

}

export default FindMe;