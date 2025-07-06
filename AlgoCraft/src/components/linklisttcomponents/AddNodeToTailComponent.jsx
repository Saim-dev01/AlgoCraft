import React from 'react';

const AddNodeToTailComponent = ({ linkedList, setLinkedList, value }) => {
  // Add the new value to the end of the linked list
  const addNodeToTail = () => {
    setLinkedList([...linkedList, value]);
  };

  // Immediately invoke the function to add the node
  addNodeToTail();

  return null; // This component does not render anything
};

export default AddNodeToTailComponent;
