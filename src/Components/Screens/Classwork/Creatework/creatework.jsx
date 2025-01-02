import './creatework.css';
import Header from "../../../Comman/header"
import Sidebar from "../../../Comman/sidebar";
import PageInfo from "../../../Comman/pageinfo";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // Import styles
import React, { useState } from "react";
const Creatework = () => {
    const [date, setDate] = useState(new Date());
    const [showCalendar, setShowCalendar] = useState(false); 
    const handleDateChange = (newDate) => {
      setDate(newDate);
    };
    const toggleCalendar = () => {
        setShowCalendar(!showCalendar); // Toggle the calendar visibility
      };
    return ( 
        <div className="createpage">
            <Header/>
            <Sidebar/>
            <div className='creatework'>
                <div className='head'>
                <div className='htcon1'>
                                <div className='headtext'>Add Marks</div>
                                </div>
                                </div>
                    <label for="formGroupExampleInput" class="form-label lbl ">Enter Title</label>
                        <div class="form-floating mb-3 subin  ">               
                            <input type="text" class="form-control box " id="floatingInput" placeholder="Enter Subject/Topic"/>
                            <label  for="floatingInput ">Enter Subject/Topic</label>
                        </div>
                            <label for="formGroupExampleInput" class="form-label lbl">Enter here</label>
                            <textarea id="customParagraphInput" className="form-control con_box" placeholder="Enter Classwork here..."/>       
                        <div class="input-group upload">
                            <label for="formGroupExampleInput" class="form-label lbl">Attachments : &nbsp;</label>
                            <input type="file" class="form-control upload-in" id="inputGroupFile04" aria-describedby="inputGroupFileAddon04" aria-label="Upload" multiple/>
                        
                        <div class="form-check form-switch allow">
                            <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault"/>
                            <label class="form-check-label" for="flexSwitchCheckDefault">&nbsp;&nbsp;Allow Uploads</label>
                        </div>
                        </div>
                        <div className='duedate'>
                            <p>Enter Due Date:  </p>               
                            <button className="btn btn-primary calbtn" onClick={toggleCalendar}>
                                {showCalendar ? "Close Calendar" : "Open Calendar"}
                            </button>
                            
                            {showCalendar && (
                                <div className="mt-3">
                                <Calendar onChange={handleDateChange} value={date} />
                                </div>
                            )}
                            <p className="datedis">
                                <strong>Selected Date:</strong> {date.toDateString()}
                            </p>                       
                        </div>
                        <div className="classdropdowns">
                            <p>To:</p>
                            <select>
                                <option value="All">All</option>
                                <option value="1st">1st</option>
                                <option value="2nd">2nd</option>
                                <option value="3rd">3rd</option>
                                <option value="4th">4th</option>
                                <option value="5th">6th</option>
                                <option value="6th">6th</option>
                                <option value="7th">7th</option>
                                <option value="8th">8th</option>
                                <option value="9th">9th</option>
                                <option value="10th">10th</option>
                            </select>
                        </div>       
                        <button className='Create-Button primary'><p>Create</p></button>         
            </div>
        </div>
     );
}
 
export default Creatework;