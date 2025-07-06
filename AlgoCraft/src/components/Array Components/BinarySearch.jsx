import React, { useState, useEffect, useRef } from 'react';
import '../../style/bubble.css';

const BinarySearch = ({ array, valueToSearch, onComplete }) => {
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSorting, setIsSorting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [complexity, setComplexity] = useState('');
  const [highlightedLine, setHighlightedLine] = useState(null);
  const [sortedIndex, setSortedIndex] = useState([]);
  const [sortingComplete, setSortingComplete] = useState(false);
  const [showAlgorithm, setShowAlgorithm] = useState(false);
  const [currentArray, setCurrentArray] = useState([...array]);
  const [low, setLow] = useState(0);
  const [high, setHigh] = useState(array.length - 1);
  const [mid, setMid] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(null);
  const [foundIndex, setFoundIndex] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchMessage, setSearchMessage] = useState('');
  const stepsContainerRef = useRef(null);
  const [isSortingMessageVisible, setIsSortingMessageVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(500); // Add speed state

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
    "while (low <= high) {",
    "  mid = Math.floor((low + high) / 2);",
    "  if (array[mid] === target) {",
    "    return mid;",
    "  } else if (array[mid] < target) {",
    "    low = mid + 1;",
    "  } else {",
    "    high = mid - 1;",
    "  }",
    "}",
    "return -1;",
  ];

  const handleSort = () => {
    if (currentArray.length === 0) return;
    setIsSortingMessageVisible(true);
    const newSteps = [];
    const arrayCopy = [...currentArray];

    for (let i = 0; i < arrayCopy.length - 1; i++) {
      for (let j = 0; j < arrayCopy.length - i - 1; j++) {
        newSteps.push({
          text: `Comparing ${arrayCopy[j]} and ${arrayCopy[j + 1]}`,
          comparing: [j, j + 1],
          highlight: 1,
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
  };

  const handleClear = () => {
    setSteps([]);
    setCurrentStep(0);
    setIsSorting(false);
    setComplexity('');
    setHighlightedLine(null);
    setSortedIndex([]);
    setSortingComplete(false);
    setShowAlgorithm(false);
    setCurrentArray([...array]);
    setLow(0);
    setHigh(array.length - 1);
    setMid(null);
    setFoundIndex(null);
    setHighlightedIndex(null);
    setErrorMessage('');
    setSearchMessage('');
    setIsPaused(false);
  };

  const startSearch = () => {
    setLow(0);
    setHigh(currentArray.length - 1);
    setFoundIndex(null);
    setHighlightedIndex(null);
    setIsSearching(true);
    setShowAlgorithm(true);
    setHighlightedLine(0);
    setErrorMessage('');
  };

  useEffect(() => {
    if (isSorting && currentStep < steps.length && !isPaused) {
      const step = steps[currentStep];
      const timer = setTimeout(() => {
        if (step.swap) {
          const [index1, index2] = step.swap;

          setCurrentArray((prevArray) => {
            const newArray = [...prevArray];
            const temp = newArray[index1];
            newArray[index1] = newArray[index2];
            newArray[index2] = temp;
            return newArray;
          });
        } else if (step.sorted !== undefined) {
          setSortedIndex(prev => [...prev, step.sorted]);
        } else if (step.text === "Sorting Completed!") {
          setSortingComplete(true);
          setIsSortingMessageVisible(false);
          startSearch();
        }

        setCurrentStep(prevStep => prevStep + 1);
      }, speed); // Use the speed state here

      return () => clearTimeout(timer);
    }
  }, [isSorting, currentStep, steps, isPaused, speed]);

  useEffect(() => {
    if (isSorting && currentStep < steps.length && !isPaused) {
      const step = steps[currentStep];
      const timer = setTimeout(() => {
        setHighlightedLine(step.highlight);
      }, 200); // Adjust highlighting speed based on user input
      return () => clearTimeout(timer);
    }
  }, [currentStep, steps, isSorting, isPaused]);

  useEffect(() => {
    if (isSearching && low <= high && !isPaused) {
      const timer = setTimeout(() => {
        const midIndex = Math.floor((low + high) / 2);
        setMid(midIndex);
        setHighlightedIndex(midIndex);
        setHighlightedLine(8);
        setSearchMessage(`Current mid index: ${midIndex}, value: ${currentArray[midIndex]}`);

        if (parseInt(currentArray[midIndex], 10) === parseInt(valueToSearch, 10)) {
          setFoundIndex(midIndex);
          setHighlightedLine(10);
          setIsSearching(false);
          setSearchMessage(`Value found at index ${midIndex}!`);
          setTimeout(() => onComplete(midIndex), 5000);
        } else if (parseInt(currentArray[midIndex], 10) < parseInt(valueToSearch, 10)) {
          setLow(midIndex + 1);
          setHighlightedLine(12);
          setSearchMessage(`Searching right, moving low to ${midIndex + 1}.`);
        } else {
          setHigh(midIndex - 1);
          setHighlightedLine(14);
          setSearchMessage(`Searching left, moving high to ${midIndex - 1}.`);
        }
      }, speed); // Use the speed state here

      return () => clearTimeout(timer);
    } else if (low > high && !isPaused) {
      setIsSearching(false);
      setHighlightedIndex(null);
      setErrorMessage(`Value ${valueToSearch} not found in the array.`);
      setHighlightedLine(16);
      setSearchMessage('');
    }
  }, [isSearching, low, high, currentArray, valueToSearch, onComplete, isPaused, speed]);

  return (
    <div>
      <h1>Sorting and Binary Search Visualization</h1>
      <div className="mt-2">
        <button className="startbtn" onClick={handleSort}>Start Sorting & Searching</button>
        <button className="restartbtn" onClick={handleClear}>Reset</button>
        <button
          className="pausebtn"
          onClick={() => setIsPaused(prev => !prev)}
          disabled={!isSorting} // Disable button when sorting hasn't started
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>
      </div>

      {/* Speed control slider */}
     <div className="speed-control">
  <label htmlFor="speed-slider">Speed: {speed} ms</label>
  <input
    id="speed-slider"
    type="range"
    min="100"
    max="2000"
    step="100"
    value={speed}
    onChange={(e) => setSpeed(parseInt(e.target.value, 10))}
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
</div>

      <div className="visualization-algorithm-container" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div className="array-visualization" style={{ flex: '1', paddingRight: '20px' }}>
          <div className="array-container">
            {currentArray.map((value, index) => (
              <div
                key={index}
                className={`array-box ${steps[currentStep]?.comparing?.includes(index) && !steps[currentStep]?.swap ? 'comparing' : ''
                  } ${steps[currentStep]?.swap && steps[currentStep].swap.includes(index)
                    ? index === steps[currentStep].swap[0]
                      ? 'swap-number-right'
                      : 'swap-number-left'
                    : ''
                  } ${sortedIndex.includes(index) ? 'sorted' : ''
                  } ${highlightedIndex === index ? 'highlight' : ''} ${foundIndex === index ? 'found' : ''
                  }`}
              >
                <span>{value}</span>
              </div>
            ))}
          </div>
          {errorMessage && <div style={{ color: 'red', marginTop: '20px' }}>{errorMessage}</div>}
          {isSortingMessageVisible && <div className="sorting-message message">Sorting...</div>}
          {searchMessage && <div className="search-message message" style={{ marginTop: '20px' }}>{searchMessage}</div>}
        </div>

        {showAlgorithm && (
          <div className="algorithm-code" style={{ flex: '1', textAlign: 'left', paddingLeft: '20px', backgroundColor: '#ffffff' }}>
            <h3 className="fw-bold">Algorithm:</h3>
            {algorithmLines.map((line, index) => (
              <div
                key={index}
                className={highlightedLine === index ? 'highlight' : ''}
                style={{ position: 'relative' }}
              >
                {highlightedLine === index && (
                  <div
                    className="arrow-right"
                    style={{
                      position: 'absolute',
                      left: '-20px',
                      top: '5px',
                      width: '0',
                      height: '0',
                      borderTop: '5px solid transparent',
                      borderBottom: '5px solid transparent',
                      borderLeft: '10px solid black',
                    }}
                  />
                )}
                {line}
              </div>
            ))}
          </div>
        )}
      </div>

      {errorMessage && <div style={{ color: 'red', marginTop: '20px' }}>{errorMessage}</div>}
    </div>
  );
};

export default BinarySearch;



// import React, { useState, useEffect, useRef } from 'react';
// import '../style/bubble.css';

// const BinarySearch = ({ array, valueToSearch, onComplete }) => {
//   const [steps, setSteps] = useState([]);
//   const [currentStep, setCurrentStep] = useState(0);
//   const [isSorting, setIsSorting] = useState(false);
//   const [isSearching, setIsSearching] = useState(false);
//   const [complexity, setComplexity] = useState('');
//   const [highlightedLine, setHighlightedLine] = useState(null);
//   const [sortedIndex, setSortedIndex] = useState([]);
//   const [sortingComplete, setSortingComplete] = useState(false);
//   const [showAlgorithm, setShowAlgorithm] = useState(false);
//   const [currentArray, setCurrentArray] = useState([...array]);
//   const [low, setLow] = useState(0);
//   const [high, setHigh] = useState(array.length - 1);
//   const [mid, setMid] = useState(null);
//   const [highlightedIndex, setHighlightedIndex] = useState(null);
//   const [foundIndex, setFoundIndex] = useState(null);
//   const [errorMessage, setErrorMessage] = useState('');
//   const [searchMessage, setSearchMessage] = useState(''); // New state for search messages
//   const stepsContainerRef = useRef(null);
//   const [isSortingMessageVisible, setIsSortingMessageVisible] = useState(false);


//   const algorithmLines = [
//     "for (let i = 0; i < arr.length - 1; i++) {",
//     "  for (let j = 0; j < arr.length - i - 1; j++) {",
//     "    if (arr[j] > arr[j + 1]) {",
//     "      // Swap the elements",
//     "      let temp = arr[j];",
//     "      arr[j] = arr[j + 1];",
//     "      arr[j + 1] = temp;",
//     "    }",
//     "  }",
//     "  // Element at arr.length - i - 1 is sorted",
//     "}",
//     "while (low <= high) {",
//     "  mid = Math.floor((low + high) / 2);",
//     "  if (array[mid] === target) {",
//     "    return mid;",
//     "  } else if (array[mid] < target) {",
//     "    low = mid + 1;",
//     "  } else {",
//     "    high = mid - 1;",
//     "  }",
//     "}",
//     "return -1;",
//   ];

//   const sortingSpeed = 500;
//   const highlightingSpeed = 200;

//   const handleSort = () => {
//     if (currentArray.length === 0) return;
//     setIsSortingMessageVisible(true);
//     const newSteps = [];
//     const arrayCopy = [...currentArray];

//     for (let i = 0; i < arrayCopy.length - 1; i++) {
//       for (let j = 0; j < arrayCopy.length - i - 1; j++) {
//         newSteps.push({
//           text: `Comparing ${arrayCopy[j]} and ${arrayCopy[j + 1]}`,
//           comparing: [j, j + 1],
//           highlight: 1,
//         });

//         if (arrayCopy[j] > arrayCopy[j + 1]) {
//           newSteps.push({
//             text: `Swapping ${arrayCopy[j]} and ${arrayCopy[j + 1]}`,
//             swap: [j, j + 1],
//             highlight: 3,
//           });

//           const temp = arrayCopy[j];
//           arrayCopy[j] = arrayCopy[j + 1];
//           arrayCopy[j + 1] = temp;
//         }
//       }

//       newSteps.push({
//         text: `Element ${arrayCopy[arrayCopy.length - i - 1]} is now sorted.`,
//         sorted: arrayCopy.length - i - 1,
//         highlight: 9,
//       });
//     }

//     newSteps.push({ text: "Sorting Completed!", highlight: null });

//     setSteps(newSteps);
//     setIsSorting(true);
//     setShowAlgorithm(true);
//   };

//   const handleClear = () => {
//     setSteps([]);
//     setCurrentStep(0);
//     setIsSorting(false);
//     setComplexity('');
//     setHighlightedLine(null);
//     setSortedIndex([]);
//     setSortingComplete(false);
//     setShowAlgorithm(false);
//     setCurrentArray([...array]);
//     setLow(0);
//     setHigh(array.length - 1);
//     setMid(null);
//     setFoundIndex(null);
//     setHighlightedIndex(null);
//     setErrorMessage('');
//     setSearchMessage(''); // Clear search message
//   };

//   const startSearch = () => {
//     setLow(0);
//     setHigh(currentArray.length - 1);
//     setFoundIndex(null);
//     setHighlightedIndex(null);
//     setIsSearching(true);
//     setShowAlgorithm(true);
//     setHighlightedLine(0);
//     setErrorMessage('');
//   };

//   useEffect(() => {
//     if (isSorting && currentStep < steps.length) {
//       const step = steps[currentStep];
//       setTimeout(() => {
//         if (step.swap) {
//           const [index1, index2] = step.swap;

//           setCurrentArray((prevArray) => {
//             const newArray = [...prevArray];
//             const temp = newArray[index1];
//             newArray[index1] = newArray[index2];
//             newArray[index2] = temp;
//             return newArray;
//           });
//         } else if (step.sorted !== undefined) {
//           setSortedIndex(prev => [...prev, step.sorted]);
//         } else if (step.text === "Sorting Completed!") {
//           setSortingComplete(true);
//           setIsSortingMessageVisible(false); // Hide sorting message after sorting is complete
//           startSearch(); // Start binary search once sorting is done
//         }

//         setCurrentStep(prevStep => prevStep + 1);
//       }, sortingSpeed);
//     }
//   }, [isSorting, currentStep, steps]);

//   useEffect(() => {
//     if (isSorting && currentStep < steps.length) {
//       const step = steps[currentStep];
//       setTimeout(() => {
//         setHighlightedLine(step.highlight);
//       }, highlightingSpeed);
//     }
//   }, [currentStep, steps, isSorting]);

//   useEffect(() => {
//     if (isSearching && low <= high) {
//       const timer = setTimeout(() => {
//         const midIndex = Math.floor((low + high) / 2);
//         setMid(midIndex);
//         setHighlightedIndex(midIndex);
//         setHighlightedLine(8);
//         setSearchMessage(`Current mid index: ${midIndex}, value: ${currentArray[midIndex]}`); // Message for current mid

//         if (parseInt(currentArray[midIndex], 10) === parseInt(valueToSearch, 10)) {
//           setFoundIndex(midIndex);
//           setHighlightedLine(10);
//           setIsSearching(false);
//           setSearchMessage(`Value found at index ${midIndex}!`); // Message for found value
//           setTimeout(() => onComplete(midIndex), 5000);
//         } else if (parseInt(currentArray[midIndex], 10) < parseInt(valueToSearch, 10)) {
//           setLow(midIndex + 1);
//           setHighlightedLine(12);
//           setSearchMessage(`Searching right, moving low to ${midIndex + 1}.`); // Message for right search direction
//         } else {
//           setHigh(midIndex - 1);
//           setHighlightedLine(14);
//           setSearchMessage(`Searching left, moving high to ${midIndex - 1}.`); // Message for left search direction
//         }
//       }, 2000);

//       return () => clearTimeout(timer);
//     } else if (low > high) {
//       setIsSearching(false);
//       setHighlightedIndex(null);
//       setErrorMessage(`Value ${valueToSearch} not found in the array.`);
//       setHighlightedLine(16);
//       setSearchMessage(''); // Clear search message if not found
//     }
//   }, [isSearching, low, high, currentArray, valueToSearch, onComplete]);
//   return (
//     <div>
//       <h1>Sorting and Binary Search Visualization</h1>

//       <div className='mt-2'>
//         <button className='startbtn' onClick={handleSort}> Start Sorting & Searching</button>
//         <button className='restartbtn' onClick={handleClear}> Restart </button>
//       </div>
//       <div className="visualization-algorithm-container" style={{ display: 'flex', justifyContent: 'space-between' }}>
//         <div className="array-visualization" style={{ flex: '1', paddingRight: '20px' }}>
//           <div className="array-container">
//             {currentArray.map((value, index) => (
//               <div
//                 key={index}
//                 className={`array-box ${steps[currentStep]?.comparing?.includes(index) && !steps[currentStep]?.swap ? 'comparing' : ''
//                   } ${steps[currentStep]?.swap && steps[currentStep].swap.includes(index)
//                     ? index === steps[currentStep].swap[0]
//                       ? 'swap-number-right'
//                       : 'swap-number-left'
//                     : ''
//                   } ${sortedIndex.includes(index) ? 'sorted' : ''
//                   } ${highlightedIndex === index ? 'highlight' : ''} ${foundIndex === index ? 'found' : ''
//                   }`}
//               >
//                 <span>{value}</span>

//               </div>

//             ))}

//           </div>
//           {errorMessage && <div style={{ color: 'red', marginTop: '20px' }}>{errorMessage}</div>}
//           {isSortingMessageVisible && <div className="sorting-message message">Sorting...</div>} {/* Display Sorting message */}
//           {searchMessage && <div className="search-message message" style={{ marginTop: '20px' }}>{searchMessage}</div>} {/* Display search messages */}
//         </div>

//         {showAlgorithm && (
//           <div className="algorithm-code" style={{ flex: '1', textAlign: 'left', paddingLeft: '20px', backgroundColor: '#ffffff' }}>
//             <h3 className='fw-bold'>Algorithm:</h3>
//             {algorithmLines.map((line, index) => (
//               <div
//                 key={index}
//                 className={highlightedLine === index ? 'highlight' : ''}
//                 style={{ position: 'relative' }}
//               >
//                 {highlightedLine === index && (
//                   <div
//                     className="arrow-right"
//                     style={{
//                       position: 'absolute',
//                       left: '-20px',
//                       top: '5px',
//                       width: '0',
//                       height: '0',
//                       borderTop: '5px solid transparent',
//                       borderBottom: '5px solid transparent',
//                       borderLeft: '10px solid black',
//                     }}
//                   />
//                 )}
//                 {line}
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {errorMessage && <div style={{ color: 'red', marginTop: '20px' }}>{errorMessage}</div>}
//     </div>
//   );
// };

// export default BinarySearch;
