import "./addteachers.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark, faSearch } from "@fortawesome/free-solid-svg-icons";
import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, getDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../../../../Firebase/firebase";
import acclogo from "../../../../images/acclogo.png";
import { useUserStore } from "../../../../Firebase/userstore";

const AddTeachers = ({ schoolId }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedClasses, setSelectedClasses] = useState([]);
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

                const membersWithIds = fetchedMembers.map((member) => ({
                    ...member,
                    id: member.memberId || member.uid, 
                }));

                console.log("Fetched Members:", membersWithIds);
                setMembers(membersWithIds);
                setFilteredMembers(membersWithIds);
            } else {
                console.log("No such school exists!");
            }
        } catch (error) {
            console.error("Error fetching members:", error.message);
        }
    };

    const handleSearch = () => {
        if (!searchTerm.trim()) {
            alert("Please enter a search term");
            return;
        }
    
        const matchedUsers = members.filter(member =>
            member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase())
        );

        console.log("Matched Users:", matchedUsers);
    
        if (matchedUsers.length === 0) {
            alert("No users found with this email.");
        } 

        setFilteredMembers(matchedUsers);
    };

    const selectUser = (user) => {
        if (!user || (!user.memberId && !user.uid)) {
            console.error("Error: Selected user has missing ID", user);
            alert("Error: User data is incomplete.");
            return;
        }

        console.log("User selected:", user);
        setSelectedUser({
            ...user,
            id: user.memberId || user.uid, 
        });
        setSearchTerm(user.email);
        setFilteredMembers([]);
    };

    const toggleClassSelection = (className) => {
        setSelectedClasses((prev) => 
            prev.includes(className) 
                ? prev.filter((c) => c !== className) 
                : [...prev, className] 
        );
    };


    const handleSubmit = async () => {
        console.log("Submitting Teacher Assignment...");
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
    
        if (selectedClasses.length === 0) {
            alert("Please select at least one class.");
            return;
        }
    
        try {
            // Fetch school document
            const schoolRef = doc(db, "schools", schoolId);
            const schoolSnap = await getDoc(schoolRef);
    
            if (!schoolSnap.exists()) {
                console.error("Error: School document not found.");
                return;
            }
    
            const schoolData = schoolSnap.data();
               // Find the selected user in the school's member list
        const existingMember = schoolData.members.find(member => member.memberId === selectedUser.memberId);

        if (existingMember) {
            if (existingMember.userRole === "Student") {
                alert("This user is already a student and cannot be assigned as a teacher.");
                return;
            }
        }

            const updatedMembers = schoolData.members.map(member => {
                if (member.memberId === selectedUser.memberId) {
                    const memberClasses = member.classes || [];
                    
                    // Ensure each new class has { className, subject: "Not Assigned" }
                    const newClasses = selectedClasses.map(cls => ({
                        className: cls,
                        subject: "Not Assigned"
                    }));
    
                    // Filter out already assigned classes to prevent duplicates
                    const existingClassNames = memberClasses.map(c => c.className);
                    const classesToAdd = newClasses.filter(cls => !existingClassNames.includes(cls.className));
    
                    // Prevent duplicate assignment
                    if (classesToAdd.length === 0) {
                        alert("Teacher is already assigned to the selected class(es).");
                        return member; // Return the original member without changes
                    }
    
                    return {
                        ...member,
                        userRole: "Teacher",
                        classes: [...memberClasses, ...classesToAdd]  // ✅ Store as objects, not just names
                    };
                }
                return member;
            });
    
            // Update Firestore
            await updateDoc(schoolRef, { members: updatedMembers });
    
            console.log("Updated school members:", updatedMembers);
            alert("Teacher assigned successfully!");
            setIsVisible(false);
    
            fetchMembers(); // Refresh data after updating
        } catch (error) {
            console.error("Error updating teacher:", error.message);
            alert(`Error assigning teacher: ${error.message}`);
        }
    };
    


    const handleClose = () => {
        setIsVisible(false);
    };

    const classOptions = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"];

    return (
        isVisible && (
            <div className="addteachersbg">
                <div className="addteachers">
                    <FontAwesomeIcon className="xicon" onClick={handleClose} icon={faCircleXmark} />
                    <div className="addteacherstitle">Add Teachers</div>

                    <div className="class_selection">
                        <label className="form-label lbl">Select Class:</label>
                        <div className="Cbox-bg">
                            {classOptions.map((option, index) => (
                                <label key={index} className="CB">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 hidden"
                                        onChange={() => toggleClassSelection(option)}
                                        checked={selectedClasses.includes(option)}
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

export default AddTeachers;
