import React, { useRef, useEffect } from 'react';
import '../style/AboutUs.css';
import lottie from 'lottie-web';

function AboutUs() {
    const animationContainer = useRef(null);
    let animationInstance = null;

    useEffect(() => {
        animationInstance = lottie.loadAnimation({
            container: animationContainer.current,
            renderer: 'svg',
            loop: true,
            autoplay: false, // Initially set autoplay to false
            path: 'https://lottie.host/a573bb4d-8d26-4a80-8945-af007ef13069/SD8iamCVkd.json',
        });

        return () => animationInstance.destroy(); // Cleanup on component unmount
    }, []);

    const handleMouseEnter = () => {
        animationInstance.play(); // Play animation on hover
    };

    const handleMouseLeave = () => {
        animationInstance.stop(); // Stop animation on mouse leave
    };

    return (
        <div id='about-us' className="about-us-container container-fluid px-5">
            <div className="row">
                {/* Left Side - Text */}
                <div className="col-lg-6 d-flex flex-column justify-content-center mt-5 mt-lg-0">
                    <h2 className='mt-lg-0 mt-md-3 mt-sm-5 About-us-heading'>About Us</h2>
                    <p className='About-us-para'>
                        We are a group of passionate Computer Science students from NUML, dedicated to exploring the
                        world of technology and innovation. The curiosity and a passion for technology drives us to solve complex
                        problems, develop creative solutions, and contribute to the evolving tech landscape. We believe
                        in the power of teamwork, learning, and applying knowledge to create impactful projects. Join us
                        as we continue to push the boundaries of what’s possible!
                    </p>
                </div>

                {/* Right Side - Lottie Animation */}
                <div className="col-lg-6 d-flex flex-column align-items-center">
                    <div
                        className="animation-container"
                        ref={animationContainer}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        
                    ></div>
                </div>
            </div>
        </div>
    );
}

export default AboutUs;
