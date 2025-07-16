import React, { useState, useEffect, useRef } from 'react';
import '../../style/Quick.css';
import '../../style/bubble.css';

const QuickSort = ({ array }) => {
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSorting, setIsSorting] = useState(false);
  const [highlightedLine, setHighlightedLine] = useState(null);
  const [sortedIndex, setSortedIndex] = useState([]);
  const [sortingComplete, setSortingComplete] = useState(false);
  const [showAlgorithm, setShowAlgorithm] = useState(false);
  const [message, setMessage] = useState('');
  const [currentArray, setCurrentArray] = useState([...array]); // Track the current state of the array for display
  const [isPaused, setIsPaused] = useState(false); // New state to track if sorting is paused
  const [speed, setSpeed] = useState(1000); // Add state for sorting speed

  const stepsContainerRef = useRef(null);

  const algorithmLines = [
    "function quickSort(arr, low, high) {",
    "  if (low < high) {",
    "    let pi = partition(arr, low, high);",
    "    quickSort(arr, low, pi - 1);",
    "    quickSort(arr, pi + 1, high);",
    "  }",
    "}",
    "function partition(arr, low, high) {",
    "  let pivot = arr[high];",
    "  let i = (low - 1);",
    "  for (let j = low; j < high; j++) {",
    "    if (arr[j] <= pivot) {",
    "      i++;",
    "      swap arr[i] and arr[j];",
    "    }",
    "  }",
    "  swap arr[i + 1] and arr[high];",
    "  return i + 1;",
    "}",
  ];

  const sortingSpeed = speed; // Now the sorting speed is controlled by the speed state
  const highlightingSpeed = 300; // Speed for code highlighting

  const handleSort = () => {
    if (currentArray.length === 0) return;

    const steps = [];
    const arrayCopy = [...currentArray]; // Create a copy of the array for sorting

    // QuickSort function
    const quickSort = (arr, low, high) => {
      if (low < high) {
        steps.push({ text: `Calling partition on subarray [${low}, ${high}]`, highlight: 0 });
        const pi = partition(arr, low, high);
        steps.push({ text: `Pivot placed at position ${pi}`, highlight: 2, pivot: pi });

        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
      }
    };

    // Partition function
    const partition = (arr, low, high) => {
      const pivot = arr[high];
      let i = low - 1;

      steps.push({ text: `Choosing pivot: ${pivot}`, highlight: 8, pivot: high });

      for (let j = low; j < high; j++) {
        steps.push({ text: `Comparing ${arr[j]} with pivot ${pivot}`, comparing: [j, high], highlight: 11 });
        if (arr[j] <= pivot) {
          i++;
          if (i !== j) {
            steps.push({ text: `Swapping ${arr[i]} and ${arr[j]}`, swap: [i, j], highlight: 13 });
            // Swap using destructuring
            [arr[i], arr[j]] = [arr[j], arr[i]];
          }
        }
      }

      steps.push({ text: `Swapping ${arr[i + 1]} and ${arr[high]}`, swap: [i + 1, high], highlight: 16 });
      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];

      return i + 1;
    };

    // Run QuickSort
    quickSort(arrayCopy, 0, arrayCopy.length - 1);

    steps.push({ text: "Sorting Completed!", highlight: null });
    setSteps(steps);
    setIsSorting(true);
    setShowAlgorithm(true);
  };

  // Function to clear the sorting state
  const handleClear = () => {
    setSteps([]);
    setCurrentStep(0);
    setIsSorting(false);
    setHighlightedLine(null);
    setSortedIndex([]);
    setSortingComplete(false);
    setMessage('');
    setCurrentArray([...array]); // Reset array to its initial state
    setIsPaused(false); // Reset pause state
  };

  // Function to toggle the pause/resume state
  const handlePauseResume = () => {
    setIsPaused((prev) => !prev);
  };

  // useEffect to manage the progression of steps and array updates
  useEffect(() => {
    if (isSorting && currentStep < steps.length && !isPaused) {
      const step = steps[currentStep];

      if (step.swap) {
        const [index1, index2] = step.swap;
        setMessage(`Swapping ${currentArray[index1]} and ${currentArray[index2]}`);

        // Get the DOM elements of the boxes being swapped
        const box1 = document.getElementById(`box-${index1}`);
        const box2 = document.getElementById(`box-${index2}`);

        if (box1 && box2) {
          // Calculate the horizontal distance between the two boxes
          const rect1 = box1.getBoundingClientRect();
          const rect2 = box2.getBoundingClientRect();
          const distance1 = rect2.left - rect1.left; // distance from box1 to box2
          const distance2 = rect1.left - rect2.left; // distance from box2 to box1

          // Apply the distance as a CSS variable for the animation
          box1.style.setProperty('--swap-distance', `${distance1}px`);
          box2.style.setProperty('--swap-distance', `${distance2}px`);

          // Add the swap animation classes
          box1.classList.add('swap-to-right');
          box2.classList.add('swap-to-left');

          // Use a timeout for the swapping animation sequence
          setTimeout(() => {
            // First, perform the actual swap in the array
            const newArray = [...currentArray];
            const temp = newArray[index1];
            newArray[index1] = newArray[index2];
            newArray[index2] = temp;

            setCurrentArray(newArray); // Update the array for display (this will trigger re-rendering)

            // Remove the animation classes after the swap is complete
            box1.classList.remove('swap-to-right');
            box2.classList.remove('swap-to-left');

          }, sortingSpeed); // Timeout matches the CSS transition time
        }
      } else if (step.selfCompare) {
        setMessage(`Self-comparison: ${currentArray[step.selfCompare[0]]} is compared with itself`);
      } else if (step.comparing) {
        setMessage(`Comparing ${currentArray[step.comparing[0]]} and pivot ${currentArray[step.comparing[1]]}`);
      } else if (step.pivot !== undefined) {
        setMessage(`Pivot selected: ${currentArray[step.pivot]}`);
      } else if (step.text === "Sorting Completed!") {
        setSortingComplete(true);
        setMessage("Sorting Completed!");
        // Mark all indices as sorted at the end
        setSortedIndex(Array.from({ length: currentArray.length }, (_, i) => i));
      }

      setTimeout(() => {
        setCurrentStep((prevStep) => prevStep + 1);
      }, sortingSpeed);
    }
  }, [isSorting, currentStep, steps, currentArray, isPaused, speed]);

  useEffect(() => {
    if (stepsContainerRef.current) {
      stepsContainerRef.current.scrollTop = stepsContainerRef.current.scrollHeight;
    }
  }, [currentStep]);

  useEffect(() => {
    if (isSorting && currentStep < steps.length) {
      const step = steps[currentStep];
      setTimeout(() => {
        setHighlightedLine(step.highlight);
      }, highlightingSpeed);
    }
  }, [currentStep, steps, isSorting]);

  return (
    <div>
      <h1>QuickSort Visualizer</h1>
      <div className='mt-2'>
        <button className='startbtn' onClick={handleSort}>Start Sorting</button>
        <button className='restartbtn' onClick={handleClear}>Reset</button>
        <button
          className={`pausebtn ${isSorting && steps.length > 0 ? '' : 'disabled'}`}
          onClick={handlePauseResume}
          disabled={!isSorting || steps.length === 0}
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>
      </div>

      {/* Speed Slider */}
      <div className="speed-slider" style={{ marginTop: '10px' }}>
        <label>Speed (ms): </label>
       <input
  type="range"
  min="100"
  max="3000"
  step="100"
  value={speed}
  onChange={(e) => setSpeed(Number(e.target.value))}
  style={{
    width: '220px',
    height: '8px',
    background: '#e0e0e0',
    borderRadius: '5px',
    outline: 'none',
    margin: '0 10px',
    accentColor: '#7b73eb', // Modern browsers
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  }}
/>
        <span>{speed} ms</span>
      </div>

      <div className="visualization-algorithm-container" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
        <div className="array-visualization" style={{ flex: '1', paddingRight: '20px', display: 'flex', flexDirection: 'column' }}>
          <div className="array-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            {currentArray.map((value, index) => (
              <div
                key={index}
                id={`box-${index}`}
                className={`array-box ${steps[currentStep]?.comparing?.includes(index) && !steps[currentStep]?.swap ? 'comparing' : ''
                  } ${steps[currentStep]?.swap && steps[currentStep].swap.includes(index)
                    ? index === steps[currentStep].swap[0]
                      ? 'swap-number-right'
                      : 'swap-number-left'
                    : ''
                  } ${steps[currentStep]?.selfCompare?.includes(index) ? 'self-compare' : ''
                  } ${sortedIndex.includes(index) ? 'sorted' : ''
                  } ${steps[currentStep]?.pivot === index ? 'pivot' : ''
                  }`}
              >
                <span>{value}</span>
              </div>
            ))}
          </div>

          {/* Display message below the array */}
          <div className="message" style={{ marginTop: '20px', fontWeight: 'bold' }}>
            {message}
          </div>

          {/* Steps Container */}
          <div className='mt-4 stepsss'
            ref={stepsContainerRef}
            style={{
              maxHeight: '200px',
              overflowY: 'scroll',
              border: '1px solid #ccc',
              padding: '10px',
              display: isSorting ? 'block' : 'none',
              marginTop: '20px'
            }}
          >
            <h4 className='fw-bold'>Steps:</h4>
            <ul style={{ paddingLeft: '20px', textAlign: 'left' }}>
              {steps.slice(0, currentStep + 1).map((step, index) => (
                <li key={index}>
                  <p>{step.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Container: Algorithm Code */}
        {showAlgorithm && (
          <div className="algorithm-code" style={{ flex: '1', textAlign: 'left', paddingLeft: '20px', backgroundColor: '#ffffff' }}>
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
  );
};

export default QuickSort;
