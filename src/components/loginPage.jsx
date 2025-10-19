import React, { useEffect, useState } from 'react';

import axios from 'axios';




// Login/Signup Component
function LoginPage({ onLogin, registeredUsers, onRegister }) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [status,setStatus]=useState(0);
  
  
  useEffect(
    ()=>{
       const register=async ()=>{
          
       }
       register();
    },[email]
  )
  
  const handleLogin = async () => {
    if (!email.endsWith('@iit.ac.in')) {
      setError('Please use an @iit.ac.in email address');
      return;
    }
    
    try{
      const response=await axios.post('https://interiit-tech-siyv.vercel.app/api/login',
        {
          email:email,
          password:password
        }
      )
      if(response.status==200){
        const data=response.data;
        onLogin({ email: data['email'], name: data['email'], id: data['id'] });
      }else{
        setError("Invalid email or password. Please sign up if you are a new user.")
      }
      
 
    }catch(err){
       console.log('Error:',err);
    }
  };
  
 const handleSignup = async () => {
  setError('');
  setSuccess('');

  if (!email.endsWith('@iit.ac.in')) {
    setError('Please use an @iit.ac.in email address');
    return;
  }

  if (password.length < 6) {
    setError('Password must be at least 6 characters');
    return;
  }

  if (name.trim().length < 2) {
    setError('Please enter your full name');
    return;
  }

  try {
    const res = await axios.post('http://localhost:3000/api/register', {
      name,
      email,
      password
    });

    // ✅ Use the message from backend
    setSuccess(res.data.message);

    // Clear form or switch to login page after signup
    setTimeout(() => {
      setIsSignup(false);
      setPassword('');
      setSuccess('');
    }, 2000);

  } catch (err) {
    console.log('Signup error:', err);

    // If backend sends a message, show it
    if (err.response && err.response.data && err.response.data.message) {
      setError(err.response.data.message);
    } else {
      setError('Something went wrong. Please try again.');
    }
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-gray-600">
            {isSignup ? 'Sign up to join the discussion' : 'Sign in to continue'}
          </p>
        </div>
        
        <div className="space-y-6">
          {isSignup && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" >Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                placeholder="John Doe"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              placeholder="student@iit.ac.in"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              placeholder="••••••••"
              onKeyPress={(e) => e.key === 'Enter' && (isSignup ? handleSignup() : handleLogin())}
            />
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm">
              {success}
            </div>
          )}
          
          <button
            onClick={isSignup ? handleSignup : handleLogin}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200"
          >
            {isSignup ? 'Sign Up' : 'Sign In'}
          </button>
          
          <div className="text-center">
            <button
              onClick={() => {
                setIsSignup(!isSignup);
                setError('');
                setSuccess('');
              }}
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              {isSignup ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
        
        <p className="text-center text-sm text-gray-500 mt-6">
          Must use @iit.ac.in email domain
        </p>
      </div>
    </div>
  );
}
export default LoginPage;