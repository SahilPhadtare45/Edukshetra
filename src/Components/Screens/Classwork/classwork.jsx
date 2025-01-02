import './classwork.css';
import Header from "../../Comman/header";
import Sidebar from "../../Comman/sidebar";
import PageInfo from "../../Comman/pageinfo";
import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const Classwork = () => {
    const navigate = useNavigate();
    return (    
        <div className='classworkpage'>
        <Header/>
        <Sidebar/>
        <PageInfo/>      
        <div className='classwork'>
            <button className='createbg' onClick={() => navigate('/creatework')}>
                    <div className='cricon'>   
                    <FontAwesomeIcon className='createicon' icon={faPlus}/>
                    </div>
                <p>Create</p>
            </button>
            <div className='work-container'>
                <div className='head'>
                <div className='con-title'>orySto</div>
                <div className='timeposted'>Posted 12.01pm</div>
                </div>
                <div className='content'>In a world where cricket meets Naruto, villages form their own cricket teams, mixing skill and chakra. Naruto is a fiery batsman using Shadow Clones to confuse bowlers; Sasuke’s Sharingan helps him deliver precise, lightning-fast yorkers. Sakura’s immense strength smashes boundaries, while Gaara from the Sand Village defends with his sand barrier. Each match is a thrilling blend of strategy, teamwork, and ninja techniques, creating an unforgettable fusion of cricket and shinobi spirit.</div>
                <br/>
            </div>
            <div className='work-container'>
                <div className='head'>
                <div className='con-title'>StoryStoryStoryStoryStoryStoryStoryStoryStoryStoryStoryStoryStoryStoryStoryStoryStoryStoryStoryStory</div>
                <div className='timeposted'>Posted 12.01pm</div>
                </div>
                <div className='content'> rs; Sasuke’s Sharingan helps him deliver precise, lightning-fast yorkers. Sakura’s immense strength smashes boundaries, while Gaara from the Sand Village defends with his sand barrier. Each match is a thrilling blend of strategy, teamwork, and ninja techniques, creating an unforgettable fusion of cricket and shinobi spirit.</div>
                <br/>
            </div><div className='work-container'>
                <div className='head'>
                <div className='con-title'>StoryStoryStoryStoryStoryStoryStoryStoryStoryStoryStoryStoryStoryStoryStoryStoryStoryStoryStoryStory</div>
                <div className='timeposted'>Posted 12.01pm</div>
                </div>
                <div className='content'>In a world where cricket meets Naruto, villages form their own cricket teams, mixing skill and chakra. Naruto is a fiery batsman using Shadow Clones to confuse bowlers; Sasuke’s Sharingan helps him deliver precise, lightning-fast yorkers. Sakura’s immense strength smashes boundaries, while Gaara from the Sand Village defends with his sand barrier. Each match is a thrilling blend of strategy, teamwork, and ninja techniques, creating an unforgettable fusion of cricket and shinobi spirit.</div>
                <br/>
            </div><div className='work-container'>
                <div className='head'>
                <div className='con-title'>StoryStoryStoryStoryStoryStoryStoryStoryStoryStoryStoryStoryStoryStoryStoryStoryStoryStoryStoryStory</div>
                <div className='timeposted'>Posted 12.01pm</div>
                </div>
                <div className='content'>In a world where cricket meets Naruto, villages form their own cricket teams, mixing skill and chakra. Naruto is a fiery batsman using Shadow Clones to confuse bowlers; Sasuke’s Sharingan helps him deliver precise, lightning-fast yorkers. Sakura’s immense strength smashes boundaries, while Gaara from the Sand Village defends with his sand barrier. Each match is a thrilling blend of strategy, teamwork, and ninja techniques, creating an unforgettable fusion of cricket and shinobi spirit.</div>
                <br/>
            <br/>
            </div>  
        </div>
        </div>
     );
}
 
export default Classwork;