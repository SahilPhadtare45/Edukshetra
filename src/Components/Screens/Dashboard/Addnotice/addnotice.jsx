import './addnotice.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import React, { useState } from "react";
import { db } from "../../../../Firebase/firebase"; // Firebase DB
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { useUserStore } from "../../../../Firebase/userstore"; // Import Zustand store
const Addnotice = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [notice, setNotice] = useState("");
    const [toWhom, setToWhom] = useState("All");

    const currentSchool = useUserStore((state) => state.currentSchool); // Get school from Zustand

    const handleClose = () => {
        setIsVisible(false); // Hide the popup
    };

    const handleSubmit = async () => {
        console.log("Current School ID:", currentSchool); // Debugging log
    
        if (!notice.trim()) {
            alert("Please enter a notice.");
            return;
        }

        try {
            const schoolRef = doc(db, "schools", currentSchool.schoolId); // Firestore document reference
            const schoolSnap = await getDoc(schoolRef); // Fetch current school data
    
            // If the school document does not exist, create it with the notices field
            if (!schoolSnap.exists()) {
                await setDoc(schoolRef, { notices: [] }, { merge: true });
            } else {
                // If the document exists but 'notices' field is missing, initialize it
                const schoolData = schoolSnap.data();
                if (!schoolData.notices) {
                    await updateDoc(schoolRef, { notices: [] });
                }
            }
    
            // Now, safely add the notice
            await updateDoc(schoolRef, {
                notices: arrayUnion({
                    text: notice,
                    to: toWhom,
                    timestamp: new Date(),
                }),
            });
    
            alert("Notice added successfully!");
            setNotice(""); // Clear input field
            setToWhom("All"); // Reset dropdown
            setIsVisible(false); // Hide the popup
        } catch (error) {
            console.error("Error adding notice:", error);
            alert("Failed to add notice. Try again!");
        }
    };

    return ( 
        isVisible && (
            <div className="addnoticebg">
        <div className="addnotice">
        <FontAwesomeIcon className="xicon" onClick={handleClose} icon={faCircleXmark} />
            <div className="addnoticetitle">Add Notice</div>
            <label for="formGroupExampleInput" class="form-label lbl">Enter here</label>
            <textarea
                        id="customParagraphInput"
                        className="form-control name"
                        placeholder="Type your notice here..."
                        value={notice}
                        onChange={(e) => setNotice(e.target.value)}
                    />
            <p>To:</p>
            <div className="To-dropdowns">
                <select value={toWhom} onChange={(e) => setToWhom(e.target.value)} className='custom-dropdown'>
                    <option value="All">All</option>
                    <option value="Teacher">Teachers</option>
                    <option value="Student">Students</option>            
                </select>
            </div>      

            <button class="btn sub1" type="button" onClick={handleSubmit}>Submit</button>
        </div>
        </div>
        )
     );
}
 
export default Addnotice;