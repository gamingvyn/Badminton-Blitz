import { useState } from "react";
import { useBadminton } from "@/lib/stores/useBadminton";

export function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const { register, setScreen, isLoading, error, setError } = useBadminton();
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }
    
    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }
    
    if (password.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    await register(username, password);
  };
  
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-green-800 to-green-950">
      <div className="bg-white/95 rounded-2xl p-8 shadow-2xl w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">Badminton</h1>
          <p className="text-gray-600">Create your account</p>
        </div>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition text-gray-900"
              placeholder="Choose a username"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition text-gray-900"
              placeholder="Choose a password"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition text-gray-900"
              placeholder="Confirm your password"
              disabled={isLoading}
            />
          </div>
          
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-3 px-4 rounded-lg transition transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <button
              onClick={() => setScreen("login")}
              className="text-green-600 hover:text-green-700 font-semibold"
              disabled={isLoading}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
