import "./teachers.css";
import Header from "../../Comman/header";
import Sidebar from "../../Comman/sidebar";
import PageInfo from "../../Comman/pageinfo";
import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus, faTrash, faUser } from "@fortawesome/free-solid-svg-icons";
import Addteachers from "./Addteachers/addteachers";
import { useUserStore } from "../../../Firebase/userstore";
import { db } from "../../../Firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const Teachers = () => {
    const [members, setMembers] = useState([]);
    const [filteredTeachers, setFilteredTeachers] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [selectedClass, setSelectedClass] = useState("1st");
    const [underlineStyle, setUnderlineStyle] = useState({});
    const navItemsRef = useRef([]);
    const [addTrpage, setAddTrpage] = useState(false);
    const { currentSchool } = useUserStore();
    const schoolId = currentSchool?.schoolId || undefined;


    const classesList = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"];
    const { currentUser } = useUserStore(); // Assuming Zustand store has currentUser data



    // Fetch members from Firestore
    const fetchMembers = async () => {
        console.log("🔄 fetchMembers function triggered!"); // 🔥 Check if function runs
    
        console.log("Current schoolId:", schoolId); // 🔍 Log schoolId
        if (!schoolId) {
            console.log("❌ No schoolId found! Exiting function."); 
            return;
        }
    
        try {
            const schoolRef = doc(db, "schools", schoolId);
            console.log("Fetching from Firestore with ref:", schoolRef.path); // 🔥 If this doesn’t log, we have a problem
    
            const schoolSnap = await getDoc(schoolRef);
    
            if (schoolSnap.exists()) {
                console.log("Firestore school data:", schoolSnap.data()); // 🔥 Should log the document data
                setMembers([]);
                setMembers(schoolSnap.data().members || []);
            } else {
                console.log("❌ No school found in Firestore!");
            }
        } catch (error) {
            console.error("🔥 Error fetching members:", error);
        }
    };
    
    


    useEffect(() => {
        console.log("useEffect triggered with schoolId:", schoolId); // 🔍 Debug log
        fetchMembers();
    }, [schoolId]);
    
    console.log("🔍 Current User:", currentUser);
    console.log("🔍 Current User Role:", currentUser?.userRole);
    console.log("🔍 Current School:", currentSchool);
    
    // Filter teachers when class selection changes
    useEffect(() => {
        const filtered = members.filter(member => 
            member.userRole === "Teacher" && 
            member.classes && // Ensure classes exist
            Array.isArray(member.classes) && 
            member.classes.includes(selectedClass)
        );
        console.log(`Filtered teachers for ${selectedClass}:`, filtered);
        setFilteredTeachers(filtered);
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

    
    const removeTeacherFromClass = async (teacherId) => {
        if (currentSchool.userRole !== "Admin") {
            alert("You do not have permission to remove members!");
            return;
        }
    
        if (!currentSchool || !currentSchool.schoolId) {
            console.log("No school selected.");
            return;
        }
    
        try {
            // 🔥 Step 1: Fetch school data
            const schoolRef = doc(db, "schools", currentSchool.schoolId);
            const schoolSnap = await getDoc(schoolRef);
    
            if (!schoolSnap.exists()) {
                console.log("❌ No school found in Firestore!");
                return;
            }
    
            const schoolData = schoolSnap.data();
    
            // 🔥 Step 2: Remove teacher from school's members list
            const updatedMembers = schoolData.members.map((member) => {
                if (member.memberId === teacherId) {
                    const updatedClasses = member.classes?.filter((cls) => cls !== selectedClass) || [];
    
                    return {
                        ...member,
                        classes: updatedClasses,
                        userRole: updatedClasses.length > 0 ? "Teacher" : "Guest",
                    };
                }
                return member;
            });
    
            // 🔥 Step 3: Update the schools collection
            await setDoc(schoolRef, { members: updatedMembers }, { merge: true });
    
            // 🔥 Step 4: Update the users collection
            const userRef = doc(db, "Users", teacherId);
            const userSnap = await getDoc(userRef);
    
            if (userSnap.exists()) {
                const userData = userSnap.data();
                const updatedUserClasses = userData.classes?.filter((cls) => cls !== selectedClass) || [];
    
                await setDoc(userRef, { classes: updatedUserClasses }, { merge: true });
            }
    
            // ✅ Step 5: Update local state
            setMembers(updatedMembers);
            setFilteredTeachers(
                updatedMembers.filter((member) => member.userRole === "Teacher" && member.classes?.includes(selectedClass))
            );
    
            console.log(`✅ Teacher ${teacherId} removed from ${selectedClass} in both collections.`);
        } catch (error) {
            console.error("🔥 Error removing teacher:", error);
        }
    };
    
    
    return (
        <div className="teacherscreen">
            <Header />
            <Sidebar />
            <PageInfo />
            <div className="contain">
                <nav className="navbar navbar-expand-lg">
                    <div className="container-fluid">
                        <ul className="navbar-nav">
                            <button
                                className="navbar-toggler"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target="#navbarSupportedContent"
                                aria-controls="navbarSupportedContent"
                                aria-expanded="false"
                                aria-label="Toggle navigation"
                            >
                                <span className="navbar-toggler-icon"></span>
                            </button>
                            <div className="collapse navbar-collapse" id="navbarSupportedContent">
                                {classesList.map((item, index) => (
                                    <li
                                        key={index}
                                        className={`nav-item navtext ${activeIndex === index ? "active" : ""}`}
                                        ref={(el) => (navItemsRef.current[index] = el)}
                                        onClick={() => handleNavClick(index, item)}
                                    >
                                        <a className="nav-link" href="#">
                                            {item}
                                        </a>
                                    </li>
                                ))}
                            </div>
                        </ul>
                    </div>
                    <div className="active-underline md-none" style={underlineStyle}></div>
                </nav>
                <div className="navbar-line"></div>
                <div className="tr">
                    <p>Teachers</p>
                </div>
                <div className="cricon">
                    <FontAwesomeIcon className="adicon" onClick={() => setAddTrpage((prev) => !prev)} icon={faUserPlus} />
                </div>
                {addTrpage && <Addteachers schoolId={currentSchool?.schoolId} />}
                <div className="table_title" style={{ display: "flex" }}>
                    <div style={{ marginLeft: "4%", marginTop: "1%", fontWeight: "bold" }}>Name</div>
                    <div style={{ marginLeft: "44%", marginTop: "1%", fontWeight: "bold" }}>Subjects</div>
                </div>

                <div className="tr_section">
                    {filteredTeachers.length > 0 ? (
                        filteredTeachers.map((teacher) => (
                            <div key={teacher.memberId} className="table_row">
                                <ul className="list-group list-group-flush llist">
                                    <li className="li-item">
                                        <div className="item-text text-truncate">{teacher.email}</div>
                                        <div className="sub_name text-truncate">{teacher.subjects || "Not Assigned"}</div>
                                        <FontAwesomeIcon className="prof_icon" icon={faUser} />
                                        {currentSchool.userRole === "Admin" && (
                                            <FontAwesomeIcon
                                                className="trash_icon"
                                                icon={faTrash}
                                                onClick={() => removeTeacherFromClass(teacher.memberId)}
                                            />
                                        )}
                                    </li>
                                </ul>
                                <div className="navbar-line1"></div>
                            </div>
                        ))
                    ) : (
                        <p style={{ textAlign: "center", marginTop: "20px" }}>No teachers assigned to {selectedClass} yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Teachers;
