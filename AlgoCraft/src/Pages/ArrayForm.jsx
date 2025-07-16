// src/pages/ArrayForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate
import FormLayout from '../components/FormLayout'; // Adjust path as needed
import '../style/ArrayForm.css'

function ArrayForm() {
    const [dataType, setDataType] = useState('int');
    const [arrayInput, setArrayInput] = useState('');
    const [arraySize, setArraySize] = useState(''); // New state for array size
    const [error, setError] = useState('');
    const [array, setArray] = useState([]); // Add this state to hold the array
    const [showArray, setShowArray] = useState(false); // State to control the visibility of the array
    const navigate = useNavigate();  // Initialize useNavigate

    // Function to validate input based on selected data type
    const validateInput = (input) => {
        const elements = input.split(',').map((el) => el.trim());

        let isValid = true;

        switch (dataType) {
            case 'int':
                isValid = elements.every((el) => /^-?\d+$/.test(el));
                break;
            case 'float':
                isValid = elements.every((el) => /^-?\d+(\.\d+)?$/.test(el));
                break;
            case 'char':
                isValid = elements.every((el) => el.length === 1);
                break;
            case 'string':
                isValid = elements.every((el) => typeof el === 'string');
                break;
            default:
                isValid = false;
        }

        if (isValid && arraySize) {
            // Check if the number of elements matches the array size if a size is provided
            isValid = elements.length === parseInt(arraySize, 10);
            if (!isValid) {
                setError(`Number of elements should match the specified size of ${arraySize}.`);
                return false;
            }
        }

        setError(isValid ? '' : `Please enter valid ${dataType} values.`);
        return isValid;
    };

    // Handler for submit button
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateInput(arrayInput)) {
            // Convert input to array
            const elements = arrayInput.split(',').map(el => el.trim());

            // Update the array state
            setArray(elements);

            // Navigate to the next page and pass the array data via state
            navigate('/visualization', { state: { array: elements, dataType: dataType } });
        }
    };

    // Handler for showing the array visually
    const handleShowArray = () => {
        if (validateInput(arrayInput)) {
            const elements = arrayInput.split(',').map(el => el.trim());
            setArray(elements);  // Set the array
            setShowArray(true);  // Show the array visualization
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <FormLayout>
            <div className="form-array-container d-lg-flex mt-3">
                {/* Left side: Form */}
                <div className="form-section col-lg-12 ps-4 ms-lg-2">
                    <form onSubmit={handleSubmit}>
                    <h2 className='text-center fw-bold mb-4'>Array Data</h2>
                        <div className="form-group mb-3">
                            <label htmlFor="dataType" className="form-label">Select Data Type:</label>
                            <select
                                id="dataType"
                                className="form-control"
                                value={dataType}
                                onChange={(e) => setDataType(e.target.value)}
                            >
                                <option value="int">Integer</option>
                                <option value="float">Float</option>
                                <option value="char">Character</option>
                                <option value="string">String</option>
                            </select>
                        </div>

                        <div className="form-group mb-3">
                            <label htmlFor="arraySize" className="form-label">Enter Array Size:</label>
                            <input
                                type="number"
                                id="arraySize"
                                className="form-control"
                                placeholder="Enter size of the array"
                                value={arraySize}
                                onChange={(e) => setArraySize(e.target.value)}
                                min="1"
                            />
                        </div>

                        <div className="form-group mb-3">
                            <label htmlFor="arrayElements" className="form-label">Enter Array Elements:</label>
                            <input
                                type="text"
                                id="arrayElements"
                                className="form-control"
                                placeholder="Enter elements separated by commas (e.g., 1, 2, 3)"
                                value={arrayInput}
                                onChange={(e) => setArrayInput(e.target.value)}
                                onBlur={() => validateInput(arrayInput)}
                            />
                            {error && <small className="text-danger">{error}</small>}
                        </div>

                        <div className="button-group d-flex justify-content-center">
                            <button
                                type="button"
                                className="btn btn-default-values me-2"
                                onClick={() => {
                                    setArrayInput('1, 5, 7, 2, 2, 3'); // Example default values
                                    setArraySize('6'); // Example size
                                    setError('');
                                    setShowArray(false);  // Hide the array when default values are clicked
                                }}
                            >
                                Default Values
                            </button>
                            <button
                                type="button"
                                className="btn btn-show-array me-2"
                                onClick={handleShowArray}
                            >
                                Show Array
                            </button>
                            <button type="submit" className="btn btn-submit">Submit</button>
                        </div>
                    </form>
                </div>

                {/* Right side: Array visualization, only shown if showArray is true */}
                {showArray && (
                    <div className="array-visualization col-lg-12 mt-2">
                        <h2 className='text-center fw-bold mb-5 init-visual'>Initial Visualization</h2>
                        <div className="array-container ms-lg-4">
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
                )}
            </div>
        </FormLayout>
    );
}
export default ArrayForm;
