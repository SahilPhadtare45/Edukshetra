import "./addteachers.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark, faSearch } from "@fortawesome/free-solid-svg-icons";
import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, getDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../../../../Firebase/firebase";
import acclogo from "../../../../images/acclogo.png";
import { useUserStore } from "../../../../Firebase/userstore";
import { toast } from "react-toastify";
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
            toast.warn("Please select a user before submitting.");
            return;
        }
    
        if (!schoolId) {
            toast.error("Error: School ID is missing.");
            return;
        }
    
        if (!selectedClasses || selectedClasses.length === 0) {
            toast.warn("Please select at least one class.");
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
    
            // --- Updating Schools Collection ---
            const updatedMembers = schoolData.members.map(member => {
                if (member.uid === selectedUser.uid) {
                    let memberClasses = member.classes || [];
    
                    const newClasses = selectedClasses.map(cls => ({
                        className: cls,
                        subject: "Not Assigned"
                    }));
    
                    const existingClassNames = memberClasses.map(c => c.className);
                    const classesToAdd = newClasses.filter(cls => !existingClassNames.includes(cls.className));
    
                    return {
                        ...member,
                        userRole: "Teacher",
                        classes: [...memberClasses, ...classesToAdd]
                    };
                }
                return member;
            });
    
            // --- Updating Users Collection ---
            const updatedSchoolData = userData.schoolData.map(school => {
                if (school.schoolId === schoolId) {
                    let schoolClasses = school.classes || [];
    
                    const newClasses = selectedClasses.map(cls => ({
                        className: cls,
                        subject: "Not Assigned"
                    }));
    
                    const existingClassNames = schoolClasses.map(c => c.className);
                    const classesToAdd = newClasses.filter(cls => !existingClassNames.includes(cls.className));
    
                    return {
                        ...school,
                        userRole: "Teacher",
                        classes: [...schoolClasses, ...classesToAdd]
                    };
                }
                return school;
            });
    
            await updateDoc(schoolRef, { members: updatedMembers });
            await updateDoc(userRef, { schoolData: updatedSchoolData });
    
            console.log("Updated school members and user schoolData:", updatedMembers, updatedSchoolData);
            toast.success("Teacher assigned successfully!");
            setIsVisible(false);
    
            fetchMembers(); // Refresh the data
            
        } catch (error) {
            console.error("Error updating teacher:", error.message);
            toast.error(`Error assigning teacher: ${error.message}`);
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
