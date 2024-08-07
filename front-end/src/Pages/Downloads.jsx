import React, { useState, useEffect } from 'react';
import axios from 'axios';
import fileDownload from '../assets/download.png';
import fileDownload1 from '../assets/download2.png';
import { loggedInUser } from '../Pages/Login';

const FileUploadDownload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);

  useEffect(() => {
    fetchUploadedFiles();
  }, []);

  const fetchUploadedFiles = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/v1/files');
      setUploadedFiles(response.data);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first!');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('http://localhost:8080/api/v1/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        alert('File uploaded successfully');
        setSelectedFile(null);
        setShowUploadForm(false);
        fetchUploadedFiles();
      } else {
        alert('Failed to upload file');
      }
    } catch (error) {
      console.error('There was an error uploading the file!', error);
      setErrorMessage('File upload failed. Please try again.');
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/v1/files/${fileId}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('There was an error downloading the file!', error);
      setErrorMessage('File download failed. Please try again.');
    }
  };

  const handleDelete = async (fileId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this file?');
    if (!confirmDelete) return;

    try {
      const response = await axios.delete(`http://localhost:8080/api/v1/files/${fileId}`);
      if (response.status === 200) {
        alert('File deleted successfully');
        fetchUploadedFiles();
      } else {
        alert('Failed to delete file');
      }
    } catch (error) {
      console.error('There was an error deleting the file!', error);
      setErrorMessage('File deletion failed. Please try again.');
    }
  };

  return (
    <div>
      <div className="downloadTitle">
        <h3>Downloads</h3>
      </div>

      <div className="downloadLinks">
        <nav>
          <h4>Downloads For Students and PGIS Staff</h4>
          <img src={fileDownload1} alt="fileDownload1" />
          <a className="openlink" href="http://www.pgis.pdn.ac.lk/downloads/students.php">
            <p>Students</p>
          </a>
          <a className="openlink" href="http://www.pgis.pdn.ac.lk/downloads/staff.php">
            <p>PGIS Staff</p>
          </a>
        </nav>
      </div>

      {loggedInUser.isLoggedIn && (
        <div>
          <button className = "addcancelbutton" onClick={() => setShowUploadForm(!showUploadForm)}>
            {showUploadForm ? 'Cancel' : 'Add File'}
          </button>
          {showUploadForm && (
            <div className="uploadSection">
              <input type="file" onChange={handleFileChange} />
              <button onClick={handleUpload}>Upload File</button>
            </div>
          )}
        </div>
      )}

      {errorMessage && <p className="error">{errorMessage}</p>}

      <div className="downloadSection">
        {uploadedFiles.map((file) => (
          <div key={file.fileId} className="fileItem">
            <span><p>{file.fileName}</p></span>
            <img src={fileDownload} alt="fileDownload" />
            <button onClick={() => handleDownload(file.fileId, file.fileName)}>Download</button>
            {loggedInUser.isLoggedIn && (
              <button onClick={() => handleDelete(file.fileId)}>Delete</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileUploadDownload;
