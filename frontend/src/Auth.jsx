import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import loadScreen from "./assets/load-screen.png";
import diceBg from "./assets/diceBg.png";
const Auth = () => {
  const navigate = useNavigate(); 
  const [isSignup, setIsSignup] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  setTimeout(() => setIsLoading(false), 3000);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = isSignup ? "https://dice-game-test-aqcp.onrender.com/signup" : "https://dice-game-test-aqcp.onrender.com/login";
      const response = await axios.post(url, formData);

      if (isSignup) {
        setIsSignup(false);
      } else {
        localStorage.setItem("token", response.data.token);
        navigate("/dashboard");
      }
    } catch (error) {
      alert(error.response?.data?.message || "An error occurred");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center radial-gradient-background text-white">
      <div
        className={`absolute inset-0 flex items-center justify-center transition-transform duration-1000 ease-in-out ${
          isLoading ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <img
          src={diceBg}
          alt="Dice Background"
          className="absolute w-16 opacity-20 top-1/3 left-1/3 -translate-x-32 translate-y-12"
        />
        <img
          src={diceBg}
          alt="Dice Background"
          className="absolute w-20 opacity-20 bottom-20 right-20"
        />
        <img
          src={diceBg}
          alt="Dice Background"
          className="absolute w-24 opacity-20 top-1/4 right-1/4 translate-x-24 -translate-y-8"
        />
        <img
          src={diceBg}
          alt="Dice Background"
          className="absolute w-16 opacity-20 bottom-1/4 left-1/4 -translate-x-20 translate-y-16"
        />
        <img
          src={diceBg}
          alt="Dice Background"
          className="absolute w-18 opacity-20 top-10 left-72"
        />
        <img
          src={diceBg}
          alt="Dice Background"
          className="absolute w-22 opacity-20 bottom-1/3 right-1/3 translate-x-28 translate-y-20"
        />
        <img
          src={diceBg}
          alt="Dice Background"
          className="absolute w-14 opacity-20 top-1/2 left-1/2 translate-x-36 -translate-y-24"
        />
        <img
          src={diceBg}
          alt="Dice Background"
          className="absolute w-20 opacity-20 bottom-40 right-64"
        />
        <img
          src={diceBg}
          alt="Dice Background"
          className="absolute w-14 opacity-20 top-28 left-16"
        />
        <img
          src={diceBg}
          alt="Dice Background"
          className="absolute w-18 opacity-20 bottom-1/2 left-1/2 -translate-x-40 translate-y-32"
        />
        <img
          src={diceBg}
          alt="Dice Background"
          className="absolute w-16 opacity-20 top-16 right-12"
        />
        <img
          src={diceBg}
          alt="Dice Background"
          className="absolute w-22 opacity-20 bottom-1/4 right-1/4 translate-x-32 translate-y-12"
        />
        <img
          src={loadScreen}
          alt="Loading Dice Game"
          className="w-1/2 max-w-md z-10"
        />
      </div>

      <div
        className={`transition-opacity duration-500 ${
          isLoading ? "opacity-0" : "opacity-100"
        } bg-gray-900 p-8 rounded-lg shadow-lg w-[90%] sm:w-[70%] lg:w-[40%]`}
      >
        <h2 className="text-2xl font-bold text-center mb-4">
          {isSignup ? "Sign Up" : "Login"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <input
              type="text"
              name="name"
              placeholder="Name"
              onChange={handleChange}
              required
              className="w-full p-3 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
            className="w-full p-3 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
            className="w-full p-3 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            className="w-full p-3 bg-purple-600 rounded text-white font-bold hover:bg-purple-700 transition"
          >
            {isSignup ? "Sign Up" : "Login"}
          </button>
        </form>
        <p
          onClick={() => setIsSignup(!isSignup)}
          className="mt-4 text-center text-white hover:underline cursor-pointer"
        >
          {isSignup
            ? "Already have an account? Login"
            : "Don't have an account? Sign Up"}
        </p>
      </div>
    </div>
  );
};

export default Auth;
