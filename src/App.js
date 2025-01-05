import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
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
function App() {
  return (
<>
        <Router>
                    <Routes>
                    <Route path="/" element={<Login />} />
                        <Route path="/home" element={<Homepage />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/teachers" element={<Teachers />} />
                        <Route path="/students" element={<Students />} />
                        <Route path="/classwork" element={<Classwork />} />
                        <Route path="/attendance" element={<Attendance />} />
                        <Route path="/people" element={<People />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/leave-school" element={<LeaveSchool />} />
                        <Route path="/creatework" element={<Creatework />} />
                        <Route path="/addmarks" element={<Addmarks />} />
                    </Routes>
        </Router>
  
</>
  
  )
}

export default App;
