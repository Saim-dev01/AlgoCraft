import React, { useRef } from 'react';
import '../style/Features.css'; // Import the CSS file
import { Player } from '@lottiefiles/react-lottie-player'; // Import Lottie player

function Features() {
    // Create refs for each Lottie player
    const playerRef1 = useRef(null);
    const playerRef2 = useRef(null);
    const playerRef3 = useRef(null);

    return (
        <>
            <div id="features" className=" features-heading text-center mb-4 p-lg-0 mt-lg-0">
                <p className='heading1 mt-md-5 mt-sm-4 px-md-4 mx-sm-5'>
                    AlgoCraft: The Ultimate Algorithm Master Suite
                </p>
                {/* <p className='subheading1'>Your Gateway to Mastering Algorithms!</p> */}
            </div>
            <div className="features mt-lg-5 container-fluid px-5 pb-3">
                <div className="row">
                    <div className="col-lg-8 feature-left">
                        <div className="left-inner m-5">
                            <div className="left-inner1 mb-4">
                                <h1 className='left-innerh1'>Say no to the Boring Learning Experience!</h1>
                            </div >
                            <div className="left-inner2 mt-4">
                                <div className="pills me-3 mt-1 p-4 mb-3 shadow-sm">Enhance Learning in Classrooms</div>
                                <div className="pills me-3 mt-1 p-4 mb-3 shadow-sm">Ace Interviews</div>
                                <div className="pills me-3 p-4 mb-3 shadow-sm">Excel in Self-Studies</div>
                                <div className="pills me-3 p-4 mb-3 shadow-sm">Custom Inputs</div>
                                <div className="pills me-3 p-4 mb-3 shadow-sm">Easy to Use</div>
                            </div>
                            <div className="left-inner3 d-flex justify-content-between mt-3">
                                <div className="card"
                                    onMouseEnter={() => playerRef1.current.play()}
                                    onMouseLeave={() => playerRef1.current.stop()}
                                >
                                    <Player
                                        ref={playerRef1}
                                        loop
                                        src="https://lottie.host/9abae43a-9dad-47e5-9200-6d0ee592b024/MQr83dBTj2.json"
                                        style={{ height: '330px', width: '190px' }}
                                    />
                                </div>
                                <div className="card"
                                    onMouseEnter={() => playerRef2.current.play()}
                                    onMouseLeave={() => playerRef2.current.stop()}
                                >
                                    <Player
                                        ref={playerRef2}
                                        loop
                                        src="https://lottie.host/65be97ab-9a91-4174-9716-d401617ce363/lWDcNY15Pb.json"
                                        style={{ height: '280px', width: '280px' }}
                                    />
                                </div>
                                <div className="card"
                                    onMouseEnter={() => playerRef3.current.play()}
                                    onMouseLeave={() => playerRef3.current.stop()}
                                >
                                    <Player
                                        ref={playerRef3}
                                        loop
                                        src="https://lottie.host/184269e8-5c1f-43a0-b0d5-9d79e0ecd3f3/pK4feb4oNp.json"
                                        style={{ height: '150px', width: '150px' }}

                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right features */}
                    <div className="col-lg-4 col-md-12 d-md-flex d-lg-block feature-right mt-md-2 mt-lg-0 px-sm-0 pe-md-3 ps-lg-3">
                        {/* Responsive feature */}
                        <div className="feature-right-inside d-flex align-items-center mt-sm-3 right-top col-md-6 col-lg-12 me-md-3 mt-lg-0">
                            <div className="my-3">
                                <div className="text-right ms-3">
                                    <h2 className="feature-title">AI Learning Companion</h2>
                                </div>
                                <Player
                                    autoplay
                                    loop
                                    src="https://lottie.host/e6685982-c5f0-43f1-a9e5-e1e9aa4d1b00/VE4linTI4a.json"
                                    style={{ height: '180px', width: '180px' }}
                                />
                            </div>
                        </div>

                        {/* GPT-powered feature */}
                        <div className="feature-right-inside d-flex align-items-center mt-sm-3 mt-lg-3 right-bottom col-md-6 col-lg-12">
                            <div className='my-3 text-right ms-3 me-4'>
                                <h1 className="feature-title">Responsive across all devices</h1>
                                <Player
                                    autoplay
                                    loop
                                    src="https://lottie.host/381c6adf-b441-4ad9-9d4a-f5d31efc06c1/CB6eUkO1zl.json"
                                    style={{ height: '150px', width: '150px' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </>
    );
}

export default Features;
