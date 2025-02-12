import "./addteachers.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark, faSearch } from "@fortawesome/free-solid-svg-icons";
import React, { useState, useEffect  } from "react";
import { collection, query, where, getDocs,getDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../../../../Firebase/firebase"; // Ensure correct Firebase import
import acclogo from "../../../../images/acclogo.png";
import { useUserStore } from "../../../../Firebase/userstore";

const AddTeachers = ({ schoolId }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState([]); // Store search results
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedClasses, setSelectedClasses] = useState([]);
    const { currentSchool } = useUserStore();
    const [members, setMembers] = useState([]);

    useEffect(() => {
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
                    setMembers(schoolData.members || []);
                } else {
                    console.log("No such school exists!");
                }
            } catch (error) {
                console.error("Error fetching members:", error.message);
            }
        };

        fetchMembers();
    }, [currentSchool]);
    
    const handleSearch = () => {
        if (!searchTerm.trim()) {
            alert("Please enter a search term");
            return;
        }
    
        // 🔹 Filter members from the state instead of fetching from Firestore
        const matchedUsers = members.filter(member =>
            member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    
        console.log("Matched Users:", matchedUsers);
    
        if (matchedUsers.length === 0) {
            alert("No users found with this email.");
        } 
    
        // Update users state to display filtered search results
        setUsers(matchedUsers);
    };


    // 🔹 When clicking a suggestion, select the user & fill input
    const selectUser = (user) => {
        setSelectedUser(user);
        setSearchTerm(user.email);
        setUsers([]); // Hide suggestions
    };

    // 🔹 Toggle class selection
    const toggleClassSelection = (className) => {
        setSelectedClasses((prev) =>
            prev.includes(className) ? prev.filter((c) => c !== className) : [...prev, className]
        );
    };

    // 🔹 Submit selected user as teacher
    const handleSubmit = async () => {
        if (!selectedUser || !selectedUser.id) {
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
            const memberRef = doc(db, "schools", schoolId, "members", selectedUser.id);
    
            await updateDoc(memberRef, {
                userRole: "Teacher",
                classes: selectedClasses,
            });
    
            alert("Teacher assigned successfully!");
            setSelectedUser(null);
            setSearchTerm("");
            setSelectedClasses([]);
        } catch (error) {
            console.error("Error updating teacher:", error);
            alert("Error assigning teacher. Please try again.");
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

                    {/* 🔹 Class Selection */}
                    <div className="class_selection">
                        <label className="form-label lbl">Select Class:</label>
                        <div className="Cbox-bg">
                            {classOptions.map((option, index) => (
                                <label key={index} className="CB">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 hidden"
                                        onChange={() => toggleClassSelection(option)}
                                    />
                                    <span>{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* 🔹 Search Bar with Button */}
                    <div className="form-floating mb-3 name">               
                        <input
                            type="text"
                            className="form-control nameinsr"
                            id="floatingInput"
                            placeholder="Search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <label htmlFor="floatingInput">
                            Search&nbsp;
                            <FontAwesomeIcon onClick={handleClose} icon={faSearch} />
                        </label>
                        <button
                            className="btn btn-outline-secondary srbtn"
                            type="button"
                            id="button-addon1"
                            onClick={handleSearch}  // 🔹 Trigger search on button click
                        >
                            Search
                        </button>
                    </div>


                    {/* 🔹 Search Suggestions */}
                    {members.length > 0 && (
                        <div className="sritems">
                            {members.map((member) => (
                                <>
                                <div key={member.id} className="srrow" onClick={() => selectUser(member)}>
                                    <img className="srimg" src={acclogo} alt="User" />
                                    <div className="srmail text-truncate">{member.email}</div>
                                </div>
                                <div className="navbar-line"/>
                                </>
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
