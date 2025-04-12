import React, { useState,useEffect } from "react";  
import "./login.css";
import schoolbg1 from "../../images/charcoal.jpg";
import classbg from "../../images/blue.jpg";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword,onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../Firebase/firebase";
import { setDoc, doc } from "firebase/firestore";
import { toast } from 'react-toastify';
import { useUserStore } from "../../Firebase/userstore.js"; // Import Zustand store

const Login = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentBg, setCurrentBg] = useState(schoolbg1);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // Added name for Signup
  const [error, setError] = useState(false);
  const { setUser, clearUser, setLoading, fetchUserInfo } = useUserStore(); // Zustand hooks

  useEffect(() => {
    // Listen for authentication state change (login, logout)
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLoading(true); // Set loading true
        setUser(user);  // ✅ Ensure Zustand gets the user
        await fetchUserInfo(user.uid); // Fetch additional Firestore data
      } else {
        clearUser(); // Clear user data if logged out
      }
    });

      // Check if a user is already present in the Zustand store (persisted state)
  const persistedUser = useUserStore.getState().currentUser;
  if (persistedUser) {
    setLoading(true);
    fetchUserInfo(persistedUser.uid); // Fetch user info if it already exists in persisted state
  }
  
    return () => unsubscribe(); // Clean up the listener on component unmount
  }, [setUser,fetchUserInfo, clearUser, setLoading]);

  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
    setTimeout(() => {
      setCurrentBg(isFlipped ? schoolbg1 : classbg);
    }, 100); // Matches the CSS transition duration
  };

  // Validate password before proceeding with signup
  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return regex.test(password);
  };

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(false); // Reset error state
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // ✅ Update Zustand store after successful login
    setUser(user);
    await fetchUserInfo(user.uid);

      toast.success("Login successful! Redirecting...");
      navigate("/home", { replace: true }); // Prevent navigation history stacking
    } catch (error) {
      console.error("Login error:", error.code, error.message);
      if (error.code === "auth/wrong-password") {
        toast.error("Incorrect password. Please try again.");
      } else if (error.code === "auth/user-not-found") {
        toast.error("No user found with this email.");
      } else {
        toast.error("Login failed. Please try again.");
      }
      setError(true);
    }
    console.log("Zustand User:", useUserStore.getState().currentUser);

  };

  // Signup handler
  const handleSignup = async (e) => {
    e.preventDefault();
    setError(false); // Reset error state
    // Validate password before proceeding with signup
    if (!validatePassword(password)) {
      toast.error(
        "Password must be at least 8 characters long and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character."
      );
      return; // Exit the function if password is invalid
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Store additional user info in Firestore
      await setDoc(doc(db, "Users", user.uid), {
        email: user.email,
        name: name, // Use the name provided in the Signup form
        createdAt: new Date(),
      });

      toast.success("Signup successful! Redirecting...");
       // Delay navigation to allow time for UI updates
       setTimeout(() => {
        navigate("/home", { replace: true }); // Prevent navigation history stacking
      }, 500);
    } catch (error) {
      setError(true); // Display error if signup fails
      toast.error("Signup failed. Please try again.");
      console.error("Signup error:", error.message);
    }
  };

  return (
    <div className="login" style={{ backgroundImage: `url(${currentBg})` }}>
      <div className="main-name">EDUKSHETRA</div>
      <div className="flip-card-container">
        <div className="tri"></div>
        <div className={`flip-card ${isFlipped ? "flipped" : ""}`}>
          <div className="back-container">
            <button className="rightmiddle" onClick={toggleFlip}>
              {!isFlipped ? "Signup" : "Login"}
            </button>
          </div>

          {/*Login Page*/}
          <div className="card-front">
            <div className="middle">Login</div>
            <form className="form" onSubmit={handleLogin}>
              <div className="form-floating mb-3 subin">
                <input
                  type="email"
                  className="form-control box"
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Email"
                  value={email} // Bind to state to reflect pre-fill
                  disabled={isFlipped} // Disable email field if already pre-filled
                  required
                />
                <label>Enter Email</label>
              </div>
              <div className="form-floating mb-3 subin">
                <input
                  type="password"
                  className="form-control box"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  value={password} // Bind to state to reflect pre-fill
                  disabled={isFlipped} // Disable password field if already pre-filled
                  required
                />
                <label>Enter Password</label>
              </div>
              <button type="submit" className="submit-button">
                Login
              </button>
              {error && <span>Invalid email or password</span>}
            </form>
          </div>

          {/*Signup Page*/}
          <div className="card-back">
            <div className="middle">SignUp</div>
            <form className="form1" onSubmit={handleSignup}>
              <div className="form-floating mb-3 subin">
                <input
                  type="text"
                  className="form-control box"
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name"
                  required
                />
                <label>Name</label>
              </div>
              <div className="form-floating mb-3 subin">
                <input
                  type="email"
                  className="form-control box"
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Email"
                  value={email} // Bind to state to reflect pre-fill
                  required
                />
                <label>Enter Email</label>
              </div>
              <div className="form-floating mb-3 subin">
                <input
                  type="password"
                  className="form-control box"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  value={password} // Bind to state to reflect pre-fill
                  required
                />
                <label>Enter Password</label>
              </div>
              <button type="submit" className="submit-button1">
                Signup
              </button>
              {error && <span>Signup failed. Please try again.</span>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
