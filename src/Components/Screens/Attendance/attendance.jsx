import './attendance.css';
import Header from "../../Comman/header";
import Sidebar from "../../Comman/sidebar";
import PageInfo from "../../Comman/pageinfo";
import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays, faCheck,faXmark } from '@fortawesome/free-solid-svg-icons';
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; 
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../../../Firebase/firebase"; // Ensure this path is correct based on your project structure
import { useUserStore } from '../../../Firebase/userstore';
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { useLocation } from 'react-router-dom';
import { useParams } from "react-router-dom";

const Attendance = () => {
        const [activeIndex, setActiveIndex] = useState(0);
        const [underlineStyle, setUnderlineStyle] = useState({});
        const navItemsRef = useRef([]);
        const calendarRef = useRef(null); // Ref for the calendar
        const toggleButtonRef = useRef(null); // Ref for the toggle button
        const [members, setMembers] = useState([]);
        const [selectedClass, setSelectedClass] = useState("1st"); 
        const [filteredStudents, setFilteredStudents] = useState([]);
        const classesList = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"];
        const { currentSchool, currentUser, currentRole } = useUserStore();

        const schoolId = currentSchool?.schoolId || undefined;
        const [attendance, setAttendance] = useState({});
        const [studentStatus, setStudentStatus] = useState({}); // Stores status per student
        const [isAttendanceMarked, setIsAttendanceMarked] = useState({}); // Track per class
        const [attendanceRecords, setAttendanceRecords] = useState([]);
        const [presentCount, setPresentCount] = useState(0);
        const [absentCount, setAbsentCount] = useState(0);

        const location = useLocation();
        const params = new URLSearchParams(location.search);
    const { uid } = useParams(); // ✅ Get UID from URL
const handleAttendanceChange = (studentId, status) => {
    setAttendance(prevState => ({
        ...prevState,
        [selectedClass]: {
            ...(prevState[selectedClass] || {}),
            [date.toDateString()]: {
                ...(prevState[selectedClass]?.[date.toDateString()] || {}),
                [studentId]: status
            }
        }
    }));

    setStudentStatus(prev => ({
        ...prev,
        [studentId]: status
    }));
};


const handleSubmitAttendance = async () => {
    if (!schoolId || !selectedClass) return;

    try {
        if (!attendance[selectedClass] || Object.keys(attendance[selectedClass]).length === 0) {
            alert("No attendance data to submit!");
            return;
        }

        // Ensure all students in the class are marked before submission
        const allMarked = filteredStudents.every(student => studentStatus[student.uid] !== undefined);
        if (!allMarked) {
            alert("Please mark attendance for all students before submitting.");
            return;
        }

        const schoolRef = doc(db, "schools", schoolId);
        const schoolSnap = await getDoc(schoolRef);

        if (!schoolSnap.exists()) {
            console.error("School document not found!");
            return;
        }

        const schoolData = schoolSnap.data();
        const formattedDate = date.toDateString(); // Convert date to a string format

        // **Update attendance for each student in the selected class**
        const updatedMembers = schoolData.members.map(member => {
            if (filteredStudents.some(student => student.uid === member.uid)) {
                let updatedAttendance = Array.isArray(member.attendance) ? [...member.attendance] : [];

                updatedAttendance.push({
                    Date: formattedDate,
                    Status: studentStatus[member.uid], // "Present" or "Absent"
                });
               

                return { ...member, attendance: updatedAttendance };
            }
            return member;
        });

        // Save updated attendance records to Firestore
        await setDoc(schoolRef, { members: updatedMembers }, { merge: true });

        // Store class attendance status separately
        const attendanceRef = doc(db, "attendance", schoolId);
        const attendanceSnap = await getDoc(attendanceRef);
        let attendanceData = attendanceSnap.exists() ? attendanceSnap.data() : {};

        if (!attendanceData[formattedDate]) {
            attendanceData[formattedDate] = {};
        }

        attendanceData[formattedDate][selectedClass] = true; // ✅ Mark attendance for this class

        await setDoc(attendanceRef, attendanceData, { merge: true });

        alert(`Attendance for ${selectedClass} updated successfully!`);

        // **Disable submit button if students exist in the class**
        setIsAttendanceMarked(prev => ({
            ...prev,
            [selectedClass]: filteredStudents.length > 0,
        }));

    } catch (error) {
        console.error("Error updating attendance:", error);
    }
};



        // Fetch members from Firestore
            const fetchMembers = async () => {
                if (!schoolId) return;
                try {
                    const schoolRef = doc(db, "schools", schoolId);
                    const schoolSnap = await getDoc(schoolRef);
                    if (schoolSnap.exists()) {
                        setMembers(schoolSnap.data().members || []);
                    }
                } catch (error) {
                    console.error("Error fetching members:", error);
                }
            };
        
            useEffect(() => {
                fetchMembers();
            }, [schoolId]);

            useEffect(() => {
                if (!Array.isArray(members)) return;
            
                console.log("Members before filtering:", members);
                console.log("Selected Class:", selectedClass);
            
                const filtered = members.filter(member => 
                    member.userRole === "Student" &&
                    member.classes?.some(cls => cls.className === selectedClass)
                );
            
                console.log("Filtered Students:", filtered);
                setFilteredStudents(filtered);
            }, [selectedClass, members]);
            
            
            
        const handleNavClick = (index, selectedClassName) => {
            setActiveIndex(index);
            setSelectedClass(selectedClassName);  // Ensure the selected class updates

        };
        useEffect(() => {
            if (navItemsRef.current[activeIndex]) {
                const { offsetLeft, offsetWidth } = navItemsRef.current[activeIndex];
                setUnderlineStyle({
                    left: offsetLeft, // Position relative to the parent container
                    width: offsetWidth, // Match the underline width to the active item
                });
            }
        }, [activeIndex]);

        useEffect(() => {
            console.log("Fetched Members:", members);
        }, [members]);
        
        console.log("Selected Class:", selectedClass);
console.log("Filtered Students:", filteredStudents);

            const [date, setDate] = useState(new Date());
            const [showCalendar, setShowCalendar] = useState(false); 
            const handleDateChange = (newDate) => {
              setDate(newDate);
            };
            const toggleCalendar = () => {
                setShowCalendar(!showCalendar); // Toggle the calendar visibility
                console.log(showCalendar); // Check if the state is toggling
            };

            const handleOutsideClick = (event) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target) && 
            toggleButtonRef.current && !toggleButtonRef.current.contains(event.target)) 
            {setShowCalendar(false); // Close the calendar when clicking outside
            }
    };
         
            useEffect(() => {
                document.addEventListener("click", handleOutsideClick);
                return () => {
                    document.removeEventListener("click", handleOutsideClick);
                };
            }, []);
              const [status, setStatus] = useState(""); // Track selected status
              // Function to handle background color based on selection
              const getBgColor = (studentUid) => {
                if (studentStatus[studentUid] === "Present") return "#6AA84F"; // Green for present
                if (studentStatus[studentUid] === "Absent") return "#E06666"; // Red for absent
                return "white"; // Default white
            };
            

            useEffect(() => {
                if (!schoolId) return;
            
                const attendanceRef = doc(db, "attendance", schoolId);
                const unsubscribe = onSnapshot(attendanceRef, (attendanceSnap) => {
                    if (attendanceSnap.exists()) {
                        const attendanceData = attendanceSnap.data();
                        const formattedDate = date.toDateString(); // Ensure date format is consistent
            
                        if (attendanceData[formattedDate]) {
                            console.log("Fetched Attendance Data:", attendanceData[formattedDate]); // Debugging log
                            setIsAttendanceMarked(attendanceData[formattedDate]); // Update state
                        } else {
                            setIsAttendanceMarked({}); // Reset if no record found
                        }
                    } else {
                        setIsAttendanceMarked({}); // Reset if no attendance document exists
                    }
                });
            
                return () => unsubscribe(); // Cleanup subscription
            }, [schoolId, date]); // Ensure this runs when `date` changes
            
            
            useEffect(() => {
                const fetchAttendance = async () => {
                    let userId = uid || currentUser?.uid; // Always prioritize uid from URL
                    if (!userId || !schoolId) return;

                    try {
                        const schoolRef = doc(db, "schools", schoolId);
                        const schoolSnap = await getDoc(schoolRef);
        
                        if (schoolSnap.exists()) {
                            const schoolData = schoolSnap.data();
                            const studentData = schoolData.members.find(member => member.uid === userId);
        
                            if (studentData && Array.isArray(studentData.attendance)) {
                                setAttendanceRecords(studentData.attendance);
        
                                let present = 0, absent = 0;
                                studentData.attendance.forEach(record => {
                                    if (record.Status === "Present") {
                                        present++;
                                    } else if (record.Status === "Absent") {
                                        absent++;
                                    }
                                });
        
                                setPresentCount(present);
                                setAbsentCount(absent);
                            } else {
                                setAttendanceRecords([]); // If no attendance data
                            }
                        }
                    } catch (error) {
                        console.error("Error fetching attendance:", error);
                    }
                };
        
                fetchAttendance();
            }, [uid, schoolId, currentUser, currentRole]);
            // Data for Pie Chart
    const totalAttendance = presentCount + absentCount;
    const chartData = [
        { name: "Present", value: presentCount },
        { name: "Absent", value: absentCount },
    ];

    const COLORS = ["#00C49F", "#FF4848"]; // Green for Present, Red for Absent
            console.log("currentRole",currentRole)

            const isViewingOwnAttendance = !uid || currentUser?.uid === uid; // If no uid in URL, user is viewing own attendance
            const isAdminOrTeacher = currentRole === "Admin" || currentRole === "Teacher";
            
            // Admin/Teacher should see Contain only if they are viewing their own attendance
            const showContain = isAdminOrTeacher && isViewingOwnAttendance;
            
            // Contain1 should be shown if a student is viewing their own attendance OR an Admin/Teacher is viewing a student's attendance
            const showContain1 = !showContain;
            
            console.log("showContain:", showContain);
            console.log("showContain1:", showContain1);
            console.log("currentRole:", currentRole);
            console.log("isViewingOwnAttendance:", isViewingOwnAttendance);
            console.log("URL uid:", uid);
            console.log("Current User UID:", currentUser?.uid);
               

    return ( 
        <div className='attendancepage'>
            <Header/>
            <Sidebar/>
            <PageInfo/>
            <div className='attendance'>
            {showContain ? (
            <div className='contain'>
                <div className='navdiv'>
                    <nav className="navbar navbar-expand-lg">                
                        <div className="container-fluid">
                            <ul className="navbar-nav">
                                {classesList.map((item, index) => (
                                    <li
                                        key={index}
                                        className={`nav-item navtext ${activeIndex === index ? "active" : ""}`}
                                        ref={(el) => (navItemsRef.current[index] = el)}
                                        onClick={() => handleNavClick(index, item)}
                                    >
                                        <a className="nav-link" href="#">{item}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="active-underline md-none" style={underlineStyle}></div>
                    </nav>
                    </div> 
                    <div className='stu'>   
                    <button 
                            className="attendance-submit" 
                            onClick={handleSubmitAttendance} 
                            disabled={isAttendanceMarked[selectedClass]} // ✅ Disable only for the selected class
                        >
                            Upload Attendance
                        </button>
                        <div className='tr'>     
                            <p>Students</p>
                        </div>
                        
                        {isAttendanceMarked[selectedClass] && (
                            <div className="attendance-marked-message">
                            ✅ Attendance is marked for {selectedClass}.
                            </div>
                        )}

                    <div className='table_title' style={{display:"flex"}}>
                    {filteredStudents.length === 0 ? (
                        <p></p>
                    ) : (
                        <div style={{marginLeft:'8%',marginTop:'1%',fontWeight:'bold'}}>Name</div>
                    )}                    
                    </div>

                    <div className='stu_section'>
                        {filteredStudents.length === 0 ? (
                            <p>No students found in this class.</p>
                        ) : (
                            
                                filteredStudents.map((student) => (
                                    <div className='table_row' key={student.uid}> {/* Use student.uid as key */}
                                        <ul className="list-group list-group-flush llist">
                                            <li className="li-item">
                                                <div className="item-text text-truncate">{student.username}</div>
                                                <div 
                                                    className='radiobtn' 
                                                    style={{ backgroundColor: getBgColor(student.uid) }} // Change to student.uid
                                                >
                                                    <label className='lab' >
                                                    <input 
                                                        type="radio" 
                                                        name={`attendance_${student.uid}`}  
                                                        value="present" 
                                                        checked={studentStatus[student.uid] === "Present"}
                                                        onChange={() => handleAttendanceChange(student.uid, "Present")}
                                                        disabled={isAttendanceMarked[selectedClass]} 
                                                    /> Present

                                                    <input 
                                                        style={{ marginLeft: "20px" }}
                                                        type="radio" 
                                                        name={`attendance_${student.uid}`}  
                                                        value="absent" 
                                                        checked={studentStatus[student.uid] === "Absent"}
                                                        onChange={() => handleAttendanceChange(student.uid, "Absent")}
                                                        disabled={isAttendanceMarked[selectedClass]} // ✅ Disable only for the selected class
                                                    /> Absent
                                                    </label>
                                                </div>                              
                                            </li>
                                            <div className='navbarline1'/>
                                        </ul>
                                    </div> 
                                ))
                            )}
                    </div>
                        
                    </div>
            </div>

            ) : (
                <div className='contain1'>
                  <h2 className='OV-txt'>Attendance Overview</h2>
                    <div className='pie'>
                                {/* Pie Chart for Attendance */}
                        {attendanceRecords.length > 0 ? (
                            <PieChart width={700} height={500}>
                            {/* Background Donut Pie */}
                            <Pie
                                data={[{ name: "Total", value: totalAttendance }]}
                                cx="25%"
                                cy="40%"
                                innerRadius={70}
                                outerRadius={100}
                                fill="#E8E8E8"
                                dataKey="value"
                            >
                                <Cell fill="rgba(0, 0, 0, 0.4)" />
                            </Pie>
        
                            {/* Main Attendance Pie */}
                            <Pie
                                data={chartData}
                                cx="25%"
                                cy="40%"
                                innerRadius={100}
                                outerRadius={150}
                                dataKey="value"
                                label
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
        
                            <Tooltip />
                            <Legend
                                layout="vertical"
                                verticalAlign="top"
                                align="right"
                                payload={chartData.map((item, index) => ({
                                    value: `${item.name} (${item.value})`,
                                    type: "square",
                                    color: COLORS[index % COLORS.length],
                                }))}
                            />
                        </PieChart>
                        ) : (
                            <p>No attendance records available.</p>
                        )}
                    </div>
                    <div className='attendance-data'>
                                <h4>Attendance Records</h4>
                                {attendanceRecords.length > 0 ? (
                                    <table>
                                        <thead>
                                            <tr>                                        
                                                <div className='tb-header'>
                                                    <th>Date</th>                                                                                   
                                                </div>
                                                <div className='tb-header1'>
                                                    <th>Status</th>
                                                </div>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {attendanceRecords.map((record, index) => (
                                                <tr key={index}>
                                                    <div className='data-row'>
                                                    <td className="row1">{record.Date}</td>
                                                    <td className="row2">{record.Status}</td>
                                                    <div className='line'></div>
                                                    </div>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p>No attendance records available.</p>
                                )}
                            </div>
                        </div>
                
            )} 
                          
                
            </div>
        </div>
     );
}
 
export default Attendance;