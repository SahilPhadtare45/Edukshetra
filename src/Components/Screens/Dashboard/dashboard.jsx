import React, { useState, useEffect } from "react";
import "./dashboard.css";
import Header from "../../Comman/header";
import Sidebar from "../../Comman/sidebar";
import PageInfo from "../../Comman/pageinfo";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAdd, faAnglesRight, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useParams } from "react-router-dom";
import { useUserStore } from "../../../Firebase/userstore"; 
import { getDoc, doc, updateDoc, arrayRemove, onSnapshot  } from "firebase/firestore";
import { db } from "../../../Firebase/firebase";
import Addnotice from "../Dashboard/Addnotice/addnotice";
import Notice from "../Dashboard/Addnotice/notice.jsx"
const Dashboard = () => {
    const { currentSchool, fetchSchoolData, schoolData } = useUserStore();
    const currentUser = useUserStore((state) => state.currentUser);
    const currentRole = useUserStore((state) => state.currentRole);
    
    const schoolId = currentSchool?.schoolId || undefined;
    const [selectedClass, setSelectedClass] = useState("All");
    const [teacherCount, setTeacherCount] = useState(0);
    const [studentCount, setStudentCount] = useState(0);
    const [addMode, setAddMode] = useState(false);
    const [notices, setNotices] = useState([]);
    const [addnotices, setAddNotices] = useState(false);
    const [selectedNotice, setSelectedNotice] = useState(null);

    const handleNoticeClick = (notice) => {
        console.log("Clicked Notice:", notice); // Debugging

        setSelectedNotice(notice);
        setAddNotices(true);
    };
    
    const handleClosePopup = () => {
        setAddNotices(false);
        setSelectedNotice(null);
    };
    useEffect(() => {
        if (schoolId && currentUser) {
            fetchSchoolData(schoolId);
        }
    }, [schoolId, currentUser]);

    // Get dropdown options
    const getDropdownOptions = () => {
        return ["All", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"];
    };  
    

    // Function to calculate teacher and student count
    // Function to calculate teacher and student count
    useEffect(() => {
        if (!schoolData?.members || !currentUser) return;
    
        let teachers = 0;
        let students = 0;
    
        if (currentRole === "Admin") {
            // Count total teachers and students
            teachers = schoolData.members.filter(m => m.userRole === "Teacher").length;
            students = schoolData.members.filter(m => m.userRole === "Student").length;
    
            // Filter based on selected class
            if (selectedClass !== "All") {
                students = schoolData.members.filter(m => 
                    m.userRole === "Student" && m.classes.some(c => c.className === selectedClass)
                ).length;
    
                teachers = schoolData.members.filter(m => 
                    m.userRole === "Teacher" && m.classes.some(c => c.className === selectedClass)
                ).length;
            }
        } 
        
        else if (currentRole === "Teacher") {
            const teacher = schoolData.members.find(m => m.uid === currentUser?.uid);
            if (!teacher || !teacher.classes) return;
        
            if (selectedClass === "All") {
                // Count all students and teachers in the school
                students = schoolData.members.filter(m => m.userRole === "Student").length;
                teachers = schoolData.members.filter(m => m.userRole === "Teacher").length;
            } else {
                // Count students in the selected class
                students = schoolData.members.filter(m => 
                    m.userRole === "Student" && m.classes.some(c => c.className === selectedClass)
                ).length;
        
                // Count teachers in the selected class
                teachers = schoolData.members.filter(m => 
                    m.userRole === "Teacher" && m.classes.some(c => c.className === selectedClass)
                ).length;
            }
        } 
        
        else if (currentRole === "Student") {
            const student = schoolData.members.find(m => m.uid === currentUser?.uid);
            if (!student) return;
        
            const studentClass = student.classes[0]?.className; 
        
            students = schoolData.members.filter(m => 
                m.userRole === "Student" && m.classes.some(c => c.className === studentClass)
            ).length;
        
            teachers = schoolData.members.filter(m => 
                m.userRole === "Teacher" && m.classes.some(c => c.className === studentClass)
            ).length; // Fix: Use student's class instead of selectedClass
        }
        setTeacherCount(teachers);
        setStudentCount(students);
    }, [selectedClass, schoolData, currentUser, currentRole]);
    
    console.log("School Data:", currentSchool);
    console.log("Current Role:", currentRole);
    console.log("Dropdown Options:", getDropdownOptions());
    console.log("Members Data:", currentSchool?.members);
    console.log("Current User:", currentUser);
    useEffect(() => {
        if (schoolId) {
            fetchNotices();
        }
    }, [schoolId]);

    // 🔥 Fetch Notices from Firestore
    const fetchNotices = async () => {
        try {
            const schoolRef = doc(db, "schools", schoolId);
            const schoolSnap = await getDoc(schoolRef);
            if (schoolSnap.exists()) {
                setNotices(schoolSnap.data().notices || []);
            }
        } catch (error) {
            console.error("Error fetching notices:", error);
        }
    };

   

const filteredNotices = notices.filter((notice) => {
    return (
        notice.to === "All" ||  // Show to everyone
        notice.to === currentRole ||  // Show to specific role (Teacher/Student)
        (notice.to === "Teacher" && currentRole === "Admin") || // Ensure Admins also see teacher notices
        (notice.to === "Student" && currentRole === "Admin") // Ensure Admins also see studnt notices
    );
});


    // 🔥 Handle Delete Notice
    const handleDeleteNotice = async (notice) => {
        try {
            const schoolRef = doc(db, "schools", schoolId);
            await updateDoc(schoolRef, {
                notices: arrayRemove(notice), // Remove the selected notice
            });
            setNotices((prev) => prev.filter((n) => n !== notice)); // Update UI
        } catch (error) {
            console.error("Error deleting notice:", error);
        }
    };
    useEffect(() => {
        if (!schoolId) return;
    
        const schoolRef = doc(db, "schools", schoolId);
    
        // 🔥 Real-time listener for notices
        const unsubscribe = onSnapshot(schoolRef, (snapshot) => {
            if (snapshot.exists()) {
                setNotices(snapshot.data().notices || []);
            }
        });
    
        // Cleanup listener when component unmounts
        return () => unsubscribe();
    }, [schoolId])
    return (
        <div className="dashboard">
            <Header />
            <Sidebar />
            <PageInfo />

            <div className="classes">
                <div className="classes-title">Classes</div>
                <div className="class-no">
                {currentRole === "Student" ? (
                    <div className="class-display">
                    {schoolData?.members?.some(member => member.uid === currentUser?.uid)
                        ? (schoolData.members.find(member => member.uid === currentUser?.uid)?.classes?.[0]?.className || "--")
                        : "--"}
                </div>
                    ) : (
                        <div className="class-dropdowns">
                            <select onChange={(e) => setSelectedClass(e.target.value)}>
                                {getDropdownOptions().map((classItem, index) => (
                                    <option key={index} value={classItem}>
                                        {classItem}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

            </div>

            <div className="teachers">
                <div className="teachers-title">Teachers</div>
                <div className="teachers-no">{teacherCount > 0 ? teacherCount : "--"}</div>
            </div>

            <div className="students">
                <div className="students-title">Students</div>
                <div className="students-no">{studentCount > 0 ? studentCount : "--"}</div>
                </div>

            <div className="complaints">
                <div className="complaints-title"> Complaints</div>
                <div className="complaints-no">2</div>
            </div>
        
    <div className="notice">
        <div className="notice-header">
            <div className="notice-title">Notice</div>
            {currentRole === "Admin" && (
            <FontAwesomeIcon className="nicon" icon={faAdd} onClick={() => setAddMode((prev) => !prev)} />
            )}
        </div>
        {addMode && <Addnotice schoolId={schoolId} />}

        <div className="notice-list">
                    <ul className="list-group list-group-flush">
                        {filteredNotices.length > 0 ? (
                            filteredNotices.map((notice, index) => (
                                <>
                                <li key={index} className="list-group-item item" onClick={() => handleNoticeClick(notice)}>
                                    <div className="item-text text-truncate">{notice.text}</div>
                                    {(currentRole === "Admin") ? (
                                        <FontAwesomeIcon
                                            className="icon"
                                            icon={faTrash}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteNotice(notice);
                                            }}
                                        />
                                    ) : (
                                        <FontAwesomeIcon
                                            className="icon"
                                            icon={faAnglesRight}
                                        
                                        />
                                    )}
                                    <div className="notice-time">
                                    {notice.timestamp
                                        ? new Date(notice.timestamp.seconds * 1000).toLocaleDateString("en-GB", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                        })
                                        : "Invalid Date"}                                  
                                    </div>
                                </li>
                                <div className="under-line"/>
                                </>
                            ))
                        ) : (
                            <li className="list-group-item">No notices available</li>
                        )}
                    </ul>
                </div>
            {/* Show Notice Popup if a notice is selected */}
        {addnotices && <Notice notice={selectedNotice} onClose={handleClosePopup} />}
    </div>
</div> 
    );
}
 
export default Dashboard;