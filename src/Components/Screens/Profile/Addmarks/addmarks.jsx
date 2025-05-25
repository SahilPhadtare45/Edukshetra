import React, { useState } from "react";
import "./addmarks.css";
import Header from "../../../Comman/header";
import Sidebar from "../../../Comman/sidebar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark,faPlus} from '@fortawesome/free-solid-svg-icons';
import { db } from "../../../../Firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useParams } from 'react-router-dom';    
import { useUserStore } from "../../../../Firebase/userstore"; // ✅ Zustand Store for currentUser
import { useNavigate } from 'react-router-dom'; // ✅ Import useNavigate
import { toast } from "react-toastify"; // Make sure this is imported

const Addmarks = () => {
  const navigate = useNavigate(); // ✅ Initialize navigation
  const [examTitle, setExamTitle] = useState("");
  const { currentSchool, currentUser, currentRole } = useUserStore();
  const { uid } = useParams(); // ✅ Get UID from URL

  const handleAddMarks = async () => {
    if (!examTitle || marksSections.length === 0) {
      toast.error("Please enter an exam title and at least one subject.");
      return;
    }
  
    // ✅ Validate marks before proceeding
    for (let i = 0; i < marksSections.length; i++) {
      const { subject, marksObtained, totalMarks } = marksSections[i];
  
      // Check for empty fields
      if (!subject || !marksObtained || !totalMarks) {
        toast.error(`Please fill out all fields for subject ${i + 1}.`);
        return;
      }
  
      // Check for numeric and non-negative values
      const isValidMarksObtained = /^\d+(\.\d+)?$/.test(marksObtained);
      const isValidTotalMarks = /^\d+(\.\d+)?$/.test(totalMarks);
  
      if (!isValidMarksObtained || !isValidTotalMarks) {
        toast.error(`Marks must be valid non-negative numbers (Subject ${i + 1}).`);
        return;
      }
  
      if (parseFloat(marksObtained) > parseFloat(totalMarks)) {
        toast.error(`Obtained marks cannot exceed total marks (Subject ${i + 1}).`);
        return;
      }
    }
  
    try {
      const schoolRef = doc(db, "schools", currentSchool?.schoolId);
      const schoolSnap = await getDoc(schoolRef);
  
      if (!schoolSnap.exists()) {
        toast.error("School not found.");
        return;
      }
  
      const schoolData = schoolSnap.data();
      let members = schoolData.members || []; // ✅ Ensure members array exists
  
      // Find the index of the member
      const memberIndex = members.findIndex(member => member.uid === uid);
  
      if (memberIndex === -1) {
        toast.warn("User does not belong to this school.");
        return;
      }
  
      // Extract member object
      let member = { ...members[memberIndex] };
  
      // Ensure marks array exists
      if (!member.marks) {
        member.marks = [];
      }
  
      // Calculate total marks
      let totalMarksObtained = 0;
      let totalMarksPossible = 0;
  
      marksSections.forEach(({ marksObtained, totalMarks }) => {
        totalMarksObtained += parseFloat(marksObtained) || 0;
        totalMarksPossible += parseFloat(totalMarks) || 0;
      });
  
      // Calculate percentage
      const percentage = totalMarksPossible > 0 
        ? ((totalMarksObtained / totalMarksPossible) * 100).toFixed(2) 
        : "0";
  
      // Structure marks object properly
      const marksData = {
        [examTitle]: [
          { percentage: `${percentage}%` }, // ✅ Store percentage separately
          ...marksSections, // ✅ Store subjects inside examTitle
        ]
      };
  
      // Add marks to member object
      member.marks.push(marksData);
  
      // Update Firestore using `updateDoc`
      members[memberIndex] = member;
      await updateDoc(schoolRef, { members });
  
      toast.success("Marks added successfully!");
      // ✅ Navigate back to the same user's profile page
      navigate(`/profile/${uid}`);
    } catch (error) {
      console.error("Error adding marks:", error);
      toast.error("Failed to add marks.");
    }
  };
  

  const [marksSections, setMarksSections] = useState([
    { id: Date.now(), subject: "", marksObtained: "", totalMarks: "" },
  ]);
  // Function to add a new marks section
  const addMarksSection = () => {
    if (marksSections.length >= 10) {
      toast.warn("You can't add more than 10 subjects.", {
        position: "top-right",
        autoClose: 3000,
        pauseOnHover: true,
      });
      return;
    }
  
    setMarksSections([
      ...marksSections,
      { id: Date.now(), subject: "", marksObtained: "", totalMarks: "" },
    ]);
  };
  // Function to remove a marks section
  const removeMarksSection = (id) => {
    setMarksSections(marksSections.filter((section) => section.id !== id));
  };
  // Function to handle input changes in the marks sections
  const handleInputChange = (id, field, value) => {
    setMarksSections(
      marksSections.map((section) =>
        section.id === id ? { ...section, [field]: value } : section
      )
    );
  };
    return ( 
        <div className='addmarkspage'>
        <Header/>
        <Sidebar/>      
            <div className='addmarks'>
              <div className='head'>
              <p>Add Marks</p>
              </div>
              <label for="formGroupExampleInput" class="form-label lbl "><h3>Enter Examination Title</h3></label>
              <div class="form-floating mb-3 subin  ">               
                  <input type="text" class="form-control box " id="floatingInput" placeholder="Enter Title" 
                  onChange={(e) => setExamTitle(e.target.value)} minLength={3} maxLength={50} />
                  <label  for="floatingInput ">Enter Title</label>
              </div>
              <button type="button" className="add-btn" onClick={addMarksSection}>
                  <div className='cricon'>   
                      <FontAwesomeIcon className='createicon' icon={faPlus}/>
                  </div>
                  <p>Add Subject</p>
              </button>
              {/* Marks Sections */}
                {marksSections.map((section,index) => (
                 <div key={section.id} className="entermarks">
                    <div style={{display:'flex'}}>       
                    <label htmlFor="formGroupExampleInput" className="form-label lbl">Enter Subject/Topic</label>
                    {/* Hide close button for the default section */}
                    {index > 0 && ( 
                        <FontAwesomeIcon className="remove-btn" onClick={() => removeMarksSection(section.id)} icon={faCircleXmark} />        
                    )}
                    </div>
                    <div className="form-floating mb-3 subin1">
                      <input type="text" className="form-control box" placeholder="Enter Subject/Topic" value={section.subject} 
                          onChange={(e) => handleInputChange(section.id, "subject", e.target.value)} minLength={3} maxLength={20}/>
                      <label htmlFor="floatingInput">Enter here</label>
                    </div>         
                    <div className="input-group mb-3 marksin">
                      <input type="text" className="form-control box" placeholder="Marks obtained" value={section.marksObtained}
                          onChange={(e) => handleInputChange(section.id, "marksObtained", e.target.value)}/>
                      <span className="input-group-text">Out of</span>
                      <input type="text" className="form-control box" placeholder="Total Marks" value={section.totalMarks}
                          onChange={(e) => handleInputChange(section.id, "totalMarks", e.target.value)}/>
                    </div>          
                  </div>
                ))}
                <button className="sub1" onClick={handleAddMarks} disabled={examTitle.length < 3}>Add</button>
            </div>
        </div>
     );
}
 
export default Addmarks;