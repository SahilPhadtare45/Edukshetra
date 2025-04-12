import './creatework.css';
import React, { useState, useEffect } from "react";  
import Header from "../../../Comman/header";
import Sidebar from "../../../Comman/sidebar";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { db, auth } from "../../../../Firebase/firebase"; // Import Firebase
import { doc, updateDoc, arrayUnion, getDoc, onSnapshot} from "firebase/firestore";
import axios from "axios"; // For Cloudinary upload
import { useUserStore } from '../../../../Firebase/userstore';
import { v4 as uuidv4 } from "uuid"; // Import UUID for unique ID generation
import { useNavigate } from "react-router-dom";

const Creatework = () => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [date, setDate] = useState(new Date());
    const [showCalendar, setShowCalendar] = useState(false);
    const [attachments, setAttachments] = useState([]);
    const [allowUploads, setAllowUploads] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [classOptions, setClassOptions] = useState([]);
    const handleDateChange = (newDate) => setDate(newDate);
    const toggleCalendar = () => setShowCalendar(!showCalendar);
    const toggleUploads = () => setAllowUploads(!allowUploads);
    const [classes, setClasses] = useState([]);  
    const { currentUser, currentSchool, currentRole } = useUserStore();
    const navigate = useNavigate();
    


    useEffect(() => {
        fetchClasses();
    }, [currentUser, currentSchool]);

    const fetchClasses = async () => {
        if (!currentSchool || !currentSchool.schoolId) {
            console.log("No school selected.");
            return;
        }
    
        try {
            const schoolRef = doc(db, "schools", currentSchool.schoolId);
            const schoolSnap = await getDoc(schoolRef);

            if (schoolSnap.exists()) {
                const schoolData = schoolSnap.data();
                const allClasses = schoolData.classes || [];
    
                if (currentRole === "Admin") {
                    // Admins get all classes
                    setClasses(allClasses);
                } else if (currentRole === "Teacher") {
                    // Find the logged-in teacher in members array
                    const teacherData = schoolData.members.find(member => member.uid === currentUser.uid);
    
                    if (teacherData && teacherData.classes) {
                        // Extract classNames from assigned classes
                        const teacherClasses = teacherData.classes.map(cls => ({
                            className: cls.className // Ensuring correct structure
                        }));
    
                        setClasses(teacherClasses);
                    } else {
                        setClasses([]);
                    }
                }
            } else {
                console.log("No such school exists!");
            }
        } catch (error) {
            console.error("Error fetching classes:", error.message);
        }
    };
    
    

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        const uploadedUrls = [];

        for (const file of files) {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", "unsigned_preset"); // Replace with Cloudinary preset

            try {
                const response = await axios.post("https://api.cloudinary.com/v1_1/dnj7emmrm/upload", formData);
                uploadedUrls.push(response.data.secure_url);
            } catch (error) {
                console.error("Upload failed:", error);
            }
        }

        setAttachments((prevAttachments) => [...prevAttachments, ...uploadedUrls]);
    };

    const handleCreateClasswork = async () => {
        if (!title.trim()) {
            alert("⚠️ Title is required!");
            return;
        }
    
        if (!content.trim()) {
            alert("⚠️ Content is required!");
            return;
        }
    
        if (!selectedClass) {
            alert("⚠️ Please select a class!");
            return;
        }

        if (allowUploads && !date) {
            alert("Please select a due date.");
            return;
        }

        try {
            const schoolRef = doc(db, "schools", currentSchool.schoolId);
            const uniqueId = uuidv4(); // ✅ Generate a unique ID

            let adjustedDueDate = null;
            if (allowUploads && date) {
                let dueDate = new Date(date);
                dueDate.setHours(23, 59, 59, 999); // ✅ Force time to 23:59:59
                adjustedDueDate = dueDate.toISOString();
            }

            await updateDoc(schoolRef, {
                classwork: arrayUnion({
                    id: uniqueId,  // ✅ Store unique ID
                    assignedByEmail: auth.currentUser?.email || "unknown",
                    assignedByUID: auth.currentUser?.uid || "unknown",
                    classworkTitle: title,
                    classworkContent: content,
                    attachments,
                    allowUploads,
                    dueDate: adjustedDueDate, // ✅ Stores with correct time
                    to: selectedClass,
                    createdAt: new Date().toISOString(),
                    uploads: [], // ✅ Initialize empty uploads array

                }),
            });

            alert("Classwork added successfully!");
            setTitle("");
            setContent("");
            setAttachments([]);
            setAllowUploads(false);
            setSelectedClass("1st");
            navigate("/classwork");
        } catch (error) {
            console.error("Error updating document:", error);
            alert("Error adding classwork.");
        }
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
    });
    return (
        <div className="createpage">
            <Header />
            <Sidebar />
            <div className='creatework'>
                <div className='head'>
                    <p>Add Classwork</p>
                </div>

                <label for="formGroupExampleInput" className="form-label lbl">Enter Title</label>
                <div class="form-floating mb-3 subin  ">
                    <input type="text" className="form-control box" placeholder="Enter Subject/Topic" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={50}/>
                    <label  for="floatingInput ">Enter Subject/Topic</label>
                </div>
                

                <label className="form-label lbl">Enter Content</label>
                <textarea 
                    className="form-control con_box" 
                    placeholder="Enter Classwork here..." 
                    value={content} 
                    onChange={(e) => setContent(e.target.value)}
                />

                <div className="input-group upload">
                    <label for="formGroupExampleInput" className="form-label lbl">Attachments: &nbsp;</label>
                    <input 
                        type="file" 
                        class="form-control upload-in" id="inputGroupFile04" aria-describedby="inputGroupFileAddon04" aria-label="Upload"  
                        onChange={handleFileChange}
                        multiple
                    />

                <div className="form-check form-switch allow">
                    <input 
                        className="form-check-input" 
                        type="checkbox" 
                        role="switch" 
                        id="flexSwitchCheckDefault"
                        checked={allowUploads} 
                        onChange={toggleUploads} 
                    />
                    <label className="form-check-label" for="flexSwitchCheckDefault">&nbsp;&nbsp;Allow Uploads</label>
                </div>                
                </div>

                {allowUploads && (
                    <div className='duedate'>
                        <p>Enter Due Date: </p>
                        <button className="btn btn-dark calbtn" onClick={toggleCalendar}>
                            {showCalendar ? "Close Calendar" : "Open Calendar"}
                        </button>

                        {showCalendar && (
                            <div className="mt-3">
                                <Calendar onChange={handleDateChange} value={date} tileDisabled={({ date }) => date < new Date()}/>
                            </div>
                        )}

                        <p className="datedis">
                            <strong>Selected Date:</strong> {date.toDateString()}
                        </p>
                    </div>
                )}

<div className="classselection">
    <p>Select Class:</p>
    {classOptions.length > 0 ? (
        classOptions.map((className, index) => (
            <label key={index} className="classdropdowns">
                <input 
                    type="radio" 
                    value={className} 
                    checked={selectedClass === className} 
                    onChange={() => setSelectedClass(className)} 
                />
                {className}
            </label>
        ))
    ) : (
        <p>No classes assigned</p>
    )}
</div>

                <button className='Create-Button' onClick={handleCreateClasswork}>
                    <p>Create</p>
                </button>
            </div>
        </div>
    );
};

export default Creatework;
