import { useState, useEffect } from "react";
import axios from "axios";
import diceLogo from "./assets/dice-logo.svg";
import loadScreen from "./assets/load-screen.png";
import diceBg from "./assets/diceBg.png";

function Dice() {
  const [balance, setBalance] = useState(0);
  const [betAmount, setBetAmount] = useState("");
  const [rollResult, setRollResult] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [serverSeedHash, setServerSeedHash] = useState(null);
  const [userName, setUserName] = useState("");

  
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get("https://dice-game-test-aqcp.onrender.com/user_details", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserName(response.data.name);
        setBalance(response.data.balance);

        console.log(response, response.data.balance);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  setTimeout(() => setIsLoading(false), 3000);

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleRollDice = async () => {
    if (isRolling || !betAmount || betAmount <= 0) return;
    setIsRolling(true);
    setRollResult(null);
  
    await delay(3000);
  
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You need to log in first.");
        setIsRolling(false);
        return;
      }
  
      const seedResponse = await axios.get(
        "https://dice-game-test-aqcp.onrender.com/get-server-seed-hash",
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (!seedResponse.data.server_seed_hash) {
        alert("Failed to get server seed hash. Try again.");
        setIsRolling(false);
        return;
      }
  
      setServerSeedHash(seedResponse.data.server_seed_hash);
  
      const clientSeed = Math.random().toString(36).substring(2);
  
      const rollResponse = await axios.post(
        "https://dice-game-test-aqcp.onrender.com/roll-dice",
        {
          bet_amount: parseFloat(betAmount),
          client_seed: clientSeed,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      const { roll, winnings, server_seed } = rollResponse.data;
      console.log("data",rollResponse)
      setBalance(rollResponse.data.new_balance);
      setRollResult({ roll, winnings, clientSeed, serverSeed: server_seed });
      setBetAmount("");
    } catch (error) {
      console.error("Error rolling dice:", error);
      if (error.response) alert(error.response.data.error);
    } finally {
      setIsRolling(false);
    }
  };
  

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div className="overflow-x-hidden min-h-screen min-w-screen radial-gradient-background relative flex items-center justify-center">
      
        <div className="absolute inset-0  items-center justify-center hidden sm:flex">
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
        </div>

        <img
          src={loadScreen}
          alt="Dice Game"
          className="absolute w-40 top-5 sm:top-3 xl:top-5 "
          style={{
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />

        <div className="z-1 relative mt-[-10rem]  sm:mt-20 bg-gray-900 p-8 rounded-xl shadow-2xl text-white border border-gray-800 w-full sm:w-xl  flex flex-col justify-center ">
          <p className="w-full p-3 text-2xl rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200">
            {" "}
            Hi {userName}
          </p>
          <p className="mb-4 text-lg bg-gradient-to-r from-purple-500 to-purple-700 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-purple-800 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 w-full p-2 text-center">
            Current Balance: <span>${balance}</span>
          </p>
          <input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            placeholder="Bet Amount"
            className="w-full p-3 mb-6 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
            disabled={isRolling}
          />

          {!isRolling ? (
            <button
              onClick={handleRollDice}
              disabled={isRolling || !betAmount || betAmount <= 0}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-700 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-purple-800 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300"
            >
              Roll Dice
            </button>
          ) : (
            <div className="loader"></div>
          )}
          {rollResult && (
            <div className="mt-6 w-[200px] sm:w-auto">
              <p className="text-gray-300 mb-2">
                You rolled a {rollResult.roll}.{" "}
                {rollResult.winnings > 0
                  ? `You won $${rollResult.winnings}!`
                  : "You lost your bet."}
              </p>
              <div className="relative w-[200px] sm:w-full h-6 bg-gray-800 rounded-full overflow-hidden shadow-inner">
                <div className="absolute inset-0 flex justify-between">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 border-r border-gray-600 last:border-r-0"
                    />
                  ))}
                </div>

                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-700 transition-all duration-700 ease-in-out"
                  style={{ width: `${(rollResult.roll / 6) * 100}%` }}
                />

                <div className="absolute inset-0 flex justify-between items-center text-xs text-gray-300 font-semibold">
                  <span className="ml-2">1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                  <span className="mr-2">6</span>
                </div>
                <div
                  className="absolute top-0 h-full w-1 sm:w-2 bg-white opacity-90 rounded-full shadow-lg transition-all duration-700 ease-in-out"
                  style={{ left: `${(rollResult.roll / 6) * 100 - 1}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 break-words">
                Client Seed: {rollResult.clientSeed} | Server Seed:{" "}
                {rollResult.serverSeed}
              </p>
            </div>
          )}
          <p onClick={handleLogout} className="flex justify-end"><button className="flex bg-gray p-4 t-3 ">Logout?</button></p>

        </div>

      </div>
  );
}

export default Dice;
