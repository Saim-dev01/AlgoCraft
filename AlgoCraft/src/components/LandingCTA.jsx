import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/LandingCTA.css';
import { Player } from '@lottiefiles/react-lottie-player';

function LandingCTA() {
    const navigate = useNavigate();

    const handleStartClick = () => {
        navigate('/start-visualizing');
    };
    return (
        <div className="landing-cta-container container-fluid px-5 mb-4 pb-5">
            <div className="row">
                {/* Left Side - Text */}
                <div className="col-lg-6 left-side d-flex flex-column justify-content-center align-items-start mt-5 mt-lg-0">
                    <h2 className='mt-lg-4 mt-md-3 mt-sm-5 Landing-cta-heading'>Visualise. Learn. Master. </h2>
                    <p className='Landing-cta-para'>
                        Effortlessly bring motion to your algorithms.
                    </p>
                    <button className="btn btn-primary btn-start2" onClick={handleStartClick}>Start Visualizing!</button>
                </div>
                {/* Right Side - Lottie Animation */}
                <div className="col-lg-6 d-flex flex-column justify-content-center align-items-center">
                    <Player
                        autoplay
                        loop
                        src="https://lottie.host/01a2db03-d889-482d-8722-6f645f7f3f39/pgftVRlAmm.json"
                        className="animation-container2"
                    />
                </div>


            </div>
        </div>
    );
}

export default LandingCTA;

