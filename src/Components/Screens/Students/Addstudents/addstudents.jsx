import "./addstudents.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark, faSearch } from "@fortawesome/free-solid-svg-icons";
import React, { useState, useEffect } from "react";
import { getDoc, updateDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../../Firebase/firebase";
import acclogo from "../../../../images/acclogo.png";
import { useUserStore } from "../../../../Firebase/userstore";

const AddStudents = ({ schoolId }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedClasses, setSelectedClasses] = useState(null);
    const { currentSchool } = useUserStore();
    const [members, setMembers] = useState([]);
    const [filteredMembers, setFilteredMembers] = useState([]);
    const currentRole = useUserStore((state) => state.currentRole);
    const [classOptions, setClassOptions] = useState([]);
    const currentUser = useUserStore((state) => state.currentUser);
    const { fetchRoleForSchool,setRole } = useUserStore();
    useEffect(() => {
        fetchMembers();
    }, [currentSchool]);

    

    const fetchMembers = async () => {
        if (!currentSchool || !currentSchool.schoolId) {
            console.log("No school selected.");
            return;
        }

        try {
            const schoolRef = doc(db, "schools", currentSchool.schoolId);
            const schoolSnap = await getDoc(schoolRef);

            if (schoolSnap.exists()) {
                const schoolData = schoolSnap.data();
                const fetchedMembers = schoolData.members || [];
               // Only assign the class field for students
            const updatedMembers = fetchedMembers.map(member => {
                if (member.userRole === "Student") {
                    return { ...member, class: member.class || "Not Assigned" }; // Default class if missing
                }
                return member; // Don't touch class field for non-student users
            });
                setMembers(fetchedMembers);
                setFilteredMembers(fetchedMembers);
            } else {
                console.log("No such school exists!");
            }
        } catch (error) {
            console.error("Error fetching members:", error.message);
        }
    };

    const handleSearch = () => {
        
    
        const matchedUsers = members.filter(member =>
            member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    
        if (matchedUsers.length === 0) {
            alert("No users found with this email.");
        } 
    
        setFilteredMembers(matchedUsers);
    };

    const selectUser = (user) => {
        if (!user || (!user.memberId && !user.uid)) {
            alert("Error: User data is incomplete.");
            return;
        }

        if (user.userRole === "Teacher") {
            alert("A teacher cannot be added as a student.");
            return;
        }

        setSelectedUser(user);
        setSearchTerm(user.email);
        setFilteredMembers([]);
    };

    const handleSubmit = async () => {
        console.log("Submitting Student Assignment...");
        console.log("School ID:", schoolId);
        console.log("Selected User:", selectedUser);
        console.log("Selected Classes:", selectedClasses);
    
        if (!selectedUser || !selectedUser.uid) {
            alert("Please select a user before submitting.");
            return;
        }
    
        if (!schoolId) {
            alert("Error: School ID is missing.");
            return;
        }
    
        if (!selectedClasses || selectedClasses.length === 0) {
            alert("Please select a class.");
            return;
        }
    
        try {
            const schoolRef = doc(db, "schools", schoolId);
            const schoolSnap = await getDoc(schoolRef);
            const userRef = doc(db, "Users", selectedUser.uid);
            const userSnap = await getDoc(userRef);
    
            if (!schoolSnap.exists() || !userSnap.exists()) {
                console.error("Error: School or User document not found.");
                return;
            }
    
            const schoolData = schoolSnap.data();
            const userData = userSnap.data();
    
             // **Check if the student is already assigned to any class**
        const existingMember = schoolData.members.find(member => member.uid === selectedUser.uid);
        if (existingMember && existingMember.classes && existingMember.classes.length > 0) {
            alert(`This student is already assigned to class: ${existingMember.classes.map(c => c.className).join(", ")}.`);
            return;
        }
        
            // --- Updating Schools Collection ---
            const updatedMembers = schoolData.members.map(member => {
                if (member.uid === selectedUser.uid) {
                    let memberClasses = member.classes || [];
    
                    const newClasses = selectedClasses.map(cls => {
                        const studentsInClass = schoolData.members.filter(m => 
                            m.classes?.some(c => c.className === cls)
                        );
    
                        const existingClass = memberClasses.find(c => c.className === cls);
                        return existingClass || { className: cls };
                    });
    
                    return {
                        ...member,
                        userRole: "Student",
                        classes: [...memberClasses, ...newClasses]
                    };
                }
                return member;
            });
    
            // --- Updating Users Collection ---
            const updatedSchoolData = userData.schoolData.map(school => {
                if (school.schoolId === schoolId) {
                    let schoolClasses = school.classes || [];
    
                    const newClasses = selectedClasses.map(cls => {
                        const studentsInClass = updatedMembers.filter(m =>
                            m.classes?.some(c => c.className === cls)
                        );
    
                        const existingClass = schoolClasses.find(c => c.className === cls);
                        return existingClass || { className: cls };
                    });
    
                    return {
                        ...school,
                        userRole: "Student",
                        classes: [...schoolClasses, ...newClasses]
                    };
                }
                return school;
            });
    
            await updateDoc(schoolRef, { members: updatedMembers });
            await updateDoc(userRef, { schoolData: updatedSchoolData });
            
            console.log("Updated school members and user schoolData:", updatedMembers, updatedSchoolData);
            alert("Student assigned successfully!");
            setIsVisible(false);
    
            fetchMembers(); // Refresh the data
        } catch (error) {
            console.error("Error updating student:", error.message);
            alert(`Error assigning student: ${error.message}`);
        }
    };
          
    
    const handleClose = () => {
        setIsVisible(false);
    };


// Real-time listener for class options
useEffect(() => {
    if (!currentSchool || !currentSchool.schoolId) return;

    const schoolRef = doc(db, "schools", currentSchool.schoolId);

    const unsubscribe = onSnapshot(schoolRef, (snapshot) => {
        if (!snapshot.exists()) {
            setClassOptions([]); // Set empty array if no school data
            return;
        }

        const schoolData = snapshot.data();
        if (!schoolData.members) {
            setClassOptions([]); // Ensure members exist
            return;
        }

        // Find the current user
        const userDetails = Object.values(schoolData.members || {}).find(
            (member) => member.uid === currentUser?.uid
        );

        if (userDetails?.userRole === "Teacher" && userDetails.classes?.length) {
            // ✅ If Teacher, show only assigned classes
            setClassOptions(userDetails.classes.map((cls) => cls.className));
        } else if (currentRole === "Admin") {
            // ✅ If Admin, show hardcoded classes
            setClassOptions([
                "1st", "2nd", "3rd", "4th", "5th",
                "6th", "7th", "8th", "9th", "10th"
            ]);
        } else {
            // ✅ Show all available classes in the school
            const allClasses = Object.values(schoolData.members || {})
                .flatMap((member) => member.classes?.map((cls) => cls.className) || []);
            setClassOptions([...new Set(allClasses)] || []); // Ensure it's always an array
        }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
}, [currentSchool, currentUser, currentRole, db]); // Dependencies


    return (
        isVisible && (
            <div className="addstudentsbg">
                <div className="addstudents">
                    <FontAwesomeIcon className="xicon" onClick={handleClose} icon={faCircleXmark} />
                    <div className="addstudentstitle">Add Students</div>

                    <div className="class_selection">
                        <label className="form-label lbl">Select Class:</label>
                        <div className="Cbox-bg">
                            {classOptions.map((option, index) => (
                                <label key={index} className="CB">
                                    <input
                                        type="radio"
                                        className="w-4 h-4 hidden"
                                        name="classSelection"
                                        onChange={() => setSelectedClasses([option])}  // Fix: Store as an array
                                        checked={selectedClasses?.includes(option)}
                                    />
                                    <span>{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="form-floating mb-3 name">                
                        <input
                            type="text"
                            className="form-control nameins"
                            placeholder="Search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <label>Search&nbsp;<FontAwesomeIcon icon={faSearch} /></label>
                        <button className="btn btn-outline-secondary srbtn" onClick={handleSearch}>
                            Search
                        </button>
                    </div>

                    {filteredMembers.length > 0 && (
                        <div className="sritems">
                            {filteredMembers.map((member) => (
                                <div key={member.id} className="srrow" onClick={() => selectUser(member)}>
                                    <img className="srimg" src={acclogo} alt="User" />
                                    <div className="srmail text-truncate">{member.email}</div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    <button className="btn sradd" onClick={handleSubmit}>
                        Submit
                    </button>
                </div>
            </div>
        )
    );
};

export default AddStudents;