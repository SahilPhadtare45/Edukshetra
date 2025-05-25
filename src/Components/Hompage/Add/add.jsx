import Createform from './createform.jsx';
import Joinform from './joinform.jsx';
import { useState } from 'react';
import React from 'react-dom';
import './add.css';
const Add = () => {
    const [addMode, setAddMode] = useState(false);
    const [addMode1, setAddMode1] = useState(false);

    return (
        <div className='addcontainer'>
            <div className="bts">
                <div onClick={() => setAddMode((prev) => !prev)}>
                    <button type="button" className="createbtn">Create</button>
                </div>
                <div onClick={() => setAddMode1((prev) => !prev)}>
                    <button type="button" className="joinbtn">Join</button>
                </div>
                {addMode && <Createform />}
                {addMode1 && <Joinform />}    
            </div>           
        </div>
      );
}
 
export default Add;