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
    const fetchUserInfo = useUserStore((state) => state.fetchUserInfo); // Get the function from Zustand

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
    
            const schoolRef = doc(db, "schools", matchedSchool.id);
            const schoolSnap = await getDoc(schoolRef);

            if (!schoolSnap.exists()) {
                alert("School does not exist!");
                return;
            }
            
            const schoolData = schoolSnap.data();
            const existingMembers = schoolData.members || [];
            
            if (schoolData.createdBy === currentUser.uid) {
                alert("You are the creator of this school and cannot rejoin.");
                return;
            }
            // Check if the user is already in the members list
            const isAlreadyMember = existingMembers.some(member => member.uid === currentUser.uid);

            if (isAlreadyMember) {
                alert("You have already joined this school.");
                return;
            }

            let userRole = "Guest"; // Default role
                if (schoolData.adminId === currentUser.uid) {
                    userRole = "Admin";
                } else if (schoolData.teachers?.some(teacher => teacher.uid === currentUser.uid)) {
                    userRole = "Teacher";
                } else if (schoolData.students?.some(student => student.uid === currentUser.uid)) {
                    userRole = "Student";
                }
            // Prepare userSchoolData for Zustand
            const userSchoolData = {
                schoolId: matchedSchool.id,
                schoolName: matchedSchool.schoolName,
                shortForm: matchedSchool.shortForm, // Include shortform
                logoUrl: matchedSchool.logoUrl, // Include image URL
                userRole: userRole, // Default role
                joinedAt: new Date(),
                password: matchedSchool.password,
                phone:phone
                
            };
    
            // Update Zustand state with new school, preventing duplicates
setSchools((prevSchools) => {
    const exists = prevSchools.some(school => school.schoolId === matchedSchool.id);
    if (exists) return prevSchools; // Prevent duplicate
    return [...prevSchools, userSchoolData];
});
            // Add user to the school's members array in Firestore
            const userData = {
                uid: currentUser.uid,
                username: currentUser.name,
                userRole: userRole,
                email: currentUser.email,
                joinedAt: new Date(),
                phone:phone,
                memberId:""
            };
    
            await updateDoc(schoolRef, {
                members: arrayUnion(userData),
            });
            
            await updateDoc(doc(db, "schools", matchedSchool.id), {
                members: arrayUnion(userData),
            });
    
             // Update the user's document in Firestore to add school info inside schoolData
            const userRef = doc(db, "Users", currentUser.uid);
            await updateDoc(userRef, {
                schoolData: arrayUnion(userSchoolData), // Append new school data
            });

            // ✅ Fetch updated user info (triggers Zustand update)
            fetchUserInfo(currentUser.uid);

            alert("Successfully joined the school!");
            setIsVisible(false);
            navigate("/home");
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