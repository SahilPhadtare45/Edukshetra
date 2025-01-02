import React from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faChalkboardTeacher, faUsers, faClipboard, faTasks, faCheckSquare,faUsersRectangle, faUser,faSchool, faDoorOpen,faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import './sidebar.css';
import Schoolimg from '../../images/schoolimg.jpg';

const Sidebar = () => {
    return (
        <div className="sidebar">
            <img src={Schoolimg} className="sclimg" alt='..' />
            <div className='sclname'>N.E.H.S</div>
            <NavLink to="/" className="home">
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
