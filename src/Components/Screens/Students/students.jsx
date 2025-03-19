import "./students.css";
import Header from "../../Comman/header";
import Sidebar from "../../Comman/sidebar";
import PageInfo from "../../Comman/pageinfo";
import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus, faTrash, faUser } from "@fortawesome/free-solid-svg-icons";
import AddStudents from "../Students/Addstudents/addstudents";
import { useUserStore } from "../../../Firebase/userstore";
import { db } from "../../../Firebase/firebase";
import { doc, getDoc, setDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Students = () => {
    const [members, setMembers] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [selectedClass, setSelectedClass] = useState("1st");
    const [underlineStyle, setUnderlineStyle] = useState({});
    const navItemsRef = useRef([]);
    const [addStudentPage, setAddStudentPage] = useState(false);
    const { currentSchool, currentUser, currentRole } = useUserStore();
    const schoolId = currentSchool?.schoolId || undefined;
    const navigate = useNavigate(); // ✅ React Router Navigation

    const classesList = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"];

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
        if (!members || !Array.isArray(members)) return;
    
        const filtered = members
            .filter(member => 
                member.userRole === "Student" &&
                Array.isArray(member.classes) &&
                member.classes.some(cls => cls.className === selectedClass) // Check if class exists
            )
            .map(student => {
                // Extract the roll number for the selected class
                const classData = student.classes.find(cls => cls.className === selectedClass);
                return {
                    ...student,
                    rollNo: classData ? classData.rollNo : "N/A" // Set correct roll number
                };
            });
    
        setFilteredStudents(filtered);
    }, [selectedClass, members]);
    

    const handleNavClick = (index, className) => {
        setActiveIndex(index);
        setSelectedClass(className);
    };

    useEffect(() => {
        if (navItemsRef.current[activeIndex]) {
            const { offsetLeft, offsetWidth } = navItemsRef.current[activeIndex];
            setUnderlineStyle({ left: offsetLeft, width: offsetWidth });
        }
    }, [activeIndex]);


    const removeStudent = async (studentId) => {
        if (!currentSchool || !schoolId) return;
    
        try {
            const schoolRef = doc(db, "schools", schoolId);
            const schoolSnap = await getDoc(schoolRef);
            if (!schoolSnap.exists()) return;
    
            const schoolData = schoolSnap.data();
            const updatedMembers = schoolData.members.map(member => {
                if (member.memberId === studentId) {
                    // Remove only the selected class
                    const updatedClasses = (member.classes || []).filter(cls => cls.className !== selectedClass);
    
                    return {
                        ...member,
                        classes: updatedClasses,
                        userRole: updatedClasses.length === 0 ? "Guest" : "Student",
                    };
                }
                return member;
            });
    
            // Update Firestore 'schools' collection
            await updateDoc(schoolRef, { members: updatedMembers });
    
            // Update user document in 'Users' collection
            const userRef = doc(db, "Users", studentId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                let userData = userSnap.data();
                let updatedUserClasses = (userData?.schoolData?.[schoolId]?.classes || []).filter(cls => cls !== selectedClass);
    
                let updateFields = {
                    [`schoolData.${schoolId}.classes`]: updatedUserClasses,
                };
    
                if (updatedUserClasses.length === 0) {
                    updateFields["userRole"] = "Guest";
                    updateFields[`schoolData.${schoolId}.className`] = null;
                    updateFields[`schoolData.${schoolId}.rollNo`] = null;
                }
    
                await updateDoc(userRef, updateFields);
            }
    
            // Update state to reflect changes
            setMembers(updatedMembers);
        } catch (error) {
            console.error("Error removing student:", error);
        }
    };
    
    

    useEffect(() => {
        if (!schoolId) return;
        const schoolRef = doc(db, "schools", schoolId);
        const unsubscribe = onSnapshot(schoolRef, (schoolSnap) => {
            if (schoolSnap.exists()) {
                setMembers(schoolSnap.data().members || []);
            }
        });
        return () => unsubscribe();
    }, [schoolId]);
    console.log("Current User:", currentUser);
    console.log("Current Role:", currentRole);

    return (
        <div className="studentscreen">
            <Header />
            <Sidebar />
            <PageInfo />
            <div className="contain">
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
                <div className="navbar-line"></div>
                <div className="tr">
                    <p>Students</p>
                </div>
                {(currentRole === "Admin" || currentRole === "Teacher") && (
                    <div className="cricon">
                        <FontAwesomeIcon className="adicon" onClick={() => setAddStudentPage((prev) => !prev)} icon={faUserPlus} />
                    </div>
                )}
                {addStudentPage && <AddStudents schoolId={schoolId} />}
                <div className="table_title" style={{ display: "flex" }}>
                    <div style={{ marginLeft: "4%", marginTop: "1%", fontWeight: "bold" }}>Name</div>
                    <div style={{ marginLeft: "44%", marginTop: "1%", fontWeight: "bold" }}>Email-ID</div>
                </div>
                <div className="tr_section">
                    {filteredStudents.length > 0 ? (
                        filteredStudents.map((student) => (
                            <div key={student.memberId} className="table_row">
                                <ul className="list-group list-group-flush llist">
                                    <li className="li-item">
                                        <div className="item-text">{student.username}</div>
                                        <div className="sub_name text-truncate"> {student.email}</div>
                                        <FontAwesomeIcon className="prof_icon" onClick={() => navigate(`/profile/${student.uid}`)} icon={faUser} />
                                        {(currentRole === "Admin" || currentRole === "Teacher") && (
                                            <FontAwesomeIcon
                                                className="trash_icon"
                                                icon={faTrash}
                                                onClick={() => removeStudent(student.memberId)}
                                            />
                                        )}
                                    </li>
                                </ul>
                                <div className="navbar_line"></div>

                            </div>
                        ))
                    ) : (
                        <p style={{ textAlign: "center", marginTop: "20px" }}>No students in {selectedClass} yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Students;
