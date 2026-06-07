import React, {useState,useEffect} from "react";
import axios from "axios";
import { Link,useNavigate } from 'react-router-dom';

function Dashboard() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [createError, setCreateError] = useState('');
    const [userRole, setUserRole] = useState('viewer');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState('newest');

    const navigate = useNavigate();

    const handleLogout = async () => {
        try{
            await axios.post('/api/v1/auth/logout', {}, { withCredentials:true});
        } 
        catch(err) {
            console.error("Backend logout error", err);
        } 
        finally{
            localStorage.removeItem('user');
            navigate('/');
        }
    };

    const [newEvent, setNewEvent] = useState({
        name: '',
        description: '',
        date: '',
        category: 'workshop'
    });

    useEffect(() => {

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUserRole(parsedUser.role || 'viewer');
            } catch (err) {
                console.error("Could not parse user from local storage");
            }
        }

        const fetchEvents = async () => {
            try{
                const response = await axios.get('/api/v1/events', {
                withCredentials: true 
                });

                setEvents(response.data.events);
                setLoading(false);
            }
            catch(err) {
                console.error("Error fetching events:", err);
                setError("Could not load events.Your session might have expired.");
                setLoading(false);
            }
        }
        fetchEvents();
    }, [refreshTrigger])

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        setCreateError('');

        try{
            await axios.post('/api/v1/events', newEvent, {withCredentials: true});
            
            setIsModalOpen(false);
            setNewEvent({name: '', description: '', date: '', category: 'workshop'});
            setRefreshTrigger(prev => prev + 1);
        }
        catch(err) {
            console.error("Failed to create event:", err);
            setCreateError(err.response?.data?.message || "Not authorized to create events.");
        }
    }

    const filteredAndSortedEvents = events
        .filter(event => {
            if (!searchQuery) return true;
            const query = searchQuery.toLowerCase();
            return (
                event.name?.toLowerCase().includes(query) ||
                event.description?.toLowerCase().includes(query) ||
                event.category?.toLowerCase().includes(query)
            );
        })
        .sort((a, b) => {
            // Sorting Logic
            if (sortOption === 'newest') return new Date(b.date) - new Date(a.date);
            if (sortOption === 'oldest') return new Date(a.date) - new Date(b.date);
            if (sortOption === 'a-z') return a.name.localeCompare(b.name);
            if (sortOption === 'z-a') return b.name.localeCompare(a.name);
            if (sortOption === 'category') return a.category.localeCompare(b.category);
            return 0;
        });

    return (
        <div className="min-h-screen bg-gray-900 p-8 relative">
            <div className="max-w-6xl mx-auto">

                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-white tracking-widest">
                            CIG <span className="text-green-500">EVENTS</span>
                        </h1>
                        <p className="text-gray-400 mt-2">Welcome to the central hub.</p>
                        {/* <p className="text-yellow-400 mt-2">DEBUG ROLE: {userRole}</p> */}
                    </div>

                    <div className="flex gap-4 items-center">
                        <Link
                            to="/find-me"
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200 shadow-lg flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path></svg>
                            Find Me
                        </Link>

                        {(userRole === 'admin' || userRole === 'photographer') && (
                            <button onClick={() => setIsModalOpen(true)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200 shadow-lg">
                                + Create Event
                            </button>
                        )}

                        <button
                            onClick={handleLogout}
                            className="bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white font-bold py-2 px-4 rounded-lg transition duration-200 shadow-lg flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                            Logout
                        </button>
                    </div>
                </header>

                {/* ---> NEW: Search and Sort Control Bar <--- */}
                {!loading && !error && events.length > 0 && (
                    <div className="mb-8 flex flex-col md:flex-row gap-4 bg-gray-800 p-4 rounded-xl border border-gray-700">
                        {/* Search Input */}
                        <div className="flex-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search events by name, description, or category..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-900 text-white border border-gray-600 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition outline-none"
                            />
                        </div>

                        {/* Sort Dropdown */}
                        <div className="w-full md:w-48">
                            <select
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white border border-gray-600 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition outline-none appearance-none cursor-pointer"
                            >
                                <option value="newest">Sort: Newest First</option>
                                <option value="oldest">Sort: Oldest First</option>
                                <option value="a-z">Sort: Name (A-Z)</option>
                                <option value="z-a">Sort: Name (Z-A)</option>
                                <option value="category">Sort: By Category</option>
                            </select>
                        </div>
                    </div>
                )}

                {loading && <p className="text-blue-400 font-semibold animate-pulse">Loading events...</p>}

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {!loading && !error && events.length === 0 && (
                    <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 text-center">
                        <p className="text-gray-400">No events found. Check back later!</p>
                    </div>
                )}

                {/* ---> NEW: Search Empty State <--- */}
                {!loading && events.length > 0 && filteredAndSortedEvents.length === 0 && (
                    <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 text-center">
                        <p className="text-gray-400">No events matched your search: "<span className="text-white font-semibold">{searchQuery}</span>"</p>
                        <button onClick={() => setSearchQuery('')} className="mt-4 text-green-500 hover:text-green-400 font-semibold">Clear Search</button>
                    </div>
                )}

                {/* ---> NEW: We map over filteredAndSortedEvents instead of just 'events' <--- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAndSortedEvents.map((event) => (
                        <div key={event._id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg hover:border-green-500 transition duration-300">

                            <span className="inline-block px-3 py-1 bg-gray-700 text-green-400 text-xs font-bold rounded-full mb-4 uppercase tracking-wider">
                                {event.category}
                            </span>

                            <h2 className="text-xl font-bold text-white mb-2">{event.name}</h2>

                            <p className="text-blue-400 text-sm font-semibold mb-3">
                                {new Date(event.date).toLocaleDateString(undefined,{
                                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                })}
                            </p>

                            <p className="text-gray-400 text-sm line-clamp-3">
                                {event.description || "No description provided."}
                            </p>

                            <div className="mt-6 pt-4 border-t border-gray-700 flex gap-2">
                                <Link 
                                    to={`/gallery/${event._id}`}
                                    className="flex-1 text-center bg-gray-700 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                                >
                                    View Photo Gallery
                                </Link>

                                {userRole === 'admin' && (
                                    <button
                                        onClick={async () => {
                                            if(window.confirm(`Are you sure you want to permanently delete "${event.name}"? This deletes ALL photos from S3/AI search.`)){
                                                try{
                                                    await axios.delete(`/api/v1/events/${event._id}`, { withCredentials: true });
                                                    setEvents(events.filter(e => e._id !== event._id));
                                                } 
                                                catch(err) {
                                                    console.error("Failed to delete event:", err);
                                                    alert("Error deleting event.");
                                                }
                                            }
                                        }}
                                        className="bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white p-2 rounded transition group"
                                        title="Delete Event"
                                    >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full border border-gray-700 shadow-2xl">

                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Create New Event</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white text-xl">&times;</button>
                        </div>

                        {createError && (
                            <div className="mb-4 bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm text-center">
                                {createError}
                            </div>
                        )}

                        <form onSubmit={handleCreateEvent} className="space-y-4">
                            <div>
                                <label className="block text-gray-400 text-sm font-bold mb-2">Event Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newEvent.name}
                                    onChange={(e) => setNewEvent({...newEvent, name: e.target.value})}
                                    className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-green-500 focus:outline-none"
                                    placeholder="e.g. Annual Tech Summit"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm font-bold mb-2">Description</label>
                                <textarea
                                    value={newEvent.description}
                                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                                    className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-green-500 focus:outline-none"
                                    placeholder="What is this event about?"
                                    rows="3"
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm font-bold mb-2">Date</label>
                                <input
                                    type="date"
                                    required
                                    value={newEvent.date}
                                    onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                                    className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-green-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm font-bold mb-2">Category</label>
                                <select
                                    value={newEvent.category}
                                    onChange={(e) => setNewEvent({...newEvent, category: e.target.value})}
                                    className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-green-500 focus:outline-none"
                                >
                                    <option value="workshop">Workshop</option>
                                    <option value="meetup">Meetup</option>
                                    <option value="competition">Competition</option>
                                    <option value="party">Party</option>
                                </select>
                            </div>

                            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 mt-6">
                                Publish Event
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;