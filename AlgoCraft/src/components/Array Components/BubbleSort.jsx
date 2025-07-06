import React, { useState, useEffect, useRef } from 'react';
import '../../style/bubble.css';

const BubbleSort = ({ array }) => {
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSorting, setIsSorting] = useState(false);
  const [highlightedLine, setHighlightedLine] = useState(null);
  const [sortedIndex, setSortedIndex] = useState([]);
  const [sortingComplete, setSortingComplete] = useState(false);
  const [showAlgorithm, setShowAlgorithm] = useState(false);
  const [currentArray, setCurrentArray] = useState([...array]);
  const [isPaused, setIsPaused] = useState(false);
  const stepsContainerRef = useRef(null);
  const [isLandscape, setIsLandscape] = useState(null);

  // Initializing sorting speed (in ms)
  const [sortingSpeed, setSortingSpeed] = useState(1000); // Default speed 1000ms
  const [highlightingSpeed] = useState(200); // Fixed highlighting speed

  const algorithmLines = [
    "for (let i = 0; i < arr.length - 1; i++) {",
    "  for (let j = 0; j < arr.length - i - 1; j++) {",
    "    if (arr[j] > arr[j + 1]) {",
    "      // Swap the elements",
    "      let temp = arr[j];",
    "      arr[j] = arr[j + 1];",
    "      arr[j + 1] = temp;",
    "    }",
    "  }",
    "  // Element at arr.length - i - 1 is sorted",
    "}",
  ];

  const handleSort = () => {
    if (currentArray.length === 0) return;

    const newSteps = [];
    const arrayCopy = [...currentArray];

    for (let i = 0; i < arrayCopy.length - 1; i++) {
      for (let j = 0; j < arrayCopy.length - i - 1; j++) {
        newSteps.push({
          text: `Comparing ${arrayCopy[j]} and ${arrayCopy[j + 1]}`,
          comparing: [j, j + 1],
          highlight: 2,
        });

        if (arrayCopy[j] > arrayCopy[j + 1]) {
          newSteps.push({
            text: `Swapping ${arrayCopy[j]} and ${arrayCopy[j + 1]}`,
            swap: [j, j + 1],
            highlight: 3,
          });

          const temp = arrayCopy[j];
          arrayCopy[j] = arrayCopy[j + 1];
          arrayCopy[j + 1] = temp;
        }
      }

      newSteps.push({
        text: `Element ${arrayCopy[arrayCopy.length - i - 1]} is now sorted.`,
        sorted: arrayCopy.length - i - 1,
        highlight: 9,
      });
    }

    newSteps.push({ text: "Sorting Completed!", highlight: null });

    setSteps(newSteps);
    setIsSorting(true);
    setShowAlgorithm(true);
    setIsPaused(false);
  };

  const handlePauseResume = () => {
    if (!steps.length) return;
    setIsPaused(prev => !prev);
  };

  const handleClear = () => {
    setSteps([]);
    setCurrentStep(0);
    setIsSorting(false);
    setHighlightedLine(null);
    setSortedIndex([]);
    setSortingComplete(false);
    setShowAlgorithm(false);
    setIsPaused(false);
    setCurrentArray([...array]);
  };

  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    return () => window.removeEventListener("resize", checkOrientation);
  }, []);

  useEffect(() => {
    if (isSorting && !isPaused && currentStep < steps.length) {
      const step = steps[currentStep];
      const timer = setTimeout(() => {
        if (step.swap) {
          const [i, j] = step.swap;
          setCurrentArray(prev => {
            const newArr = [...prev];
            [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
            return newArr;
          });
        } else if (step.sorted !== undefined) {
          setSortedIndex(prev => [...prev, step.sorted]);
        } else if (step.text === "Sorting Completed!") {
          setSortingComplete(true);
        }

        if (step.text !== "Sorting Completed!") {
          setCurrentStep(prev => prev + 1);
        }
      }, sortingSpeed);

      return () => clearTimeout(timer);
    }
  }, [isSorting, isPaused, currentStep, steps, sortingSpeed]);

  useEffect(() => {
    if (stepsContainerRef.current) {
      stepsContainerRef.current.scrollTop = stepsContainerRef.current.scrollHeight;
    }
  }, [currentStep]);

  useEffect(() => {
    if (isSorting && !isPaused && currentStep < steps.length) {
      const step = steps[currentStep];
      const highlightTimer = setTimeout(() => {
        setHighlightedLine(step.highlight);
      }, highlightingSpeed);
      return () => clearTimeout(highlightTimer);
    }
  }, [currentStep, steps, isSorting, isPaused]);

  return (
    <div>
      <h1>Bubble Sort Visualizer</h1>

      {isLandscape === false && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          textAlign: 'center',
          padding: '10px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: '1000',
        }}>
          <p>Please rotate your screen to landscape mode for a better experience.</p>
        </div>
      )}

      {isLandscape === true && (
        <div>
          <div className='mt-2'>
            <button className='startbtn' onClick={handleSort}>Start Sorting</button>
            <button className='restartbtn' onClick={handleClear}>Reset</button>
            <button
              className={`pausebtn ${steps.length === 0 ? 'disabled' : ''}`}
              onClick={handlePauseResume}
              disabled={steps.length === 0}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>
          </div>

          {/* Speed Slider */}
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <label htmlFor="speed-slider" style={{ fontWeight: 'bold' }}>Speed (ms): </label>
           <input
  type="range"
  id="speed-slider"
  min="200"
  max="3000"
  value={sortingSpeed}
  onChange={(e) => setSortingSpeed(Number(e.target.value))}
  step="100"
  style={{
    width: '220px',
    height: '8px',
    background: '#e0e0e0',
    borderRadius: '5px',
    outline: 'none',
    margin: '0 10px',
    accentColor: '#7b73eb', // For modern browsers
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  }}
/>
            <span>{sortingSpeed} ms</span>
          </div>

          <div className="visualization-algorithm-container" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="array-visualization" style={{ flex: '1', paddingRight: '20px' }}>
              <div className="array-container">
                {currentArray.map((value, index) => (
                  <div
                    key={index}
                    className={`array-box
                      ${steps[currentStep]?.comparing?.includes(index) && !steps[currentStep]?.swap ? 'comparing' : ''} 
                      ${steps[currentStep]?.swap?.includes(index)
                        ? index === steps[currentStep].swap[0] ? 'swap-number-right' : 'swap-number-left'
                        : ''} 
                      ${sortedIndex.includes(index) ? 'sorted' : ''}
                    `}
                  >
                    <span>{value}</span>
                  </div>
                ))}
              </div>

              <div>
                {steps[currentStep]?.comparing && !steps[currentStep]?.swap && (
                  <div className="message">
                    {`Comparing ${currentArray[steps[currentStep].comparing[0]]} and ${currentArray[steps[currentStep].comparing[1]]}`}
                  </div>
                )}
                {steps[currentStep]?.swap && (
                  <div className="message">
                    {`Swapping ${currentArray[steps[currentStep].swap[0]]} with ${currentArray[steps[currentStep].swap[1]]}`}
                  </div>
                )}
                {steps[currentStep]?.sorted !== undefined && (
                  <div className="message">
                    {`Element ${currentArray[steps[currentStep].sorted]} is now sorted.`}
                  </div>
                )}
                {steps[currentStep]?.text === "Sorting Completed!" && (
                  <div className="message">{steps[currentStep].text}</div>
                )}
              </div>

              <div
                className='mt-4'
                ref={stepsContainerRef}
                style={{
                  maxHeight: '200px',
                  overflowY: 'scroll',
                  border: '1px solid #ccc',
                  padding: '10px',
                  display: isSorting ? 'block' : 'none',
                }}
              >
                <h4 className='fw-bold'>Steps:</h4>
                <ul style={{ paddingLeft: '20px', textAlign: 'left' }}>
                  {steps.slice(0, currentStep + 1).map((step, idx) => (
                    <li key={idx}>
                      <p>{step.text}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {showAlgorithm && (
              <div className="algorithm-code mt-2" style={{ flex: '1', textAlign: 'left', paddingLeft: '20px', background: '#fff' }}>
                <h3 className='fw-bold'>Algorithm:</h3>
                {algorithmLines.map((line, index) => (
                  <div
                    key={index}
                    className={highlightedLine === index ? 'highlight' : ''}
                    style={{ position: 'relative' }}
                  >
                    {highlightedLine === index && <span className="pointer">→</span>}
                    {line}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BubbleSort;
