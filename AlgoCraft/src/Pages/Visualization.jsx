import React, { useState, useEffect } from 'react';
import BubbleSort from '../components/Array Components/BubbleSort';
import QuickSort from '../components/Array Components/QuickSort';
import HeapSort from '../components/Array Components/HeapSort';
import Search from '../components/Array Components/Search';
import BinarySearch from '../components/Array Components/BinarySearch';
import Remove from '../components/Array Components/Remove';
import '../style/bubble.css'
import { saveUserSession } from '../utils/userSessions';

import { Link, useLocation } from 'react-router-dom';

const Visualization = () => {
  const [showRemoveInput, setShowRemoveInput] = useState(false); // State for remove input
  const [showSearchInput, setShowSearchInput] = useState(false); // State for search input
  const [showBinarySearchInput, setShowBinarySearchInput] = useState(false); // State for binary search input
  const [removeIndex, setRemoveIndex] = useState(''); // State for index to remove
  const [searchValue, setSearchValue] = useState(''); // State for value to search
  const [binarySearchValue, setBinarySearchValue] = useState(''); // State for value to search using binary search
  const [array, setArray] = useState([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('');
  const [showArray, setShowArray] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isBinarySearching, setIsBinarySearching] = useState(false); // State for binary search process
  const [isRemoving, setIsRemoving] = useState(false); // State for removal process
  const [isLandscape, setIsLandscape] = useState(null);

  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.array) {
      setArray(location.state.array);
    }
  }, [location]);

  useEffect(() => {
    // Function to check if the user is in landscape mode
    const checkOrientation = () => {
      const isLandscapeMode = window.innerWidth > window.innerHeight;
      setIsLandscape(isLandscapeMode); // Set to true or false based on orientation
    };

    // Check orientation when the component mounts
    checkOrientation();

    // Add event listener to handle orientation change
    window.addEventListener("resize", checkOrientation);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("resize", checkOrientation);
    };
  }, []);

  // Remove functionality
  const handleRemoveClick = () => {
    setShowRemoveInput(true);
    setShowSearchInput(false); // Hide search input when remove is selected
    setShowBinarySearchInput(false); // Hide binary search input
  };

  const handleRemoveInputChange = (e) => {
    setRemoveIndex(e.target.value);
  };

  const handleRemove = () => {
    const index = parseInt(removeIndex, 10);
    if (!isNaN(index) && index >= 0 && index < array.length) {
      setIsRemoving(true); // Start removal process
    } else {
      alert('Please enter a valid index.');
    }
  };

  const handleRemoveComplete = (index) => {
    const newArray = [...array];
    newArray.splice(index, 1); // Remove the value at the found index
    setArray(newArray);
    setIsRemoving(false); // Stop the removal process
    setRemoveIndex(''); // Clear the input field
  };

  // Search functionality
  const handleSearchClick = () => {
    setShowSearchInput(true);
    setShowRemoveInput(false); // Hide remove input when search is selected
    setShowBinarySearchInput(false); // Hide binary search input
  };

  const handleSearchInputChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleSearch = () => {
    if (searchValue !== '' && !isNaN(searchValue)) {
      setIsSearching(true); // Start search process
      // Save session to Firestore
      saveUserSession('linear-search', { array: [...array], value: searchValue }, null, null, '');
    } else {
      alert('Please enter a valid number to search.');
    }
  };

  // Binary Search functionality
  const handleBinarySearchClick = () => {
    setShowBinarySearchInput(true);
    setShowSearchInput(false); // Hide search input when binary search is selected
    setShowRemoveInput(false); // Hide remove input
  };

  const handleBinarySearchInputChange = (e) => {
    setBinarySearchValue(e.target.value);
  };

  const handleBinarySearch = () => {
    if (binarySearchValue !== '' && !isNaN(binarySearchValue)) {
      setIsBinarySearching(true); // Start binary search process
      // Save session to Firestore
      saveUserSession('binary-search', { array: [...array], value: binarySearchValue }, null, null, '');
    } else {
      alert('Please enter a valid number to search using binary search.');
    }
  };

  const handleAlgorithmSelection = (algorithm) => {
    setSelectedAlgorithm(algorithm);
    setShowArray(false);
    setShowRemoveInput(false);
    setShowSearchInput(false);
    setShowBinarySearchInput(false);
    // Save session to Firestore
    saveUserSession(algorithm, { array: [...array] }, null, null, '');
  };

  return (
    <div>
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

      {/* Only show content in landscape mode */}
      {isLandscape === true && (
        <div className="container-fluid p-0">
          <div className="d-flex">
            <div className="side-bar p-2" style={{
              width: '250px', // Wider sidebar for better spacing
              minHeight: '100vh',
              backgroundColor: '#6E56CF',
              color: '#fff', // Text color
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px', // Spacing between groups
            }}
            >
              <ul className="nav flex-column">
                <h5 className="border-bottom pb-2 mt-3" style={{
                  marginBottom: '10px',
                  fontWeight: 'bold',
                  borderBottom: '1px solid #fff',
                  paddingBottom: '5px',
                }}
                >Modify Array</h5>
                <li className="nav-item">
                  <Link className="nav-link sidebar-item" to="/array-form">New Array</Link>
                </li>
                <li className="nav-item sidebar-item">
                  <a className="nav-link sidebar-item" onClick={handleRemoveClick} style={{ cursor: 'pointer' }}>
                    Remove Index
                  </a>
                  {showRemoveInput && (
                    <div className="remove-input-container mt-2 ms-3 mb-2">
                      <input
                        type="number"
                        value={removeIndex}
                        onChange={handleRemoveInputChange}
                        placeholder="Index"
                        className="form-control"
                        style={{ width: '100px' }}
                      />
                      <button onClick={handleRemove} className="btn btn-light ms-2 fw-bold" style={{ color: '#7b73eb' }}>Remove</button>
                    </div>
                  )}
                </li>
                <h5 className="border-bottom pb-2 mt-2" style={{
                  marginBottom: '10px',
                  fontWeight: 'bold',
                  borderBottom: '1px solid #fff',
                  paddingBottom: '5px',
                }}
                >Sorting</h5>
                <li className="nav-item">
                  <a className="nav-link sidebar-item" onClick={() => handleAlgorithmSelection('bubble')} style={{ cursor: 'pointer' }}>
                    Bubble Sort
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link sidebar-item" onClick={() => handleAlgorithmSelection('quick')} style={{ cursor: 'pointer' }}>
                    Quick Sort
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link sidebar-item" onClick={() => handleAlgorithmSelection('heap')} style={{ cursor: 'pointer' }}>
                    Heap Sort
                  </a>
             </li>  
                <h5 className="border-bottom pb-2 mt-2" style={{
                  marginBottom: '10px',
                  fontWeight: 'bold',
                  borderBottom: '1px solid #fff',
                  paddingBottom: '5px',
                }}
                >Searching</h5>
                <li className="nav-item sidebar-item">
                  <a className="nav-link sidebar-item" onClick={handleSearchClick} style={{ cursor: 'pointer' }}>
                    Linear Search
                  </a>
                  {showSearchInput && (
                    <div className="search-input-container mt-2 ms-3 mb-2" style={{ display: 'flex', alignItems: 'center' }}>
                      <input
                        type="number"
                        value={searchValue}
                        onChange={handleSearchInputChange}
                        placeholder="Value"
                        className="form-control"
                        style={{ width: '100px' }}
                      />
                      <button onClick={handleSearch} className="btn btn-light ms-2 fw-bold" style={{ color: '#7b73eb' }}>
                        Search
                      </button>
                    </div>
                  )}
                </li>

                <li className="nav-item">
                  <a className='nav-link sidebar-item' onClick={handleBinarySearchClick}>
                    Binary Search
                  </a>

                  {showBinarySearchInput && (
                    <div className="binary-search-input-container mt-2 ms-3 mb-2" style={{ display: 'flex', alignItems: 'center' }}>
                      <input
                        type="number"
                        value={binarySearchValue}
                        onChange={handleBinarySearchInputChange}
                        placeholder="Value"
                        className="form-control"
                        style={{ width: '100px' }}
                      />
                      <button onClick={handleBinarySearch} className="btn btn-light ms-2 fw-bold" style={{ color: '#7b73eb' }}>Search</button>
                    </div>
                  )}
                </li>
              </ul>
            </div>

            <div className="flex-grow-1 p-3">
              <div className="d-flex">
                {showArray && !isSearching && !isRemoving && !isBinarySearching && (
                  <div
                    className="initial-visuals2 mt-3"
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      width: '100%',
                      textAlign: 'center',
                    }}
                  >
                    <div className="text-center mt-5 array-visualization">
                      <h1 className='fw-bold'>Array Visualization</h1>
                      <div className="array-container"
                      //style={{ display: 'flex', flexWrap: 'wrap' }}
                      >
                        {array.map((value, index) => (
                          <div
                            key={index}
                            className="array-box"
                          >
                            <span>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex-grow-1 p-3">
                  <div className="text-center mt-5">
                    {isSearching && searchValue && (
                      <Search array={array} valueToSearch={parseInt(searchValue, 10)} onComplete={() => setIsSearching(false)} />
                    )}
                    {!isSearching && isBinarySearching && binarySearchValue && (
                      <BinarySearch array={array} valueToSearch={parseInt(binarySearchValue, 10)} onComplete={() => setIsBinarySearching(false)} />
                    )}
                    {!isSearching && isRemoving && removeIndex && (
                      <Remove array={array} valueToRemove={array[parseInt(removeIndex, 10)]} onComplete={handleRemoveComplete} />
                    )}
                    {selectedAlgorithm === 'bubble' && !isSearching && !isBinarySearching && !isRemoving && <BubbleSort array={array} />}
                    {selectedAlgorithm === 'quick' && !isSearching && !isBinarySearching && !isRemoving && <QuickSort array={array} />}
                    {selectedAlgorithm === 'heap' && !isSearching && !isBinarySearching && !isRemoving && <HeapSort array={array} />}
                  
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Visualization;
