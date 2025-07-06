// AddBetweenComponent.jsx
import React from 'react';
// AddBetweenComponent.jsx
class Node {
  constructor(value) {
      this.value = value;
      this.next = null;
  }
}

const AddBetweenComponent = (head, value, position) => {
    console.log("AddBetweenComponent called with:", { head, value, position });

    if (position < 1) {
        alert("Position must be greater than or equal to 1.");
        return head;
    }

    const newNode = new Node(value);

    if (!head) {
        // If the list is empty and position is 1, set newNode as the head
        if (position === 1) {
            return newNode;
        } else {
            alert("Invalid position. List is empty.");
            return head;
        }
    }

    if (position === 1) {
        // Insert at the head position
        newNode.next = head;
        return newNode;
    }

    let current = head;
    let index = 1;

    // Traverse to the node just before the desired position
    while (current !== null && index < position - 1) {
        current = current.next;
        index++;
    }

    if (!current) {
        alert("Position is out of bounds.");
        return head;
    }

    // Insert the new node
    newNode.next = current.next;
    current.next = newNode;

    return head;
};

export default AddBetweenComponent;

