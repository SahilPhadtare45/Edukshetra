import React, { useState, useRef, useEffect } from 'react';
import './homepage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus,faGear } from '@fortawesome/free-solid-svg-icons';
import Header from '../Comman/header';
import workplace from '../Hompage/workplace.jpg';
import Add from './Add/add.jsx';
import school from '../../images/schoolimg.jpg';
import desk from '../../images/deskbg.jpg';
import books from '../../images/download.jpg';
const Homepage = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [underlineStyle, setUnderlineStyle] = useState({});
    const navItemsRef = useRef([]);
    const [showAddComponent, setShowAddComponent] = useState(false);
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

    return (
        <>
        <div className="homepage">
            
        <Header/>
        
            <nav className="navbar navbar-expand-lg">
                
                <div className="container-fluid">
                    <ul className="navbar-nav">
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      
                        {['All', 'Admin', 'Teachers', 'Students'].map((item, index) => (
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
                <FontAwesomeIcon className="plusicon" onClick={() => setShowAddComponent((prev) => !prev)} icon={faPlus} />
                <FontAwesomeIcon className="gearicon" icon={faGear} />
            </nav>
            {showAddComponent && <Add />}
            <div className="navbar-line"></div>

            <div class="list-group">
            <ul className="container maincon">
                
                    <li className='card concard'>                    
                        <img src={workplace} className="card-img cardimg d-none d-md-block" alt="..." />                       
                        <div className="card-img-overlay">
                        <h5 className="card-text role"><small>Role:Admin</small></h5>
                        <div className="card-title title text-truncate">Navodaya English High School</div>
                        <div style={{display:'flex'}}>
                            <img className="school-logo" src={school} alt='...'/>
                            <h5 className="card-text shortform">N.E.H.S</h5>
                        </div>
                        </div>                        
                    </li>                   
               
                
                    <li className='card concard'>                    
                        <img src={desk} className="card-img cardimg d-none d-md-block" alt="..." />                       
                        <div className="card-img-overlay">
                        <h5 className="card-text role"><small>Role:Admin</small></h5>
                        <div className="card-title title text-truncate">Navodaya English High School</div>
                        <h5 className="card-text shortform">N.E.H.S</h5>
                        </div>                        
                    </li>                   
               
                
                    <li className='card concard'>                    
                        <img src={books} className="card-img cardimg d-none d-md-block" alt="..." />                       
                        <div className="card-img-overlay">
                        <h5 className="card-text role"><small>Role:Admin</small></h5>
                        <div className="card-title title text-truncate">Navodaya English High School</div>
                        <h5 className="card-text shortform">N.E.H.S</h5>
                        </div>                        
                    </li>                   
                
                
                    <li className='card concard'>                    
                        <img src={workplace} className="card-img cardimg d-none d-md-block" alt="..." />                       
                        <div className="card-img-overlay">
                        <h5 className="card-text role"><small>Role:Admin</small></h5>
                        <div className="card-title title text-truncate">Navodaya English High School</div>
                        <h5 className="card-text shortform">N.E.H.S</h5>
                        </div>                        
                    </li>                   
                
                
                    <li className='card concard'>                    
                        <img src={desk} className="card-img cardimg d-none d-md-block" alt="..." />                       
                        <div className="card-img-overlay">
                        <h5 className="card-text role"><small>Role:Admin</small></h5>
                        <div className="card-title title text-truncate">Navodaya English High School</div>
                        <h5 className="card-text shortform">N.E.H.S</h5>
                        </div>                        
                    </li>                   
                
            </ul>
            </div>
        </div>
        </>
    );
};

export default Homepage;
