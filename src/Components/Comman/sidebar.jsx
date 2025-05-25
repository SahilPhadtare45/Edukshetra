import React from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faChalkboardTeacher, faUsers, faClipboard, faTasks, faCheckSquare,faUsersRectangle, faUser,faSchool, faDoorOpen,faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import './sidebar.css';
import Schoolimg from '../../images/schoolimg.jpg';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import  { useState, useEffect } from 'react';
import { useUserStore } from '../../Firebase/userstore';
const Sidebar = () => {
    const [schoolLogo, setSchoolLogo] = useState('');
    const [schoolName, setSchoolName] = useState('your school'); // Default value
    const currentSchool = useUserStore((state) => state.currentSchool); // Access currentSchool from Zustand
    useEffect(() => {
        if (currentSchool) {
            setSchoolLogo(currentSchool.logoUrl || Schoolimg); // Use logoURL or a default image
            setSchoolName(currentSchool.shortForm || "Your School"); // Use shortForm or a default value
        }
    }, [currentSchool]); // Re-run when currentSchool changes
    return (
        <div className="sidebar">
            <img src={schoolLogo || Schoolimg} className="sclimg" alt='..' />
            <div style={{alignItems: "center",justifyItems: "center"}}>
            <div className='sclname'>{schoolName}</div></div>
            <NavLink to="/home" className="home">
                        <FontAwesomeIcon icon={faHome} /> Home
            </NavLink>
            <ul>
                <li>
                </li>
                <li>
                    <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
                        <FontAwesomeIcon icon={faClipboard} /> 
                        <div className='screens'>Class</div>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/teachers" className={({ isActive }) => (isActive ? 'active' : '')}>
                        <FontAwesomeIcon icon={faChalkboardTeacher} />
                        <div className='screens'> Teachers</div>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/students" className={({ isActive }) => (isActive ? 'active' : '')}>
                        <FontAwesomeIcon icon={faUsersRectangle} />
                        <div className='screens'> Students</div>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/classwork" className={({ isActive }) => (isActive ? 'active' : '')}>
                        <FontAwesomeIcon icon={faTasks} /> 
                        <div className='screens'>Classwork</div>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/attendance" className={({ isActive }) => (isActive ? 'active' : '')}>
                        <FontAwesomeIcon icon={faCheckSquare} />
                        <div className='screens'> Attendance</div>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/people" className={({ isActive }) => (isActive ? 'active' : '')}>
                        <FontAwesomeIcon icon={faUsers} />
                        <div className='screens'> People</div>
                    </NavLink>
                </li>
                <div className="line"></div>
                <li>
                    <NavLink to="/profile" className={({ isActive }) => (isActive ? 'active' : '')}>
                        <FontAwesomeIcon icon={faUser} /> 
                        <div className='screens'>Profile</div>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/leave-school" className={({ isActive }) => (isActive ? 'active' : '')}>
                        <FontAwesomeIcon icon={faArrowRightFromBracket} /> 
                        <div className='screens'>Leave School</div>
                    </NavLink>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;
