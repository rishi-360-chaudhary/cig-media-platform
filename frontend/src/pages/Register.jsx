import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function Register(){
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('viewer');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleRegister = async(e) => {
        e.preventDefault();
        setError('');

        try{
            const response = await axios.post('/api/v1/auth/register', {
                username: username,
                email: email,
                password: password,
                role: role
            });

            console.log('Registration successfull:', response.data);
            navigate('/dashboard');
        }
        catch(err) {
            console.error("Registration failed:", err);
            setError(err.response?.data?.message || "Registration failed. Try again.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
                <h2 className="text-3xl font-bold text-white text-center mb-8 tracking-wider">
                    JOIN <span className="text-green-500">CIG</span>
                </h2>

                {error && (
                    <div className="mb-4 bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-5">

                    <div>
                        <label className="block text-gray-400 text-sm font-bold mb-2">Username</label>
                        <input 
                            type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-green-500 focus:outline-none"
                            placeholder="monkey_d_luffy" required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm font-bold mb-2">Email Address</label>
                        <input 
                            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-green-500 focus:outline-none"
                            placeholder="luffy@onepiece.com" required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm font-bold mb-2">Password</label>
                        <input 
                            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-green-500 focus:outline-none"
                            placeholder="••••••••" required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm font-bold mb-2">Platform Role</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-green-500 focus:outline-none">
                            <option value="viewer">Viewer</option>
                            {/* <option value="club_member">Club Member</option> */}
                            <option value="photographer">Photographer</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 mt-4">
                        Create Account
                    </button>
                </form>

                <p className="text-gray-400 text-center text-sm mt-6">
                    Already have an account?{' '}
                    <Link to="/" className="text-blue-400 hover:text-blue-300 font-semibold">
                        Sign in here
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default Register;