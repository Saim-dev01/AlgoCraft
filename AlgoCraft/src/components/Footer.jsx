import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import "../style/Footer.css";

function Footer() {
  return (
    <footer className="footer-container">
      <div id="contact" className="footer-content">
        <h4 className="footer-text">Have questions? Contact us at</h4>
        <p className="footer-email">webcrafters@gmail.com</p>

        <div className="social-icons">
          <a href="https://facebook.com" aria-label="Facebook">
            <FaFacebook />
          </a>
          <a href="https://twitter.com" aria-label="Twitter">
            <FaTwitter />
          </a>
          <a href="https://instagram.com" aria-label="Instagram">
            <FaInstagram />
          </a>
          <a href="https://linkedin.com" aria-label="LinkedIn">
            <FaLinkedin />
          </a>
        </div>

        <p className="footer-text">We&#39;d love to hear from you!</p>

        <div className="footer-bottom">
          <p>
            &copy; {new Date().getFullYear()} WebCrafters. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
