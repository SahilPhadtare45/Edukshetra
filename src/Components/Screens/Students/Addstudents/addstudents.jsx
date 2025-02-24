import "./addstudents.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark, faSearch } from "@fortawesome/free-solid-svg-icons";
import React, { useState, useEffect } from "react";
import { getDoc, updateDoc, doc } from "firebase/firestore";
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
    
        if (!selectedClasses) {
            alert("Please select a class.");
            return;
        }
    
        const classesArray = Array.isArray(selectedClasses) ? selectedClasses : [selectedClasses];
    
        try {
            const schoolRef = doc(db, "schools", schoolId);
            const schoolSnap = await getDoc(schoolRef);
    
            if (!schoolSnap.exists()) {
                console.error("Error: School document not found.");
                return;
            }
    
            const schoolData = schoolSnap.data();
             // Check if the user is already a student
        const existingMember = schoolData.members.find(member => member.memberId === selectedUser.memberId);
        if (existingMember && existingMember.userRole === "Student") {
            alert("This user is already assigned as a student and cannot be added as a teacher.");
            return;
        }
            const updatedMembers = schoolData.members.map(member => {
                if (member.memberId === selectedUser.memberId) {
                    const memberClasses = member.classes || [];
    
                    const updatedClasses = classesArray.map(cls => {
                        // Get students already in this class
                        const studentsInClass = schoolData.members.filter(m =>
                            m.classes?.some(c => c.className === cls)
                        );
    
                        const rollNo = studentsInClass.length + 1; // Assign roll number based on class count
    
                        // If the student is already in this class, keep their existing roll number
                        const existingClass = memberClasses.find(c => c.className === cls);
                        return existingClass || { className: cls, rollNo };
                    });
    
                    return {
                        ...member,
                        userRole: "Student",
                        classes: [...new Set([...memberClasses, ...updatedClasses])] // Ensure unique classes
                    };
                }
                return member;
            });
    
            await updateDoc(schoolRef, { members: updatedMembers });
    
            // ✅ Update in the 'Users' collection
            const userRef = doc(db, "Users", selectedUser.uid);
            await updateDoc(userRef, {
                [`schoolData.${schoolId}`]: {
                    ...(selectedUser.schoolData?.[schoolId] || {}), // Preserve existing data
                    userRole: "Student", // Update role
                    classes: [
                        ...((selectedUser.schoolData?.[schoolId]?.classes) || []), // Keep existing classes
                        ...(updatedMembers.find(m => m.memberId === selectedUser.memberId)?.classes || []) // Add new class
                    ]
                }
            });
    
            alert("Student assigned successfully!");
            setIsVisible(false);
            fetchMembers(); // Refresh members list
        } catch (error) {
            alert(`Error assigning student: ${error.message}`);
        }
    };
    
    
    

    const handleClose = () => {
        setIsVisible(false);
    };

    const classOptions = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"];

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