import "bootstrap/dist/css/bootstrap.min.css";
import './header.css';
import acclogo from '../../images/acclogo.png';
import edulogo from '../../images/edulogo.png';
const Header = () => {
    return (         
        <div className="header">
            <div className="left-rec">
                <div className="logo"><img  src={edulogo} alt=""></img></div>
                    <div className="tri-left"></div>
            </div>        
            <div className="parlelo">
                <div className="pfp">
                <img  src={acclogo} alt=""></img>
                </div>
                <div className="username text-truncate">Sahil Phadtare </div>
                
            </div>
        </div>
     );
}
 
export default Header;