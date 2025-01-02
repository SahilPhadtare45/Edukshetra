import './profile.css';
import Header from "../../Comman/header";
import Sidebar from "../../Comman/sidebar";
import PageInfo from "../../Comman/pageinfo";
import Viewmarks from "../Profile/Addmarks/viewmarks"
import { PieChart, Pie, Cell, Legend } from 'recharts';
import acclogo from '../../../images/acclogo.png';
import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faFileCirclePlus, faIdCard,faTty } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';    
const Profile = () => {
    const navigate = useNavigate();
    const [activeIndex, setActiveIndex] = useState(0);
    const [underlineStyle, setUnderlineStyle] = useState({});
    const navItemsRef = useRef([]);
    const [viewmarks,setViewMarks] = useState(false);
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
const renderContent = () => {
const totalValue = chartData.reduce((sum, entry) => sum + entry.value, 0);

                switch (activeIndex) {
                    case 0:
                        return (
                            <div>
                                <div className='info_item'>
                            <FontAwesomeIcon className='pro_icon' icon={faIdCard}/> 
                            <div className='id_no'>0000000001</div>
                            </div>
                            <div className='info_item'>
                            <FontAwesomeIcon className='pro_icon' icon={faTty}/> 
                            <div className='id_no'>0000000001</div>
                            </div>
                            <div className='info_item'>
                            <FontAwesomeIcon className='pro_icon' icon={faEnvelope}/> 
                            <div className='id_no'>sahilphadtare2wsxcf</div>
                            </div>
                            </div>
                        );
                    case 1:
                        return (
                            <div className='attend_sec' style={{  marginTop:'1%' }}>             
                                    <PieChart width={850} height={300} >
                                        <Pie
                                            data={[{ name: 'Total', value: totalValue }]}  // Only one value to cover the entire pie
                                            cx="25%"
                                            cy="40%"
                                            innerRadius={20}   // Creates the 'donut' shape
                                            outerRadius={50}  // Outer radius of the donut
                                            fill="#E8E8E8"      // Background color
                                            dataKey="value"
                                            >
                                        <Cell fill="rgba(0, 0, 0, 0.4)"/>
                                        </Pie>
                                            <Pie data={chartData} cx="25%" cy="40%" innerRadius={50} outerRadius={90} fill="blue" dataKey="value" label >
                                            
                                                {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>  
                                            <Legend  layout='vertical' verticalAlign='top' align="right"  payload={chartData.map((item, index) => ({ value: `${item.name} (${item.value})`,
                                                type: 'square',
                                                color: COLORS[index % COLORS.length],
                                            }))}
                                            />
                                    </PieChart> 
                                    <p className='attendtotal_text'>Total no. of working days (100)</p> 
                                        <p className='attendhistory_text'>View attendance history</p> 
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
                        <div className='user_name' style={{marginTop:'1%'}} ><h3>Sahil Phadtare</h3></div>
                        <div className='school_name' ><h4>Navodaya English High School</h4></div>
                        <div className='user_role'>Admin</div>
                    </div>                 
                    <div className='info_container'>
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
                    <div className="navbar-line"></div>
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