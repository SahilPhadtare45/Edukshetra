import './joinform.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, getDoc, doc, updateDoc, arrayUnion, query, where, collection, getDocs } from "firebase/firestore";
import { useUserStore } from "../../../Firebase/userstore"; // Zustand store
import { toast } from "react-toastify";

const Joinform = () => {  // Default value to avoid undefined error
    const [isVisible, setIsVisible] = useState(true);
    const [password, setPassword] = useState(""); // Password entered by user
    const [passwordError, setPasswordError] = useState("");

    const [phone, setPhone] = useState("")
    const [schoolPhoneError, setSchoolPhoneError] = useState("");
    
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
            toast.success("User is not logged in!");
            return;
        }

        if (!/^[0-9]{10}$/.test(phone)) {
            setSchoolPhoneError("❌ Number must be exactly 10 digits and numeric");
            return;
          }

        const db = getFirestore();

        // Validate password before proceeding
        if (!password || password.trim() === "") {
            toast.error("Please enter a valid password!");
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
                toast.error("Incorrect password or no matching school found!");
                return;
            }
    
            const schoolRef = doc(db, "schools", matchedSchool.id);
            const schoolSnap = await getDoc(schoolRef);

            if (!schoolSnap.exists()) {
                toast.error("School does not exist!");
                return;
            }
            
            const schoolData = schoolSnap.data();
            const userRef = doc(db, "Users", currentUser.uid);
            const userSnap = await getDoc(userRef);
            
            if (!userSnap.exists()) {
              toast.error("User does not exist!");
              return;
            }
            
            const latestUserData = userSnap.data();
            const alreadyJoined = latestUserData.schoolData?.some(
              school => school.schoolId === matchedSchool.id
            );
            
            if (alreadyJoined) {
              toast.error("You have already joined this school.");
              return;
            }
            const existingMembers = schoolData.members || [];
            
            if (schoolData.createdBy === currentUser.uid) {
                toast.error("You are the creator of this school and cannot rejoin.");
                return;
            }
            // Check if the user is already in the members list
            const isAlreadyMember = existingMembers.some(member => member.uid === currentUser.uid);

            if (isAlreadyMember) {
                toast.error("You have already joined this school.");
                return;
            }

            if (!/^[A-Za-z0-9]*$/.test(password)) {
                setPasswordError("Invalid code: only letters and numbers allowed.");
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
                userRole: "Guest",
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
    
            await updateDoc(userRef, {
                schoolData: arrayUnion(userSchoolData), // Append new school data
            });

            // ✅ Fetch updated user info (triggers Zustand update)
            fetchUserInfo(currentUser.uid);

            toast.success("Successfully joined the school!");
            setIsVisible(false);
            navigate("/home");
        } catch (error) {
            console.error("Error joining school:", error);
            toast.error("Failed to join the school. Try again later.");
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
                <input type="text" className="form-control namein " id="floatingInput" placeholder="Enter No." 
                onChange={(e) => {
                    const input = e.target.value;
                    setPhone(input);
    
                    const isNoValid = /^[0-9]*$/.test(input);
                    if (!isNoValid) {
                        setSchoolPhoneError("Only numeric digits (0-9) are allowed.");
                    } else if (input.length !== 10) {
                        setSchoolPhoneError("Phone number must be exactly 10 digits.");
                    } else {
                        setSchoolPhoneError(""); // Clear errors
                    }
                    }}
                    maxLength={10}
                    minLength={10} required/>
                <label  for="floatingInput">Enter No.</label>
             </div>
             {schoolPhoneError && (
            <p style={{ color: "red", marginTop: "-98px",marginLeft:"58%", fontSize:"14px",position:"absolute" }}>{schoolPhoneError}</p>
            )}
            <label for="formGroupExampleInput" class="form-label lbl">Enter Code here</label>              
            <div className="form-floating mb-3 name">
                <input
                    type="text"
                    className="form-control namein"
                    id="floatingInput"
                    placeholder="Enter Code"
                    value={password}
                    onChange={(e) => {
                    const input = e.target.value;
                    setPassword(input);

                    const isValid = /^[A-Za-z0-9]*$/.test(input);
                    if (!isValid) {
                        setPasswordError("Only letters (A-Z, a-z) and numbers (0-9) are allowed.");
                    } else {
                        setPasswordError("");
                    }
                    }}
                    maxLength={6}
                    minLength={6}
                    required
                />
                <label htmlFor="floatingInput" className="en">Enter here</label>
                <span className="input-group-text eg" id="basic-addon3">eg.XUVcdc</span>
                </div>

                {passwordError && (
                <p style={{ color: "red", marginTop: "-98px",marginLeft:"44%", fontSize:"14px",position:"absolute"}}>{passwordError}</p>
                )}


            <button className="btn-sub1"  type="submit">Join</button>
            </form>
        </div>
        </div>
        )
     );
}
 
export default Joinform;