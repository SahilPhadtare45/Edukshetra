import React from "react";
import "./notice.css"; // Ensure styles for the popup
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
const Notice = ({ notice, onClose }) => {
    if (!notice) return null;

    return (
        <div className="notice-details">
            <div className="notice-content">
                    <FontAwesomeIcon className="xicon" onClick={onClose} icon={faCircleXmark} />
                <div className="nt-bg">
                <h2>{notice.title || "Notice"}</h2></div>
                <div className="content-area">

              <p><strong>To:</strong> {notice.to}</p>
                <p className="notice-date">
                    {notice.timestamp
                        ? new Date(notice.timestamp.seconds * 1000).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                        })
                        : "Invalid Date"}
                </p>
                <p className="notice-item">{notice.text}</p>
                </div>
            </div>
        </div>
    );
};

export default Notice;
