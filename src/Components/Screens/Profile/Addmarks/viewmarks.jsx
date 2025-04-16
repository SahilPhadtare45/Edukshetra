import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../../Firebase/firebase";
import Header from "../../../Comman/header";
import Sidebar from "../../../Comman/sidebar";
import "./viewmarks.css";
import html2pdf from "html2pdf.js";
import { useUserStore } from "../../../../Firebase/userstore"; // ✅ Zustand Store for currentUser

// ...inside your component...

const ViewMarks = () => {
  const { uid, examTitle } = useParams();
  const [student, setStudent] = useState(null);
  const [schoolName, setSchoolName] = useState("");
  const [marksList, setMarksList] = useState([]);
  const [percentage, setPercentage] = useState("");
  const { currentSchool, currentUser, currentRole } = useUserStore();
  
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const studentUID = !uid || uid === "undefined" ? currentUser?.uid : uid;
        if (!studentUID) {
          console.warn("UID not available.");
          return;
        }
  
        const schoolRef = doc(db, "schools", currentSchool.schoolId);
        const schoolSnap = await getDoc(schoolRef);
  
        if (!schoolSnap.exists()) {
          console.warn("School not found.");
          return;
        }
  
        const schoolData = schoolSnap.data();
        setSchoolName(schoolData.schoolName);
  
        const member = schoolData.members.find((m) => m.uid === studentUID);
        if (!member) {
          console.warn("Student not found.");
          return;
        }
  
        setStudent(member);
  
        const examEntry = member.marks.find((mark) =>
          mark.hasOwnProperty(examTitle)
        );
  
        if (!examEntry) {
          console.warn("Exam title not found for user.");
          return;
        }
  
        const examData = examEntry[examTitle];
        const extractedPercentage = examData[0]?.percentage || "";
        const subjectMarks = examData.slice(1);
  
        setPercentage(extractedPercentage);
        setMarksList(subjectMarks);
      } catch (error) {
        console.error("Error fetching report data:", error);
      }
    };
  
    fetchReportData();
  }, [uid, examTitle, currentUser]);
  

  const handleDownloadPDF = () => {
    const element = document.getElementById("reportCardPDF");
  
    if (!element) {
      console.error("Element not found: reportCardPDF");
      return;
    }
  
    const opt = {
      margin:       0.5,
      filename:     `${student?.username || "Student"}_ReportCard.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
  
    // Wait for DOM rendering (just in case)
    setTimeout(() => {
      html2pdf().set(opt).from(element).save();
    }, 100);
  };
  
  return (
    <div className="viewmarkspage">
    <Header />
    <Sidebar />
    
    <div className="reportcard-container">
      <button className="pdf-download-btn" onClick={handleDownloadPDF}>
        Download PDF
      </button>
  
      <div id="reportCardPDF"> {/* This is important */}
        <h2>Report Card</h2>
        <p><strong>School:</strong> {schoolName}</p>
        <p><strong>Student Name:</strong> {student?.username}</p>
        <p><strong>Class:</strong> {student?.classes?.[0]?.className}</p>
        <p><strong>Exam Title:</strong> {examTitle}</p>
  
        <table className="marks-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Marks Obtained</th>
              <th>Total Marks</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {marksList.map((item, index) => (
              <tr key={index}>
                <td>{item.subject}</td>
                <td>{item.marksObtained}</td>
                <td>{item.totalMarks}</td>
                <td>{((item.marksObtained / item.totalMarks) * 100).toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
  
        <h4 className="final-percentage">Overall Percentage: {percentage}</h4>
        <p className="disclaimer">
          <em>Note: These results are not official. This report card is generated via the Eduक्षेत्र website.</em>
        </p>
      </div>
    </div>
  </div>
  
  );
};

export default ViewMarks;
