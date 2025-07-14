import { useNavigate } from "react-router-dom";
import { Player } from "@lottiefiles/react-lottie-player";
import "../style/Hero.css";

function Hero() {
  const navigate = useNavigate();

  const handleStartClick = () => {
    navigate("/start-visualizing");
  };

  return (
    <div className="hero-section container-fluid position-relative overflow-hidden">
      <div className="hero-inner row">
        {/* Left Column: Text and CTA */}
        <div className="col-lg-6 ps-lg-5 col-12 text-lg-start pt-5 pe-2 mt-5 mb-lg-5">
          <h1 className="hero-title">
            Great learning comes alive with visuals!
          </h1>
          <p className="hero-subtitle">
            Visualize, learn, and master algorithms with ease.
          </p>
          <button
            className="btn btn-primary btn-start"
            onClick={handleStartClick}
          >
            Start Visualizing!
          </button>
        </div>

        {/* Right Column: Lottie Animation */}
        <div className="col-lg-6 col-12 position-relative">
          <Player
            autoplay
            loop
            src="https://lottie.host/c8b051c1-6ea9-403f-bf67-ee2311ec1a70/QWB2779l1g.json"
            className="heroIllustration"
          />
        </div>
      </div>
    </div>
  );
}

export default Hero;
