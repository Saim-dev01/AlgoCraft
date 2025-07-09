// src/App.jsx
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import CustomNavbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import HowToVisualize from './components/HowToVisualize';
import AboutUs from './components/AboutUs';
import LandingCTA from './components/LandingCTA';
import Footer from './components/Footer';
import HomeCards from './Pages/HomeCards';
import ArrayForm from './Pages/ArrayForm';
import LinkedListForm from './Pages/LinkListForm';
import GraphForm from './Pages/GraphForm';
import TreeForm from './Pages/TreeForm';
import './style/App.css';
import Register from './Pages/Register';
import Login from './Pages/Login';  
import Visualization from './Pages/Visualization';
import LLVisualization from './Pages/LLvisualizaion';
import TreeVisualization from './Pages/TreeVisualization';
import './style/bubble.css';
import GraphVisualization from './Pages/GraphVisualization';
// Simple auth check: you can replace this with your real auth logic
function isAuthenticated() {
  return !!localStorage.getItem('user');
}

function PrivateRoute({ element }) {
  const location = useLocation();
  if (!isAuthenticated()) {
    // Redirect to login, preserve where user wanted to go
    window.location.href = '/login';
    return null;
  }
  return element;
}

function App() {
  return (
    <Router>
      <div className="App">
        <CustomNavbar />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/main" element={<PrivateRoute element={
            <>
              <div id="hero">
                <Hero />
              </div>
              <div id="features">
                <Features />
              </div>
              <div id="how-to-visualize">
                <HowToVisualize />
              </div>
              <div id="about-us">
                <AboutUs />
              </div>
              <div id="landing-cta">
                <LandingCTA />
              </div>
            </>
          } />} />
          <Route path="/start-visualizing" element={<PrivateRoute element={<HomeCards />} />} />
          <Route path="/array-form" element={<PrivateRoute element={<ArrayForm />} />} />
          <Route path="/visualization" element={<PrivateRoute element={<Visualization />} />} />
          <Route path="/LLvisualization" element={<PrivateRoute element={<LLVisualization />} />} />
          <Route path="/linklist-form" element={<PrivateRoute element={<LinkedListForm />} />} />
          <Route path="/tree-form" element={<PrivateRoute element={<TreeForm />} />} />
          <Route path="/graph-form" element={<PrivateRoute element={<GraphForm />} />} />
          <Route path="/tree-visualization" element={<PrivateRoute element={<TreeVisualization />} />} />
          <Route path="/graph-visualization" element={<PrivateRoute element={<GraphVisualization />} />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
