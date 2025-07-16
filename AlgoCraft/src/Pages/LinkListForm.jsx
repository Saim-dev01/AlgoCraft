import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FormLayout from "../components/FormLayout";
import "../style/LinkListForm.css";

function LinkedListForm() {
  const [dataType, setDataType] = useState("int");
  const [nodeValues, setNodeValues] = useState("");
  const [linkedList, setLinkedList] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Default values for each data type
  const defaultValues = {
    int: "4,1,9,2",
    float: "5.6,2.9,1.0,4.2,3.9",
    char: "y,w,k,a",
    string: "tashfeen,saim,amna",
  };

  // Function to validate multiple node inputs
  const validateNodes = (input) => {
    const values = input.split(",").map((value) => value.trim());
    let isValid = true;

    switch (dataType) {
      case "int":
        isValid = values.every((value) => /^-?\d+$/.test(value));
        break;
      case "float":
        isValid = values.every((value) => /^-?\d+(\.\d+)?$/.test(value));
        break;
      case "char":
        isValid = values.every((value) => value.length === 1);
        break;
      case "string":
        isValid = values.every((value) => typeof value === "string");
        break;
      default:
        isValid = false;
    }

    setError(isValid ? "" : `Please enter valid ${dataType} values.`);
    return isValid;
  };

  // Handler to add nodes to the linked list
  const handleAddNodes = () => {
    if (validateNodes(nodeValues)) {
      const values = nodeValues.split(",").map((value) => value.trim());
      setLinkedList([...linkedList, ...values]);
      setNodeValues(""); // Reset the input field
    }
  };

  // Handler for "Default" button to pre-fill fields
  const handleDefault = () => {
    setNodeValues(defaultValues[dataType]);
  };

  // Handler to submit the linked list
  const handleSubmit = (e) => {
    e.preventDefault();
    const valuesToSubmit = nodeValues.trim()
      ? nodeValues.split(",").map((value) => value.trim())
      : linkedList;

    if (validateNodes(valuesToSubmit.join(",")) && valuesToSubmit.length > 0) {
      navigate("/LLvisualization", { state: { linkedList: valuesToSubmit, dataType } });
    } else {
      setError("Please add valid nodes to the linked list.");
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <FormLayout>
      <div className="form-linkedlist-container d-lg-flex ">
        {/* Left side: Form */}
        <div className="form-section col-lg-12 ps-4 ms-lg-2">
          <form onSubmit={handleSubmit}>
            <h2 className="text-center fw-bold mb-4 mt-3">Linked List Data</h2>
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
              <label htmlFor="nodeValues" className="form-label">Enter Node Values:</label>
              <input
                type="text"
                id="nodeValues"
                className="form-control"
                placeholder="Enter values separated by commas (e.g., 1, 2, 3)"
                value={nodeValues}
                onChange={(e) => setNodeValues(e.target.value)}
                onBlur={() => validateNodes(nodeValues)}
              />
              {error && <small className="text-danger">{error}</small>}
            </div>

            <div className="button-group d-flex justify-content-center">
              <button
                type="button"
                className="btn btn-default me-2"
                onClick={handleDefault}
              >
                Default
              </button>
              <button
                type="button"
                className="btn btn-add-node me-2"
                onClick={handleAddNodes}
              >
                Add Nodes
              </button>
              <button type="submit" className="btn btn-submit">Submit</button>
            </div>
          </form>
        </div>

        {/* Right side: Linked List visualization */}
        {linkedList.length > 0 && (
          <div className="linkedlist-visualization col-lg-12 mt-3">
            <h2 className="text-center fw-bold mb-5 init-visual">Linked List Visualization</h2>
            <div className="linkedlist-container ms-lg-4 d-flex flex-row align-items-center justify-content-center">
              {linkedList.map((value, index) => (
                <React.Fragment key={index}>
                  <div
                    className={`linkedlist-node ${
                      index === 0 ? "head-node" : index === linkedList.length - 1 ? "tail-node" : ""
                    }`}
                  >
                    <span>{value}</span>
                    {index === 0 && <div className="head-indicator">H</div>}
                    {index === linkedList.length - 1 && <div className="tail-indicator">T</div>}
                  </div>
                  {index < linkedList.length - 1 && (
                    <div className="linkedlist-arrow">→</div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>
    </FormLayout>
  );
}

export default LinkedListForm;
