import React, { useState, useEffect } from 'react';
import '../../style/LinearSearch.css'; // Assuming you have styles in an external CSS

const Remove = ({ array, valueToRemove, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [foundIndex, setFoundIndex] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [highlightedLine, setHighlightedLine] = useState(null); // For algorithm line highlighting
  const [showAlgorithm, setShowAlgorithm] = useState(false);

  // Linear Search algorithm visualization
  const algorithmLines = [
    "for (let i = 0; i < arr.length; i++) {",
    "  if (arr[i] === target) {",
    "    // Target found, remove it",
    "    arr.splice(i, 1);",
    "    return i;",
    "  }",
    "}",
    "return -1; // Target not found",
  ];
  // Handle the actual search logic with a visual delay
  useEffect(() => {
    if (isSearching && currentIndex < array.length) {
      const timer = setTimeout(() => {
        setHighlightedIndex(currentIndex); // Highlight current index
        setHighlightedLine(1); // Highlight "if" check line
        
        if (array[currentIndex] === valueToRemove) {
          setFoundIndex(currentIndex);
          setHighlightedLine(3); // Highlight "target found" line
          
          setTimeout(() => {
            onComplete(currentIndex); // Notify parent to remove the value
          }, 5000); //  delay before removing
        } else {
          setCurrentIndex((prev) => prev + 1); // Move to the next index
        }
      }, 1000); // Delay for visual effect

      return () => clearTimeout(timer);
    } else if (currentIndex >= array.length) {
      setIsSearching(false); // End the search if the end of the array is reached
      setHighlightedLine(6); // Target not found
    }
  }, [isSearching, currentIndex, array, valueToRemove, onComplete]);

  // Start the search process
  const startSearch = () => {
    setCurrentIndex(0);
    setFoundIndex(null);
    setHighlightedIndex(null);
    setIsSearching(true);
    setShowAlgorithm(true); // Show the algorithm visualization
    setHighlightedLine(0); // Start at the beginning of the algorithm
  };

  // Start searching when valueToRemove is provided
  useEffect(() => {
    if (valueToRemove) {
      startSearch();
    }
  }, [valueToRemove]);

  return (
    <div>
      <h1>Remove Visualization</h1>

      <div className="visualization-algorithm-container mt-4" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div className="array-visualization" style={{ flex: '1', paddingRight: '20px' }}>
          {/* Array Display */}
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
            <div className='message'>Found {valueToRemove} at index {foundIndex} and Removed.</div>
          )}
        </div>

        {/* Algorithm Display */}
        {showAlgorithm && (
          <div className="algorithm-code" style={{ flex: '1', textAlign: 'left', paddingLeft: '20px', backgroundColor:'#ffffff' }}>
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

export default Remove;
