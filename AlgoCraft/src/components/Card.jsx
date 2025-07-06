// src/components/Card.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

const Card = ({ title, image, description, link }) => {
  const navigate = useNavigate(); // Initialize navigate

  // Function to handle card click
  const handleCardClick = () => {
    if (link) {
      navigate(link); // Navigate to the specified link
    }
  };

  return (
    <div className="card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <img src={image} alt={title} className="card-image" />
      <div className="card-content">
        <h2 className="card-title">{title}</h2>
        <p className="card-description">{description}</p>
      </div>
    </div>
  );
};

export default Card;
