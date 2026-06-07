import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try{
            const response = await axios.post('/api/v1/auth/login',{
                email: email,
                password: password
            });
            
            console.log("Backend says:", response.data);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            navigate('/dashboard');
        } 
        catch(err) {
            console.error("Login failed:", err);
            setError(err.response?.data?.message || "Something went wrong, try again.");
        }
    }
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
                <h2 className="text-3xl font-bold text-white text-center mb-8 tracking-wider">
                    CIG <span className="text-green-500">PORTAL</span>
                </h2>

                {error && (
                    <div className="mb-4 bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-gray-400 text-sm font-bold mb-2">Email Address</label>
                        <input 
                            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                            placeholder="sanji@onepiece.com" required
                        />    
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm font-bold mb-2">Password</label>
                        <input 
                            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                            placeholder="••••••••" required
                        />
                    </div>

                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200">
                        Sign In
                    </button>
                </form>
                
                <p className="text-gray-400 text-center text-sm mt-6">
                    New to the club?{' '}
                    <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold">
                        Create an account
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Login;