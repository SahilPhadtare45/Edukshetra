import React, { useState, useEffect } from "react";
import "./dashboard.css";
import Header from "../../Comman/header";
import Sidebar from "../../Comman/sidebar";
import PageInfo from "../../Comman/pageinfo";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAdd, faAnglesRight, faTrash, faClose, faChalkboardTeacher, faUsers, faClipboard } from "@fortawesome/free-solid-svg-icons";
import { useUserStore } from "../../../Firebase/userstore"; 
import { getDoc, doc, updateDoc, arrayRemove, onSnapshot, query, collection, where, orderBy, arrayUnion,getDocs  } from "firebase/firestore";
import { db } from "../../../Firebase/firebase";
import Addnotice from "../Dashboard/Addnotice/addnotice";
import Notice from "../Dashboard/Addnotice/notice.jsx"
import AddComplaints from "../Dashboard/Addcomplaints.jsx"; 

const Dashboard = () => {
    const { fetchSchoolData, schoolData } = useUserStore();
    const currentUser = useUserStore((state) => state.currentUser);
    const currentRole = useUserStore((state) => state.currentRole);
    const currentSchool = useUserStore((state) => state.currentSchool);
    const schoolId = currentSchool?.schoolId || undefined;
  
  console.log("Extracted schoolId:", schoolId);
      const [selectedClass, setSelectedClass] = useState("All");
    const [teacherCount, setTeacherCount] = useState(0);
    const [studentCount, setStudentCount] = useState(0);
    const [addMode, setAddMode] = useState(false);
    const [notices, setNotices] = useState([]);
    const [addnotices, setAddNotices] = useState(false);
    const [selectedNotice, setSelectedNotice] = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [addcomplaints, setAddComplaints] = useState(false);
    const [showComplaintList, setShowComplaintList] = useState(false);
const [selectedComplaint, setSelectedComplaint] = useState(null);
const [replyText, setReplyText] = useState("");

if (!schoolId) {
    console.error("No school ID found in schoolData!");
  } else {
    console.log("Extracted schoolId:", schoolId);
  }

  console.log("currentSchool:", currentSchool)

  
  
  const fetchComplaints = async () => {
    try {
        const schoolRef = doc(db, "schools", schoolId);
        const schoolSnap = await getDoc(schoolRef);
        if (schoolSnap.exists()) {
            const allComplaints = schoolSnap.data().complaints || [];
            console.log("All Complaints from Firestore:", allComplaints);
            // Filter complaints: Only admin and the sender can see their own complaints
            const filteredComplaints = currentRole?.toLowerCase() === "admin"
                ? allComplaints
                : allComplaints.filter(complaint => complaint.senderId === currentUser?.uid);

            setComplaints(filteredComplaints);
        }
    } catch (error) {
        console.error("Error fetching complaints:", error);
    }
};

  // Open Complaint Details
  const openComplaint = (complaint) => {
    setSelectedComplaint(complaint);
};

// Submit Reply
const handleReply = async () => {
    if (!selectedComplaint || !replyText) return;

    try {
        const schoolRef = doc(db, "schools", schoolId);
        const updatedReplies = [
            ...selectedComplaint.replies,
            { adminId: currentUser?.uid, message: replyText, timestamp: new Date() }
        ];

        await updateDoc(schoolRef, {
            complaints: complaints.map(comp =>
                comp.id === selectedComplaint.id ? { ...comp, replies: updatedReplies } : comp
            )
        });

        setReplyText("");
        setSelectedComplaint(null);
    } catch (error) {
        console.error("Error sending reply:", error);
    }
};


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
                setComplaints(snapshot.data().complaints || []);
            }
        });
    
        // Cleanup listener when component unmounts
        return () => unsubscribe();
    }, [schoolId])
    useEffect(() => {
        if (schoolId && currentUser && !schoolData) {
            fetchSchoolData(schoolId);
        }
    }, [schoolId, currentUser, schoolData]);
    
    return (
        <div className="dashboard">
            <Header />
            <Sidebar />
            <PageInfo />
            <div className="bg-con">
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
                            <select className="custom-dropdown"  onChange={(e) => setSelectedClass(e.target.value)}>
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

                
  {/* Complaints List Popup */}
  
                <div className="complaints-popup">
                    <div className="popup-header">
                        <h3>Complaints</h3>
                    </div>

                    <div className="addcomplaint">
                    {(currentRole === "Student" || currentRole === "Teacher") && (
                        <div className="addinput" style={{display:"flex",marginLeft:"2%"}}>
                        <FontAwesomeIcon
                            className="addicon"
                            icon={faAdd}
                            onClick={() => setAddComplaints((prev) => !prev)}
                            style={{height:"22px"}}
                        /> &nbsp;
                        <span>Add Complaint</span>
                        </div>
                    )}
                    </div>
                    <ul className="complaints-list">
                        {complaints.length > 0 ? (
                            complaints
                                .filter(
                                    (complaint) =>
                                        complaint.senderId === currentUser.uid || currentRole === "Admin"
                                )
                                .slice()
                                .reverse()
                                .map((complaint, index) => (
                                    <div key={complaint.id}>
                                        <li
                                            className={`complaint-row ${selectedComplaint?.id === complaint.id ? "selected" : ""}`}
                                            onClick={() => openComplaint(complaint)}
                                        >
                                            <span className="complaint-number">{index + 1}.</span>{" "}
                                            <div className="complaint-text text-truncate">{complaint.message}</div>
                                            <span className="complaint-date">
                                                {new Date(complaint.timestamp.seconds * 1000).toLocaleDateString()}
                                            </span>
                                        </li>
                                        <div className="underline" />
                                    </div>
                                ))
                        ) : (
                            <li>No complaints available</li>
                        )}
                    </ul>

                    
                    <div className="addcomp-compo">
                    {addcomplaints && <AddComplaints schoolId={schoolId} />}
                    </div>
                </div>
            

            {/* Complaint Details Popup */}
            {selectedComplaint && (
                <div className="complaint-bg">
                <div className="complaint-details-popup">
                <FontAwesomeIcon
                            icon={faClose}
                            className="close-icon"
                            onClick={() => setSelectedComplaint(null)}
                        />
                    <div className="popup-header1">

                        <div className="pop-title">Complaint Details</div>
                        
                    </div>
                    <div className="complaint-bg-con">
                    <p>
                        <strong>From:</strong> {selectedComplaint.senderEmail || "Unknown"}
                    </p>
                    <p>
                        <strong>Sender's Role:</strong> {selectedComplaint.senderRole}
                    </p>
                    <p>
                        <small>Complaint:</small> {selectedComplaint.message}
                    </p>

                    {/* Reply Box for Admin */}

                    {currentRole === "Admin" && (
                        <div >
                            <textarea id="customParagraphInput"
                            className="reply-box"
                                placeholder="Write a reply..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                required
                            />
                            <button className="snd-btn" onClick={handleReply}>Send Reply 
                                            <FontAwesomeIcon
                                            icon={faAnglesRight}
                                        
                                        /></button>
                        </div>
                    )}

                    {/* Replies Section */}
                    <div className="replies">
                        <h5>Replies</h5>
                        {selectedComplaint.replies?.length > 0 ? (
                            selectedComplaint.replies.map((reply, index) => (
                                <div key={index} className="reply text-truncate">
                                    <p>
                                        <strong>Admin:</strong> {reply.message}
                                    </p>
                                    <span style={{marginLeft:'2%'}}>
                                        {new Date(reply.timestamp.seconds * 1000).toLocaleString()}
                                    </span>
                                    <div className="btm-line"/>
                                </div>
                            ))
                        ) : (
                            <p>No replies yet.</p>
                        )}
                    </div>
                    </div>
                    
                </div>
                </div>
            )}

        
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
</div> 
    );
}
 
export default Dashboard;