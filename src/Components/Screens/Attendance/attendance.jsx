import './attendance.css';
import Header from "../../Comman/header";
import Sidebar from "../../Comman/sidebar";
import PageInfo from "../../Comman/pageinfo";
import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays, faCheck,faXmark } from '@fortawesome/free-solid-svg-icons';
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; 
const Attendance = () => {
        const [activeIndex, setActiveIndex] = useState(0);
        const [underlineStyle, setUnderlineStyle] = useState({});
        const navItemsRef = useRef([]);
        const calendarRef = useRef(null); // Ref for the calendar
        const toggleButtonRef = useRef(null); // Ref for the toggle button

        const handleNavClick = (index) => {
            setActiveIndex(index);
        };
        useEffect(() => {
            if (navItemsRef.current[activeIndex]) {
                const { offsetLeft, offsetWidth } = navItemsRef.current[activeIndex];
                setUnderlineStyle({
                    left: offsetLeft, // Position relative to the parent container
                    width: offsetWidth, // Match the underline width to the active item
                });
            }
        }, [activeIndex]);

            const [date, setDate] = useState(new Date());
            const [showCalendar, setShowCalendar] = useState(false); 
            const handleDateChange = (newDate) => {
              setDate(newDate);
            };
            const toggleCalendar = () => {
                setShowCalendar(!showCalendar); // Toggle the calendar visibility
                console.log(showCalendar); // Check if the state is toggling
            };

            const handleOutsideClick = (event) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target) && 
            toggleButtonRef.current && !toggleButtonRef.current.contains(event.target)) 
            {setShowCalendar(false); // Close the calendar when clicking outside
            }
    };
         
            useEffect(() => {
                document.addEventListener("click", handleOutsideClick);
                return () => {
                    document.removeEventListener("click", handleOutsideClick);
                };
            }, []);
              const [status, setStatus] = useState(""); // Track selected status
              // Function to handle background color based on selection
              const getBgColor = () => {
                if (status === "present") return "#6AA84F";
                if (status === "absent") return "#E06666";
                return "white";
              };
    return ( 
        <div className='attendancepage'>
            <Header/>
            <Sidebar/>
            <PageInfo/>
            <div className='attendance'>
                <div className='contain'>
                    <nav className="navbar navbar-expand-lg">                
                        <div className="container-fluid">
                            <ul className="navbar-nav">
                                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                                    <span className="navbar-toggler-icon"></span>
                                </button>
                                    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      
                                        {['1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th'].map((item, index) => (
                                        <li
                                            key={index}
                                            className={`nav-item navtext ${activeIndex === index ? 'active' : ''}`}
                                            ref={(el) => (navItemsRef.current[index] = el)}
                                            onClick={() => handleNavClick(index)}
                                        >
                                        <a className="nav-link" href="#">{item}</a>
                                        </li>
                                        ))}
                                    </div>
                            </ul>
                        </div>
                        <div className="active-underline md-none" style={underlineStyle}></div>
                    </nav>
                    <div className="navbar-line"></div>
                        <div className='tr_con'>
                            <div className='tr'>
                                <div className='htcon'>
                                <div className='headtext'>Teachers</div>
                                </div>
                                <div className='cal_btn'>
                                    <button className='createbg' onClick={toggleCalendar}>
                                        <div className='cricon'>   
                                            <FontAwesomeIcon className='cal_icon' icon={faCalendarDays}/>
                                        </div>
                                        <p> {showCalendar ? "Close Calendar" : "Open Calendar"}</p>
                                    </button>
                                        {showCalendar && (  
                                        <div className="calendar-container" ref={calendarRef} >
                                            <Calendar onChange={handleDateChange} value={date} style={{ width: "100px", height: "auto" }}  />
                                        </div>
                                        )}                              
                                        <p className="datedis">
                                            Selected Date:{date.toDateString()}
                                        </p>                               
                                </div>
                            </div>  
                        </div>   
                        <div className='table_title' style={{display:"flex"}}>
                            <div style={{marginLeft:'4%',marginTop:'2%',fontWeight:'bold'}}>Name</div>
                            <div style={{marginLeft:'44%',marginTop:'2%',fontWeight:'bold'}}>Subject</div>
                        </div>
                        <div className='tr_section'>
                            <div className='table_row'>
                                <ul class="list-group list-group-flush llist">
                                    <li class="li-item">
                                        <div className="item-text text-truncate">IndulekhIndulekhIndulekhIndulekhIndulekhIndulekhIndulekhIndulekh </div>
                                        <div className='sub_name text-truncate'>MathsMathsMathsMathsMaths</div>
                                        <div className='radiobtn' style={{backgroundColor: getBgColor(),}}>                                   
                                            <label className='lab'>
                                                <input type="radio" name="attendance" value="present" onChange={(e) => setStatus(e.target.value)}/>Present</label>
                                            <label className='lab' style={{ marginLeft: "20px" }}>
                                                <input type="radio" name="attendance" value="absent" onChange={(e) => setStatus(e.target.value)} />Absent</label>
                                        </div>       
                                    </li>
                                </ul>
                            </div>   
                            <div className='navbarline1'/>
                     
                        </div>          
            </div>

                <div className='stu'>   
                    <div className='tr'>     
                        <div className='htcon'>
                            <div className='headtext1'>Students</div>
                        </div>
                    </div>
                    <div className='table_title' style={{display:"flex"}}>
                        <div style={{marginLeft:'4%',marginTop:'1%',fontWeight:'bold'}}>Name</div>
                        <div style={{marginLeft:'44%',marginTop:'1%',fontWeight:'bold'}}>Roll No.</div>
                    </div>
                        <div className='stu_section'>
                            <div className='table_row'>
                                <ul class="list-group list-group-flush llist">
                                    <li class="li-item">
                                        <div className="item-text text-truncate">IndulekhIndulekhIndulekhIndulekhIndulekhIndulekhIndulekhIndulekh</div>
                                        <div className='sub_name1 text-truncate'>1</div>
                                        <div className='radiobtn' style={{backgroundColor: getBgColor(),}}>            
                                            <label className='lab'>
                                                <input type="radio" name="attendance" value="present" onChange={(e) => setStatus(e.target.value)}/>Present</label>
                                            <label className='lab' style={{ marginLeft: "20px" }}>
                                                <input type="radio" name="attendance" value="absent" onChange={(e) => setStatus(e.target.value)} />Absent</label>
                                        </div>                              
                                    </li>
                                </ul>
                            </div> 
                            <div className='navbarline1'/>
                            <div className='table_row'>
                                <ul class="list-group list-group-flush llist">
                                    <li class="li-item">
                                        <div className="item-text text-truncate">IndulekhIndulekhIndulekhIndulekhIndulekhIndulekhIndulekhIndulekh</div>
                                        <div className='sub_name1 text-truncate'>1</div>
                                        <div className='radiobtn' style={{backgroundColor: getBgColor(),}}>            
                                            <label className='lab'>
                                                <input type="radio" name="attendance" value="present" onChange={(e) => setStatus(e.target.value)}/>Present</label>
                                            <label className='lab' style={{ marginLeft: "20px" }}>
                                                <input type="radio" name="attendance" value="absent" onChange={(e) => setStatus(e.target.value)} />Absent</label>
                                        </div>                              
                                    </li>
                                </ul>
                            </div> 
                            <div className='navbarline1'/>
                     
                        </div>            
                </div>
            </div>
        </div>
     );
}
 
export default Attendance;