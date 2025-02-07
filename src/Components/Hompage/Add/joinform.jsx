import './joinform.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, getDoc, doc, updateDoc, arrayUnion, query, where, collection, getDocs } from "firebase/firestore";
import { useUserStore } from "../../../Firebase/userstore"; // Zustand store

const Joinform = () => {  // Default value to avoid undefined error
    const [isVisible, setIsVisible] = useState(true);
    const [password, setPassword] = useState(""); // Password entered by user
    const [phone, setPhone] = useState("")
    const navigate = useNavigate();
    const currentUser = useUserStore((state) => state.currentUser); // Zustand Store
    const setSchools = useUserStore((state) => state.setSchools); // Add the setSchools action from Zustand

    const handleClose = () => {
        setIsVisible(false); // Hides the container
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            alert("User is not logged in!");
            return;
        }

        const db = getFirestore();

        // Validate password before proceeding
        if (!password || password.trim() === "") {
            alert("Please enter a valid password!");
            return;
        }

        try {
            // Fetch all schools from Firestore
            const schoolsRef = collection(db, "schools");
            const schoolsSnapshot = await getDocs(schoolsRef);
            
            let matchedSchool = null;
    
            // Iterate over each document to find a matching password
            schoolsSnapshot.forEach((doc) => {
                const schoolData = doc.data();
                if (schoolData.password === password) {
                    matchedSchool = { id: doc.id, ...schoolData };
                }
            });
    
            if (!matchedSchool) {
                alert("Incorrect password or no matching school found!");
                return;
            }
    
            // Prepare userSchoolData for Zustand
            const userSchoolData = {
                schoolId: matchedSchool.id,
                schoolName: matchedSchool.schoolName,
                shortForm: matchedSchool.shortForm, // Include shortform
                logoUrl: matchedSchool.logoUrl, // Include image URL
                userRole: "Guest", // Default role
                joinedAt: new Date(),
                password: matchedSchool.password,
                phone:phone
            };
    
            // Update Zustand state with new school
            setSchools((prevSchools) => [...prevSchools, userSchoolData]);
    
            // Add user to the school's members array in Firestore
            const userData = {
                uid: currentUser.uid,
                username: currentUser.name,
                userRole: "Guest",
                email: currentUser.email,
                joinedAt: new Date(),
                phone:phone
            };
    
            await updateDoc(doc(db, "schools", matchedSchool.id), {
                members: arrayUnion(userData),
            });
    
             // Update the user's document in Firestore to add school info inside schoolData
            const userRef = doc(db, "Users", currentUser.uid);
            await updateDoc(userRef, {
                schoolData: arrayUnion(userSchoolData), // Append new school data
            });

            alert("Successfully joined the school!");
            setIsVisible(false);
            navigate("/people");
        } catch (error) {
            console.error("Error joining school:", error);
            alert("Failed to join the school. Try again later.");
        }
    };
    
    return ( 
        isVisible && (
            <div className="joinfrombg">
        <div className="joinform">
        <FontAwesomeIcon className="xicon" onClick={handleClose} icon={faCircleXmark} />
            <div className="jointitle">Join your School</div>
            <form onSubmit={handleSubmit}>
           
             <label for="formGroupExampleInput" class="form-label lbl">Enter Your Phone No.</label>
             <div class="form-floating mb-3 name">               
                <input type="text" class="form-control namein " onChange={(e) => setPhone(e.target.value)} id="floatingInput" placeholder="Enter No."/>
                <label  for="floatingInput">Enter No.</label>
             </div>

            <label for="formGroupExampleInput" class="form-label lbl">Enter Code here</label>              
            <div class="form-floating mb-3 name">                      
                <input type="text" class="form-control namein " onChange={(e) => setPassword(e.target.value)} id="floatingInput" placeholder="Enter Name"/>
                <label  for="floatingInput" className="en">Enter here</label>
                <span class="input-group-text eg" id="basic-addon3">eg.XUVcdc</span> 
            </div>

            <button class="btn sub1"  type="submit">Join</button>
            </form>
        </div>
        </div>
        )
     );
}
 
export default Joinform;