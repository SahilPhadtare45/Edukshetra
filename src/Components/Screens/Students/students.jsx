import './students.css';
import Header from "../../Comman/header";
import Sidebar from "../../Comman/sidebar";
import PageInfo from "../../Comman/pageinfo";
import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faTrash,faUser } from '@fortawesome/free-solid-svg-icons';
import Addstudents from './Addstudents/addstudents.jsx';
const Students = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [underlineStyle, setUnderlineStyle] = useState({});
    const navItemsRef = useRef([]);
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
     const [addStupage, setAddStupage] = useState(false);
    return ( 
        <div className="studentscreen">
            <Header/>
            <Sidebar/>
            <PageInfo/>
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
            <div className='tr'> <p>Students</p></div>
            <div className='cricon'>
            <FontAwesomeIcon className='adicon'  onClick={() => setAddStupage((prev) => !prev)} icon={faUserPlus}/>
            </div>
            {addStupage && <Addstudents/>}
            <div className='table_title' style={{display:"flex"}}>
               <div style={{marginLeft:'4%',marginTop:'1%',fontWeight:'bold'}}>Name</div>
               <div style={{marginLeft:'44%',marginTop:'1%',fontWeight:'bold'}}>Roll No.</div>
            </div>
            <div className='tr_section'>
                    <div className='table_row'>
                    <ul class="list-group list-group-flush llist">
                    <li class="li-item">
                        <div className="item-text text-truncate">IndulekhIndulekhIndulekhIndulekhIndulekhIndulekhIndulekhIndulekh </div>
                            <div className='sub_name text-truncate'>1</div>
                        <FontAwesomeIcon className='prof_icon' icon={faUser}/>
                        <FontAwesomeIcon className='trash_icon' icon={faTrash}/>     
                    </li>
                    </ul>
                    </div>
                    <div className="navbar-line1"></div>

                    <div className='table_row'>
                    <ul class="list-group list-group-flush llist">
                    <li class="li-item">
                        <div className="item-text text-truncate">IndulekhIndulekhIndulekhIndulekhIndulekhIndulekhIndulekhIndulekh </div>
                            <div className='sub_name text-truncate'>1</div>
                        <FontAwesomeIcon className='prof_icon' icon={faUser}/>
                        <FontAwesomeIcon className='trash_icon' icon={faTrash}/>                  
                    </li>
                    </ul>
                    </div>
                    <div className="navbar-line1"></div>

                    <div className='table_row'>
                    <ul class="list-group list-group-flush llist">
                    <li class="li-item">
                        <div className="item-text text-truncate">IndulekhIndulekhIndulekhIndulekhIndulekhIndulekhIndulekhIndulekh </div>
                            <div className='sub_name text-truncate'>1</div>
                        <FontAwesomeIcon className='prof_icon' icon={faUser}/>
                        <FontAwesomeIcon className='trash_icon' icon={faTrash}/>                  
                    </li>
                    </ul>
                    </div>
                    <div className="navbar-line1"></div>

            </div>
        </div>
            
        </div>
        
     );
}
 
export default Students;