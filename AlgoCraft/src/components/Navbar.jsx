import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth'; // ✅ Firebase imports
import logo from '../assets/logo.png';
import '../style/Navbar.css';

function CustomNavbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
     const auth = getAuth(); // ✅ Get the current Firebase auth instance

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const id = location.hash.replace('#', '');
        if (id) {
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [location]);

        const handleLogout = () => {
    signOut(auth)
            .then(() => {
                console.log('User signed out');
                navigate('/'); // Redirect to home or login
            })
            .catch((error) => {
                console.error('Error signing out:', error);
                // Optional: show an alert or toast here
            });
   
    };

    return (
        <Navbar bg="white" variant="light" sticky="top" className={`mt-2 ${isScrolled ? 'shadow-sm' : ''}`} expand="lg">
            <Container>
                <Navbar.Brand href="/main">
                    <img
                        src={logo}
                        alt="Logo"
                        width="185"
                        height="auto"
                        onClick={() => window.scrollTo(0, 0)} // Scroll to top on logo click
                    />
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mx-auto">
                        <Nav.Link as={Link} to="/#features" className="mx-3">Features</Nav.Link>
                        <Nav.Link as={Link} to="/#how-to-visualize" className="mx-3">How to Visualize</Nav.Link>
                        <Nav.Link as={Link} to="/#about-us" className="mx-3">About Us</Nav.Link>
                        <Nav.Link as={Link} to="/#contact" className="mx-3">Contact</Nav.Link>
                    </Nav>
                    <Nav>
                        <Nav.Link as={Link} to="/start-visualizing"> {/* Use Link to navigate */}
                            <Button
                                variant="primary"
                                className="btn-start-visualizing"
                            >
                                Start Visualizing!
                            </Button>
                        </Nav.Link>
                        <Nav.Link onClick={handleLogout}> {/* Use onClick for logout */}
                            <Button
                                variant="primary"
                                className="btn-start-visualizing"
                            >
                                Logout
                            </Button>
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default CustomNavbar;
