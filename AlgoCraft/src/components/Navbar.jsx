import React, { useEffect, useState } from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth"; // ✅ Firebase imports
import { saveUserSession } from "../utils/userSessions";
import logo from "../assets/logo.png";
import "../style/Navbar.css";

function CustomNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth(); // ✅ Get the current Firebase auth instance

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const id = location.hash.replace("#", "");
    if (id) {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  const handleLogout = async () => {
    try {
      await saveUserSession("logout", {}, null, null, "User logged out");
      alert("Logout successfully!");
    } catch (e) {
      // ignore error
    }
    signOut(auth)
      .then(() => {
        console.log("User signed out");
        // Use navigate(-1) to go back to previous page, or fallback to home if not possible
        if (window.history.length > 1) {
          navigate(-1);
        } else {
          navigate("/");
        }
      })
      .catch((error) => {
        console.error("Error signing out:", error);
        // Optional: show an alert or toast here
      });
  };

  return (
    <Navbar
      bg="white"
      variant="light"
      sticky="top"
      className={`mt-2 ${isScrolled ? "shadow-sm" : ""}`}
      expand="lg"
    >
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
            <Nav.Link as={Link} to="/#features" className="mx-3">
              Features
            </Nav.Link>
            <Nav.Link as={Link} to="/#how-to-visualize" className="mx-3">
              How to Visualize
            </Nav.Link>
            <Nav.Link as={Link} to="/#about-us" className="mx-3">
              About Us
            </Nav.Link>
            <Nav.Link as={Link} to="/#contact" className="mx-3">
              Contact
            </Nav.Link>
            {user && (
              <Nav.Link as={Link} to="/history" className="mx-3">
                History
              </Nav.Link>
            )}
          </Nav>
          <Nav>
            <Nav.Link as={Link} to="/start-visualizing">
              <Button variant="primary" className="btn-start-visualizing">
                Start Visualizing!
              </Button>
            </Nav.Link>
            {!user && (
              <>
                <Nav.Link as={Link} to="/login">
                  <Button
                    variant="primary"
                    className="btn-login"
                    style={{ marginLeft: 8 }}
                  >
                    Login
                  </Button>
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  <Button
                    variant="primary"
                    className="btn-signup"
                    style={{ marginLeft: 8 }}
                  >
                    Sign Up
                  </Button>
                </Nav.Link>
              </>
            )}
            {user && (
              <Nav.Link onClick={handleLogout}>
                <Button
                  variant="primary"
                  className="btn-signup"
                  style={{ marginLeft: 8 }}
                >
                  Logout
                </Button>
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default CustomNavbar;
