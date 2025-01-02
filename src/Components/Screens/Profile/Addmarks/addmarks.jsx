import React, { useState } from "react";
import "./addmarks.css";
import Header from "../../../Comman/header";
import Sidebar from "../../../Comman/sidebar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark,faPlus} from '@fortawesome/free-solid-svg-icons';
const Addmarks = () => {
  const [marksSections, setMarksSections] = useState([
    { id: Date.now(), subject: "", marksObtained: "", totalMarks: "" },
  ]);
  // Function to add a new marks section
  const addMarksSection = () => {
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
              <div className='htcon'>
                <div className='headtext'>Add Marks</div>
              </div>
              <label for="formGroupExampleInput" class="form-label lbl "><h3>Enter Examination Title</h3></label>
              <div class="form-floating mb-3 subin  ">               
                  <input type="text" class="form-control box " id="floatingInput" placeholder="Enter Title"/>
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
                          onChange={(e) => handleInputChange(section.id, "subject", e.target.value)}/>
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
                <button className="sub1">Add</button>
            </div>
        </div>
     );
}
 
export default Addmarks;