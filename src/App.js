import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Homepage from './Components/Hompage/homepage';
import Dashboard from "./Components/Screens/Dashboard/dashboard";
import Teachers from './Components/Screens/Teachers/teachers';
import Students from './Components/Screens/Students/students';
import Classwork from './Components/Screens/Classwork/classwork';
import Attendance from './Components/Screens/Attendance/attendance';
import People from './Components/Screens/People/people';
import Profile from './Components/Screens/Profile/profile';
import LeaveSchool from './Components/Screens/Leave/leave';
import Creatework from "./Components/Screens/Classwork/Creatework/creatework";
import Addmarks from "./Components/Screens/Profile/Addmarks/addmarks";
import Login from "./Components/Login/login";
import ClassworkDetails from './Components/Screens/Classwork/classworkDetails';
import { children } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState,useEffect } from 'react';
import {auth} from "./Firebase/firebase";
import { onAuthStateChanged } from 'firebase/auth';
function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true); // Loading state to wait for auth state change

    // Track user authentication state
    useEffect(() => { //session management
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setCurrentUser(user); // Set the user if logged in
        } else {
          setCurrentUser(null); // Set user to null if logged out
        }
        setLoading(false); // Stop loading after checking auth state
      });      
      return () => unsubscribe(); // Cleanup the listener on unmount
    }, []);
  
    const RequireAuth = ({ children }) => {  //protection from navigating anywhere
      return currentUser ? children : <Navigate to="/" />;
    };   
    console.log(currentUser)
    if (loading) {
      return <div>Loading...</div>; // Show loading screen until auth state is known
    }
 return (
<>
        <Router>
                    <Routes>
                    <Route path="/" element={<Login />} />
                        <Route path="/home" element={<RequireAuth><Homepage /></RequireAuth>} />
                        <Route path="/dashboard" element={<RequireAuth><Dashboard user={currentUser}/></RequireAuth>} />
                        <Route path="/teachers" element={<RequireAuth><Teachers /></RequireAuth>} />
                        <Route path="/students" element={<RequireAuth><Students /></RequireAuth>} />
                        <Route path="/classwork" element={<RequireAuth><Classwork /></RequireAuth>} />
                        <Route path="/attendance" element={<RequireAuth><Attendance /></RequireAuth>} />
                        <Route path="/people" element={<RequireAuth><People /></RequireAuth>} />
                        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
                        <Route path="/leave-school" element={<RequireAuth><LeaveSchool /></RequireAuth>} />
                        <Route path="/creatework" element={<RequireAuth><Creatework /></RequireAuth>} />
                        <Route path="/addmarks/:uid" element={<RequireAuth><Addmarks /></RequireAuth>} />
                        <Route path="/classwork/:classworkId" element={<RequireAuth><ClassworkDetails /></RequireAuth>} />
                        <Route path="/profile/:uid" element={<RequireAuth><Profile /></RequireAuth>} />
                        <Route path="/attendance/:uid" element={<RequireAuth><Attendance /></RequireAuth>} />

                    </Routes>
        </Router>
        <ToastContainer />
</>
  
  )
}

export default App;
