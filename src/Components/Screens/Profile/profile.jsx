import './profile.css';
import Header from "../../Comman/header";
import Sidebar from "../../Comman/sidebar";
import PageInfo from "../../Comman/pageinfo";
import Viewmarks from "../Profile/Addmarks/viewmarks"
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import acclogo from '../../../images/acclogo.png';
import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faFileCirclePlus, faIdCard,faTty } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, Link, useParams } from 'react-router-dom';    
import { useUserStore } from "../../../Firebase/userstore"; // ✅ Zustand Store for currentUser
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { db } from "../../../Firebase/firebase"; // Ensure this path is correct based on your project structure
import { useCallback } from 'react';

const Profile = () => {
    const { uid } = useParams(); // ✅ Get UID from URL
    const { currentSchool, currentUser, currentRole } = useUserStore();
    const navigate = useNavigate();
    const [activeIndex, setActiveIndex] = useState(0);
    const [underlineStyle, setUnderlineStyle] = useState({});
    const navItemsRef = useRef([]);
    const [viewmarks,setViewMarks] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [presentCount, setPresentCount] = useState(0);
    const [absentCount, setAbsentCount] = useState(0);
    const [userUid, setUserUid] = useState(null);
    const [viewedUserId, setViewedUserId] = useState(null); // ✅ Store viewed user's UID

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

            console.log(currentUser)
                const fetchProfileData = async () => {
                    let userId = uid || currentUser?.uid; // If UID exists in URL, fetch that user; otherwise, fetch logged-in user
                    if (!userId) return;
                    setViewedUserId(userId); // ✅ Store the UID in state

                    // Query the schools collection to find where the user exists
                    const schoolsRef = doc(db, "schools", currentSchool?.schoolId);
                    const schoolSnap = await getDoc(schoolsRef);
        
                    if (schoolSnap.exists()) {
                        const schoolData = schoolSnap.data();
                        const schoolCreatedAt = schoolData.createdAt?.seconds || Math.floor(Date.now() / 1000); // School creation timestamp
                        const timestamp = `${schoolCreatedAt.toString().slice(-4)}`;
                        if (schoolData.userId === userId) {
                            // ✅ User is the admin
                            setProfileData({
                                username: schoolData.createdBy || "Admin",
                                email: schoolData.schoolemail || "No Email Provided",
                                phone: schoolData.phone || "No Phone Provided",
                                role: "Admin",
                                schoolName: schoolData.schoolName || "School Not Found",
                                memberId: `${timestamp}00000000`
                            });
                        } else {
                            // ✅ Check members array for the user
                            const member = schoolData.members?.find(member => member.uid === userId);
                            
                            if (member) {
                                setProfileData({
                                    username: member.username || "No Name Provided",
                                    email: member.email || "No Email Provided",
                                    phone: member.phone || "No Phone Provided",
                                    role: member.userRole || "Member",
                                    schoolName: schoolData.schoolName || "School Not Found",
                                    memberId: member.memberId || "No ID Provided",
                                });
                            } else {
                                setProfileData(null);
                            }
                        }
                    } else {
                        console.warn("No school document found for this user");
                        setProfileData(null);
                    }
                };

                useEffect(() => {
                    fetchProfileData();
                }, [uid, currentUser, currentSchool]); // Dependencies ensure it re-runs when these values change

                useEffect(() => {
                    const fetchAttendance = async (userId) => {
                        if (!userId || !currentSchool?.schoolId) return;
            
                        try {
                            const schoolRef = doc(db, "schools", currentSchool?.schoolId);
                            const schoolSnap = await getDoc(schoolRef);
            
                            if (schoolSnap.exists()) {
                                const schoolData = schoolSnap.data();
                                const studentData = schoolData.members.find(member => member.uid === userId);
            
                                if (studentData && Array.isArray(studentData.attendance)) {
                                    setAttendanceRecords(studentData.attendance);
            
                                    let present = 0, absent = 0;
                                    studentData.attendance.forEach(record => {
                                        if (record.Status === "Present") {
                                            present++;
                                        } else if (record.Status === "Absent") {
                                            absent++;
                                        }
                                    });
            
                                    setPresentCount(present);
                                    setAbsentCount(absent);
                                    setUserUid(userId);
                                }
                            }
                        } catch (error) {
                            console.error("Error fetching attendance:", error);
                        }
                    };
            
                    if (uid) {
                        fetchAttendance(uid);
                    } else if (currentRole === "Student") {
                        fetchAttendance(currentUser.uid);
                    }
                }, [uid, currentUser, currentSchool]);
                console.log("viewedUserId:", viewedUserId);

const renderContent = () => {
const totalValue = presentCount + absentCount;
        const chartData = [
            { name: "Present", value: presentCount },
            { name: "Absent", value: absentCount },
        ];
        const COLORS = ["#00C49F", "#FF4848"];

                switch (activeIndex) {
                    case 0:
                        return (
                            <div className='all-items'>
                                <div className='info_item'>
                            <FontAwesomeIcon className='pro_icon' icon={faIdCard}/> 
                            <div className='id_no'>{profileData?.memberId || "No Id Provided"}</div>
                            </div>
                            <div className='info_item'>
                            <FontAwesomeIcon className='pro_icon' icon={faTty}/> 
                            <div className='id_no'>{profileData?.phone || "No Phone Provided"}</div>
                            </div>
                            <div className='info_item'>
                            <FontAwesomeIcon className='pro_icon' icon={faEnvelope}/> 
                            <div className='id_no'>{profileData?.email || "No Email Provided"}</div>
                            </div>
                            </div>
                        );
                    case 1:
                        return (
                            <div className='attend_sec' style={{  marginTop:'1%' }}>             
                                    {totalValue > 0 ? (
                                    <>
                                        <PieChart width={850} height={405}>
                                            <Pie data={chartData} cx="25%" cy="30%" innerRadius={50} outerRadius={90} fill="blue" dataKey="value" label>
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>  
                                            <Tooltip />
                                            <Legend layout='vertical' verticalAlign='top' align="right" 
                                                payload={chartData.map((item, index) => ({
                                                    value: `${item.name} (${item.value})`,
                                                    type: 'square',
                                                    color: COLORS[index % COLORS.length],
                                                }))}
                                            />
                                        </PieChart>
                                        <p className='attendtotal_text'>Total no. of working days ({totalValue})</p> 
                                            <p className='attendhistory_text' onClick={() => {
                                                console.log("Navigating to:", `/attendance/${viewedUserId}`);
                                                navigate(`/attendance/${viewedUserId}`);
                                        }}
                                        style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}>
                                            View attendance history
                                        </p>
                                    </>
                                ) : (
                                    <p style={{height:"125px"}}>No attendance records found.</p>
                                )} 
                            </div>    
                        );
                    case 2:
                        return (
                            <div>
                                <div className='tr_section'>
                                    <div className='table_row'>
                                        <ul class="list-group list-group-flush llist" onClick={() => setViewMarks((prev) => !prev)}>
                                        <li class="li-item">
                                            <div className="item-text text-truncate">IndulekhIndulekhIndulekhIndulekhIndulekhIndulekhIndulekhIndulekh </div>
                                            <div className='sub_name text-truncate'>Total Percentage: 81%</div>
                                        </li>
                                        <div className="item-line"></div>
                                        </ul>
                                    </div>                                                
                                </div>
                                <div className='addmarks_btn'>               
                                    <button className='createbg' onClick={() => navigate('/addmarks')}>
                                        <div className='cricon'>   
                                            <FontAwesomeIcon className='cal_icon' icon={faFileCirclePlus}/>
                                        </div>
                                        <p> Add Marks</p>
                                    </button>
                                </div>
                            </div>
                        );
                    default:
                        return null;
                }
            };
        
const COLORS = ['#00C49F',  'red', '#000'];
const chartData = [
    { name: 'Present', value: 90 },
    { name: 'Absent', value: 10 },
];
    return ( 
        <div className='profilepage'>
            <Header/>
            <Sidebar/>
            <PageInfo/>
            <div className='profile'>
                <div className='contain'>
                    <div className='heads'>
                        <img className='profile_img'  src={acclogo} alt=""></img>
                        <div className='user_name' style={{marginTop:'1%'}} ><h3>{profileData?.username}</h3></div>
                        <div className='school_name' ><h4>{profileData?.schoolName || "School Not Found"}</h4></div>
                        <div className='user_role'>{profileData?.role || "No Role Assigned"}</div>
                    </div>                 
                    <div className='info_container'>
                    {profileData?.role === "Student" && (
                        <>
                        <nav className="navbar navbar-expand-lg">                
                            <div className="container-fluid">
                                <ul className="navbar-nav">
                                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                                        <span className="navbar-toggler-icon"></span>
                                    </button>
                                    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      
                                        {['Info','Attendance','Marks'].map((item, index) => (
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
                        
                    <div className="navbar-line"/>
                    </>
                    )}
                    {viewmarks && <Viewmarks/>}
                        <div className='info'>
                            <div className={`slide-content slide-${activeIndex}`}>
                            {renderContent()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;