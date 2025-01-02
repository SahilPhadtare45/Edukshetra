import './people.css';
import Header from "../../Comman/header";
import Sidebar from "../../Comman/sidebar";
import PageInfo from "../../Comman/pageinfo";
import acclogo from '../../../images/acclogo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTrash,faUser } from '@fortawesome/free-solid-svg-icons';
const People = () => {
    return ( 
        <div className='peoplepage'>
            <Header/>
            <Sidebar/>
            <PageInfo/>
            <div className='people'>
                <div className='contain'>
                    <div class="form-floating mb-3 name">               
                        <input type="text" class="form-control nameinsr " id="floatingInput" placeholder="Search"/>
                        <label  for="floatingInput">Search&nbsp;<FontAwesomeIcon icon={faSearch} /></label>
                        <button class="btn btn-outline-secondary srbtn" type="button" id="button-addon1">Search</button>
                    </div>
                
                    <div className='table_title' style={{display:"flex"}}>
                        <div style={{marginLeft:'4%',marginTop:'1%',fontWeight:'bold'}}>EMAIL</div>
                        <div style={{marginLeft:'54.5%',marginTop:'1%',fontWeight:'bold'}}>ID</div>
                    </div>
                    <div className='tr_section'>
                        <div className='table_row'>
                            <ul class="list-group list-group-flush llist">
                                <li class="li-item">
                                    <img className='people_img'  src={acclogo} alt=""></img>
                                    <div className="item-text text-truncate">sahilphadare1045@gmail.com</div>
                                    <div className='sub_name text-truncate'>51144544488</div>
                                    <FontAwesomeIcon className='trash_icon' icon={faTrash}/>
                                </li>
                            </ul>
                        </div>
                        <div className='table_row'>
                            <ul class="list-group list-group-flush llist">
                                <li class="li-item">
                                    <img className='people_img'  src={acclogo} alt=""></img>
                                    <div className="item-text text-truncate">sahilphadare1045@gmail.com</div>
                                    <div className='sub_name text-truncate'>51144544488</div>
                                    <FontAwesomeIcon className='trash_icon' icon={faTrash}/>
                                </li>
                            </ul>
                        </div>          
                    </div>
                </div>
            </div>
        </div>
     );
}
 
export default People;