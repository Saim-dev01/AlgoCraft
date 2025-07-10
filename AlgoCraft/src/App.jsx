// src/App.jsx
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
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
import History from './Pages/History';

function App() {
  return (
    <Router>
      <div className="App">
        <CustomNavbar />
        <Routes>
          {/* Redirect root to /main for guests */}
          <Route path="/" element={<Navigate to="/main" replace />} />
          <Route path="/main" element={
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
          } />
             <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
          <Route path="/start-visualizing" element={<HomeCards />} />
          <Route path="/array-form" element={<ArrayForm />} />
          <Route path="/visualization" element={<Visualization />} />
          <Route path="/LLvisualization" element={<LLVisualization />} />
          <Route path="/linklist-form" element={<LinkedListForm />} />
          <Route path="/tree-form" element={<TreeForm />} />
          <Route path="/graph-form" element={<GraphForm />} />
          <Route path="/tree-visualization" element={<TreeVisualization />} />
          <Route path="/graph-visualization" element={<GraphVisualization />} />
          <Route path="/history" element={<History />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
