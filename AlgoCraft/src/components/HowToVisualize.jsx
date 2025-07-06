import React, { useRef, useEffect, useState } from 'react';
import '../style/HowToVisualize.css';
import lottie from 'lottie-web';

function HowToVisualize() {
    const containerRef = useRef(null);
    const [isVisibleFirst, setIsVisibleFirst] = useState(false);
    const [isVisibleSecond, setIsVisibleSecond] = useState(false);
    const [isVisibleThird, setIsVisibleThird] = useState(false);
    const [isVisibleFourth, setIsVisibleFourth] = useState(false); // State for the fourth div
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        const animation = lottie.loadAnimation({
            container: containerRef.current,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: 'https://lottie.host/8109268b-056d-4a10-ab50-b7e81a0c69ca/ki7Iy970JB.json',
        });

        animation.setSpeed(0.3);

        return () => animation.destroy();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            if (!hasAnimated) {
                const element = document.getElementById('slide-in-div-1');
                const rect = element.getBoundingClientRect();
                const viewportHeight = window.innerHeight;

                if (rect.top < viewportHeight && rect.bottom >= 0) {
                    setIsVisibleFirst(true);
                    setHasAnimated(true);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial check on load

        return () => window.removeEventListener('scroll', handleScroll);
    }, [hasAnimated]);

    useEffect(() => {
        if (isVisibleFirst) {
            const timeout = setTimeout(() => {
                setIsVisibleSecond(true);
            }, 1000); // 1000ms = 1 second delay

            return () => clearTimeout(timeout); // Cleanup
        }
    }, [isVisibleFirst]);

    useEffect(() => {
        if (isVisibleSecond) {
            const timeout = setTimeout(() => {
                setIsVisibleThird(true);
            }, 1000); // 1000ms = 1 second delay

            return () => clearTimeout(timeout); // Cleanup
        }
    }, [isVisibleSecond]);

    useEffect(() => {
        if (isVisibleThird) {
            const timeout = setTimeout(() => {
                setIsVisibleFourth(true);
            }, 1000); // 1-second delay

            return () => clearTimeout(timeout);
        }
    }, [isVisibleThird]);

    return (
        <div className="how-to-visualize-container container-fluid text-center pb-0">
            <h1 className="visualize-heading">So Easy to Use!</h1>

            <div className="row">
                <div className="col-lg-6 col-md-12 d-flex justify-content-center">
                    <div ref={containerRef} className='happy-illustration' ></div>
                </div>

                <div id='how-to-visualize' className="col-lg-6 col-md-12 d-flex flex-column pt-lg-5 pt-md-0">
                    {/* First Div */}
                    <div id="slide-in-div-1" className={`slide-in-div1 ${isVisibleFirst ? 'visible' : ''} mt-lg-5`}>
                        <div className="content-wrapper">
                            <div className="number">1.</div>
                            <div className="text">Choose the Data Structure</div>
                        </div>
                    </div>

                    {/* Second Div */}
                    <div id="slide-in-div-2" className={`slide-in-div-2 ${isVisibleSecond ? 'visible' : ''} mt-4`}>
                        <div className="content-wrapper">
                            <div className="number">2.</div>
                            <div className="text">Fill in the Parameters</div>
                        </div>
                    </div>

                    {/* Third Div */}
                    <div id="slide-in-div-3" className={`slide-in-div-3 ${isVisibleThird ? 'visible' : ''} mt-4`}>
                        <div className="content-wrapper">
                            <div className="number">3.</div>
                            <div className="text">Choose an Algorithm</div>
                        </div>
                    </div>

                    {/* Fourth Div */}
                    <div id="slide-in-div-4" className={`slide-in-div-4 ${isVisibleFourth ? 'visible' : ''} mt-4 mb-lg-0 mb-md-4`}>
                        <div className="content-wrapper">
                            <div className="number">4.</div>
                            <div className="text">You're Done!</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HowToVisualize;
