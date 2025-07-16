import React, { useState, useEffect } from 'react';
import '../../style/LinearSearch.css'; // External CSS for styling

const Search = ({ array, valueToSearch, onComplete }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [highlightedIndex, setHighlightedIndex] = useState(null);
    const [foundIndex, setFoundIndex] = useState(null);
    const [highlightedLine, setHighlightedLine] = useState(null); // To highlight the algorithm step
    const [isSearching, setIsSearching] = useState(false);
    const [showAlgorithm, setShowAlgorithm] = useState(false); // To show the algorithm during the search
    const [errorMessage, setErrorMessage] = useState(''); // To show error message when not found
    const [isPaused, setIsPaused] = useState(false); // Track pause state
    const [speed, setSpeed] = useState(1000); // Speed of the search visualization in milliseconds

    // Linear Search algorithm steps to show on the right side of the screen
    const algorithmLines = [
        "for (let i = 0; i < arr.length; i++) {",
        "  if (arr[i] === target) {",
        "    // Target found",
        "    return i;",
        "  }",
        "} return -1; // Target not found",
    ];

    // Function to perform the search with a visual delay
    useEffect(() => {
        if (isSearching && currentIndex < array.length && foundIndex === null && !isPaused) {
            const timer = setTimeout(() => {
                setHighlightedIndex(currentIndex); // Highlight the current array element
                setHighlightedLine(1); // Highlight the "if" check line in the algorithm

                // Check if the current value matches the target value
                if (parseInt(array[currentIndex], 10) === parseInt(valueToSearch, 10)) {
                    setFoundIndex(currentIndex);
                    setHighlightedLine(3); // Highlight the "target found" line in the algorithm
                    setIsSearching(false); // Stop searching once the target is found
                } else {
                    setCurrentIndex((prev) => prev + 1); // Move to the next index if not found
                }
            }, speed); // Use the speed state for the delay

            return () => clearTimeout(timer);
        } else if (currentIndex >= array.length && foundIndex === null) {
            // When array is fully traversed and no value is found
            setIsSearching(false); // End the search
            setHighlightedIndex(null); // Remove the highlighted index
            setHighlightedLine(6); // Highlight the "not found" line in the algorithm
            setErrorMessage(`Value ${valueToSearch} not found in the array.`); // Set error message
        }
    }, [isSearching, currentIndex, array, valueToSearch, onComplete, foundIndex, isPaused, speed]);

    // Start the search process
    const startSearch = () => {
        setCurrentIndex(0);
        setFoundIndex(null);
        setHighlightedIndex(null);
        setIsSearching(true);
        setShowAlgorithm(true); // Display the algorithm
        setHighlightedLine(0); // Start at the beginning of the algorithm
        setErrorMessage(''); // Clear any previous error messages
    };

    // Pause or Resume the search
    const togglePauseResume = () => {
        setIsPaused((prev) => !prev);
    };

    // Handle speed change from the slider
    const handleSpeedChange = (event) => {
        setSpeed(parseInt(event.target.value, 10)); // Update the speed value
    };

    // Reset the search state
    const resetSearch = () => {
        setCurrentIndex(0);
        setFoundIndex(null);
        setHighlightedIndex(null);
        setHighlightedLine(null);
        setIsSearching(false);
        setErrorMessage('');
        setIsPaused(false);
        setShowAlgorithm(false);
    };

    return (
        <div>
            <h1 className='mb-3'>Linear Search Visualization</h1>

            <div className="mt-2">
                <button
                    className='startbtn'
                    onClick={startSearch}
                    disabled={isSearching || foundIndex !== null} // Disable the start button if already searching or found
                >
                    Start Search
                </button>
                <button
                    className='pausebtn'
                    onClick={togglePauseResume}
                    disabled={!isSearching} // Disable pause/resume when not searching
                >
                    {isPaused ? 'Resume' : 'Pause'}
                </button>
                <button
                    className='restartbtn'
                    onClick={resetSearch}
                    disabled={isSearching} // Disable the reset button if search is in progress
                >
                    Reset
                </button>
            </div>

            {/* Speed Slider (always visible) */}
            <div style={{ marginTop: '20px' }}>
                <label htmlFor="speed-slider">Speed: {speed}ms</label>
                <input
    id="speed-slider"
    type="range"
    min="200"
    max="2000"
    step="100"
    value={speed}
    onChange={handleSpeedChange}
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
                {/* Array Display */}
                <div className="array-visualization" style={{ flex: '1', paddingRight: '20px' }}>
                    <div className="array-container" style={{ display: 'flex', flexWrap: 'wrap' }}>
                        {array.map((value, index) => (
                            <div
                                key={index}
                                className={`array-box ${highlightedIndex === index ? 'highlight' : ''} ${foundIndex === index ? 'found' : ''}`}
                            >
                                <span>{value}</span>
                            </div>
                        ))}
                    </div>

                    {foundIndex !== null && (
                        <div className='message'>{`Found ${valueToSearch} at index ${foundIndex}`}</div>
                    )}

                    {errorMessage && (
                        <div style={{ color: 'red', marginTop: '10px' }}>{errorMessage}</div>
                    )}
                </div>

                {/* Algorithm Visualization */}
                {showAlgorithm && (
                    <div className="algorithm-code" style={{ flex: '1', textAlign: 'left', paddingLeft: '20px', backgroundColor: '#ffffff' }}>
                        <h3 className='fw-bold'>Algorithm:</h3>
                        {algorithmLines.map((line, index) => (
                            <div
                                key={index}
                                className={highlightedLine === index ? 'highlight' : ''}
                                style={{ position: 'relative' }}
                            >
                                {highlightedLine === index && (
                                    <span className="pointer">→</span> // Pointer to show the active line
                                )}
                                {line}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;

// import React, { useState, useEffect } from 'react';
// import '../style/LinearSearch.css'; // External CSS for styling

// const Search = ({ array, valueToSearch, onComplete }) => {
//     const [currentIndex, setCurrentIndex] = useState(0);
//     const [highlightedIndex, setHighlightedIndex] = useState(null);
//     const [foundIndex, setFoundIndex] = useState(null);
//     const [highlightedLine, setHighlightedLine] = useState(null); // To highlight the algorithm step
//     const [isSearching, setIsSearching] = useState(false);
//     const [showAlgorithm, setShowAlgorithm] = useState(false); // To show the algorithm during the search
//     const [errorMessage, setErrorMessage] = useState(''); // To show error message when not found
//     const [isPaused, setIsPaused] = useState(false); // Track pause state
//     const [speed, setSpeed] = useState(1000); // Speed of the search visualization in milliseconds

//     // Linear Search algorithm steps to show on the right side of the screen
//     const algorithmLines = [
//         "for (let i = 0; i < arr.length; i++) {",
//         "  if (arr[i] === target) {",
//         "    // Target found",
//         "    return i;",
//         "  }",
//         "} return -1; // Target not found",
//     ];

//     // Function to perform the search with a visual delay
//     useEffect(() => {
//         if (isSearching && currentIndex < array.length && foundIndex === null && !isPaused) {
//             const timer = setTimeout(() => {
//                 setHighlightedIndex(currentIndex); // Highlight the current array element
//                 setHighlightedLine(1); // Highlight the "if" check line in the algorithm

//                 // Check if the current value matches the target value
//                 if (parseInt(array[currentIndex], 10) === parseInt(valueToSearch, 10)) {
//                     setFoundIndex(currentIndex);
//                     setHighlightedLine(3); // Highlight the "target found" line in the algorithm
//                     setIsSearching(false); // Stop searching once the target is found

//                     // Notify the parent that the search is complete but DO NOT reset the state
//                     setTimeout(() => onComplete(currentIndex), 5000);
//                 } else {
//                     setCurrentIndex((prev) => prev + 1); // Move to the next index if not found
//                 }
//             }, speed); // Use the speed state for the delay

//             return () => clearTimeout(timer);
//         } else if (currentIndex >= array.length && foundIndex === null) {
//             // When array is fully traversed and no value is found
//             setIsSearching(false); // End the search
//             setHighlightedIndex(null); // Remove the highlighted index
//             setHighlightedLine(6); // Highlight the "not found" line in the algorithm
//             setErrorMessage(`Value ${valueToSearch} not found in the array.`); // Set error message
//         }
//     }, [isSearching, currentIndex, array, valueToSearch, onComplete, foundIndex, isPaused, speed]);

//     // Start the search process
//     const startSearch = () => {
//         setCurrentIndex(0);
//         setFoundIndex(null);
//         setHighlightedIndex(null);
//         setIsSearching(true);
//         setShowAlgorithm(true); // Display the algorithm
//         setHighlightedLine(0); // Start at the beginning of the algorithm
//         setErrorMessage(''); // Clear any previous error messages
//     };

//     // Pause or Resume the search
//     const togglePauseResume = () => {
//         setIsPaused((prev) => !prev);
//     };

//     // Handle speed change from the slider
//     const handleSpeedChange = (event) => {
//         setSpeed(parseInt(event.target.value, 10)); // Update the speed value
//     };

//     return (
//         <div>
//             <h1 className='mb-3'>Linear Search Visualization</h1>

//             <div className="mt-2">
//                 <button
//                     className='startbtn'
//                     onClick={startSearch}
//                     disabled={isSearching || foundIndex !== null} // Disable the start button if already searching or found
//                 >
//                     Start Search
//                 </button>
//                 <button
//                     className='pausebtn'
//                     onClick={togglePauseResume}
//                     disabled={!isSearching} // Disable pause/resume when not searching
//                 >
//                     {isPaused ? 'Resume' : 'Pause'}
//                 </button>
//             </div>

//             {/* Speed Slider (always visible) */}
//             <div style={{ marginTop: '20px' }}>
//                 <label htmlFor="speed-slider">Speed: {speed}ms</label>
//                 <input
//                     id="speed-slider"
//                     type="range"
//                     min="200"
//                     max="2000"
//                     step="100"
//                     value={speed}
//                     onChange={handleSpeedChange}
//                     style={{ width: '15%' }}
//                 />
//             </div>

//             <div className="visualization-algorithm-container" style={{ display: 'flex', justifyContent: 'space-between' }}>
//                 {/* Array Display */}
//                 <div className="array-visualization" style={{ flex: '1', paddingRight: '20px' }}>
//                     <div className="array-container" style={{ display: 'flex', flexWrap: 'wrap' }}>
//                         {array.map((value, index) => (
//                             <div
//                                 key={index}
//                                 className={`array-box ${highlightedIndex === index ? 'highlight' : ''} ${foundIndex === index ? 'found' : ''}`}
//                             >
//                                 <span>{value}</span>
//                             </div>
//                         ))}
//                     </div>

//                     {foundIndex !== null && (
//                         <div className='message'>{`Found ${valueToSearch} at index ${foundIndex}`}</div>
//                     )}

//                     {errorMessage && (
//                         <div style={{ color: 'red', marginTop: '10px' }}>{errorMessage}</div>
//                     )}
//                 </div>

//                 {/* Algorithm Visualization */}
//                 {showAlgorithm && (
//                     <div className="algorithm-code" style={{ flex: '1', textAlign: 'left', paddingLeft: '20px', backgroundColor: '#ffffff' }}>
//                         <h3 className='fw-bold'>Algorithm:</h3>
//                         {algorithmLines.map((line, index) => (
//                             <div
//                                 key={index}
//                                 className={highlightedLine === index ? 'highlight' : ''}
//                                 style={{ position: 'relative' }}
//                             >
//                                 {highlightedLine === index && (
//                                     <span className="pointer">→</span> // Pointer to show the active line
//                                 )}
//                                 {line}
//                             </div>
//                         ))}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default Search;
