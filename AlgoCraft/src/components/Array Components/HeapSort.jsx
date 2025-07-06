import React, { useState, useEffect, useRef } from 'react';
import '../../style/Quick.css';
import '../../style/bubble.css';

const HeapSort = ({ array }) => {
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSorting, setIsSorting] = useState(false);
  const [highlightedLine, setHighlightedLine] = useState(null);
  const [sortedIndex, setSortedIndex] = useState([]);
  const [sortingComplete, setSortingComplete] = useState(false);
  const [showAlgorithm, setShowAlgorithm] = useState(false);
  const [message, setMessage] = useState('');
  const [currentArray, setCurrentArray] = useState([...array]);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1000);

  const stepsContainerRef = useRef(null);

  const algorithmLines = [
    "function heapSort(arr) {",
    "  let n = arr.length;",
    "  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {",
    "    heapify(arr, n, i);",
    "  }",
    "  for (let i = n - 1; i > 0; i--) {",
    "    swap arr[0] and arr[i];",
    "    heapify(arr, i, 0);",
    "  }",
    "}",
    "function heapify(arr, n, i) {",
    "  let largest = i;",
    "  let l = 2 * i + 1;",
    "  let r = 2 * i + 2;",
    "  if (l < n && arr[l] > arr[largest]) largest = l;",
    "  if (r < n && arr[r] > arr[largest]) largest = r;",
    "  if (largest !== i) {",
    "    swap arr[i] and arr[largest];",
    "    heapify(arr, n, largest);",
    "  }",
    "}",
  ];

  const sortingSpeed = speed;
  const highlightingSpeed = 300;

  const handleSort = () => {
    if (currentArray.length === 0) return;
    const steps = [];
    const arrayCopy = [...currentArray];

    // Heapify subtree rooted at index i
    const heapify = (arr, n, i) => {
      let largest = i;
      let l = 2 * i + 1;
      let r = 2 * i + 2;
      steps.push({ text: `Heapifying at index ${i}`, highlight: 10, heapify: i });
      if (l < n) steps.push({ text: `Compare left child ${arr[l]} with root ${arr[largest]}`, comparing: [l, largest], highlight: 13 });
      if (l < n && arr[l] > arr[largest]) largest = l;
      if (r < n) steps.push({ text: `Compare right child ${arr[r]} with root ${arr[largest]}`, comparing: [r, largest], highlight: 14 });
      if (r < n && arr[r] > arr[largest]) largest = r;
      if (largest !== i) {
        steps.push({ text: `Swapping ${arr[i]} and ${arr[largest]}`, swap: [i, largest], highlight: 17 });
        [arr[i], arr[largest]] = [arr[largest], arr[i]];
        heapify(arr, n, largest);
      }
    };

    // Heap Sort main
    const heapSort = (arr) => {
      let n = arr.length;
      for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        steps.push({ text: `Build max heap: heapify at index ${i}`, highlight: 2 });
        heapify(arr, n, i);
      }
      for (let i = n - 1; i > 0; i--) {
        steps.push({ text: `Swapping root ${arr[0]} with end element ${arr[i]}`, swap: [0, i], highlight: 6 });
        [arr[0], arr[i]] = [arr[i], arr[0]];
        setSortedIndex((prev) => [...prev, i]);
        heapify(arr, i, 0);
      }
    };

    heapSort(arrayCopy);
    steps.push({ text: "Sorting Completed!", highlight: null });
    setSteps(steps);
    setIsSorting(true);
    setShowAlgorithm(true);
  };

  const handleClear = () => {
    setSteps([]);
    setCurrentStep(0);
    setIsSorting(false);
    setHighlightedLine(null);
    setSortedIndex([]);
    setSortingComplete(false);
    setMessage('');
    setCurrentArray([...array]);
    setIsPaused(false);
  };

  const handlePauseResume = () => {
    setIsPaused((prev) => !prev);
  };

  useEffect(() => {
    if (isSorting && currentStep < steps.length && !isPaused) {
      const step = steps[currentStep];
      if (step.swap) {
        const [index1, index2] = step.swap;
        setMessage(`Swapping ${currentArray[index1]} and ${currentArray[index2]}`);
        const box1 = document.getElementById(`box-${index1}`);
        const box2 = document.getElementById(`box-${index2}`);
        if (box1 && box2) {
          const rect1 = box1.getBoundingClientRect();
          const rect2 = box2.getBoundingClientRect();
          const distance1 = rect2.left - rect1.left;
          const distance2 = rect1.left - rect2.left;
          box1.style.setProperty('--swap-distance', `${distance1}px`);
          box2.style.setProperty('--swap-distance', `${distance2}px`);
          box1.classList.add('swap-to-right');
          box2.classList.add('swap-to-left');
          setTimeout(() => {
            const newArray = [...currentArray];
            const temp = newArray[index1];
            newArray[index1] = newArray[index2];
            newArray[index2] = temp;
            setCurrentArray(newArray);
            box1.classList.remove('swap-to-right');
            box2.classList.remove('swap-to-left');
          }, sortingSpeed);
        }
      } else if (step.comparing) {
        setMessage(`Comparing ${currentArray[step.comparing[0]]} and ${currentArray[step.comparing[1]]}`);
      } else if (step.heapify !== undefined) {
        setMessage(`Heapifying at index ${step.heapify}`);
      } else if (step.text === "Sorting Completed!") {
        setSortingComplete(true);
        setMessage("Sorting Completed!");
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
      <h1>HeapSort Visualizer</h1>
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
                  } ${sortedIndex.includes(index) ? 'sorted' : ''
                  } ${steps[currentStep]?.heapify === index ? 'pivot' : ''
                  }`}
              >
                <span>{value}</span>
              </div>
            ))}
          </div>
          <div className="message" style={{ marginTop: '20px', fontWeight: 'bold' }}>
            {message}
          </div>
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

export default HeapSort;
