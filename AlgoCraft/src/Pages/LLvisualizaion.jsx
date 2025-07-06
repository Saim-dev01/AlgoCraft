
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';
import SortingComponent from '../components/linklisttcomponents/LinkedListSort';
import SearchComponent from '../components/linklisttcomponents/SearchComponent';
import AddBetweenComponent from '../components/linklisttcomponents/AddBetweenComponent.jsx';

class Node {
    constructor(value) {
        this.value = value;
        this.next = null;
    }
}

const LLVisualization = () => {
    const [head, setHead] = useState(null);
    const [newNodeValueH, setNewNodeValueH] = useState('');
    const [newNodeValue, setNewNodeValue] = useState('');
    const [newNodeBetweenValue, setNewNodeBetweenValue] = useState('');
    const [newNodePosition, setNewNodePosition] = useState('');
    const [showAddNodeInput, setShowAddNodeInput] = useState(false);
    const [showAddNodeToHeadInput, setShowAddNodeToHeadInput] = useState(false);
    const [showAddNodeBetweenInput, setShowAddNodeBetweenInput] = useState(false);
    const [removeNodeValue, setRemoveNodeValue] = useState('');
    const [showRemoveNodeInput, setShowRemoveNodeInput]= useState(false);
    const [isSorting, setIsSorting] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);
    const location = useLocation();
    const searchComponentRef = useRef(null);
    const [isAddingBetween, setIsAddingBetween] = useState(false);
    const [newlyAddedNode, setNewlyAddedNode] = useState(null);

    useEffect(() => {
        const handleResize = () => {
            setIsLandscape(window.innerWidth > window.innerHeight);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (location.state && location.state.linkedList) {
            const list = location.state.linkedList;
            let newHead = null;

            list.forEach((value) => {
                const newNode = new Node(value);
                if (!newHead) {
                    newHead = newNode;
                } else {
                    let currentNode = newHead;
                    while (currentNode.next) {
                        currentNode = currentNode.next;
                    }
                    currentNode.next = newNode;
                }
            });

            setHead(newHead);
        }
    }, [location]);

    const handleAddNodeToHead = () => {
        if (newNodeValueH.trim() === '') {
            alert('Please enter a valid value.');
            return;
        }

        const newNode = new Node(newNodeValueH.trim());
        newNode.next = head;
        setHead(newNode);
        setNewNodeValueH('');
    };

    const handleAddNodeToTail = () => {
        if (newNodeValue.trim() === '') {
            alert('Please enter a valid value.');
            return;
        }

        const newNode = new Node(newNodeValue.trim());
        if (!head) {
            setHead(newNode);
        } else {
            let currentNode = head;
            while (currentNode.next) {
                currentNode = currentNode.next;
            }
            currentNode.next = newNode;
        }
        setNewNodeValue('');
    };

    const handleAddNodeBetween = () => {
        if (newNodeBetweenValue.trim() === '' || newNodePosition.trim() === '') {
            alert('Please enter valid values.');
            return;
        }

        const value = newNodeBetweenValue.trim();
        const position = parseInt(newNodePosition, 10);

        setIsAddingBetween(true);

        setNewlyAddedNode({ value: value, position: position });

        setTimeout(() => {
            const updatedHead = AddBetweenComponent(head, value, position);
            setHead(updatedHead);
            setNewNodeBetweenValue('');
            setNewNodePosition('');
            setIsAddingBetween(false);
            setNewlyAddedNode(null);
        }, 1500);
    };

    const handleRemoveNode = () => {
        if (!removeNodeValue.trim()) {
          alert('Please enter a value to remove.');
          return;
        }
    
        const valueToRemove = removeNodeValue.trim();
    
        if (!head) {
          alert('Linked list is empty.');
          return;
        }
    
        if (head.value === valueToRemove) {
          // If the head node is the one to remove
          setHead(head.next);
          setRemoveNodeValue('');
          return;
        }
    
        let current = head;
        let prev = null;
    
        while (current) {
          if (current.value === valueToRemove) {
            // Node to remove found
            prev.next = current.next;  // Skip the current node
            setRemoveNodeValue('');
            return;
          }
          prev = current;
          current = current.next;
        }
    
        alert('Node with specified value not found.');
        setRemoveNodeValue('');
      };

    const renderLinkedList = () => {
        let currentNode = head;
        const nodes = [];
        while (currentNode) {
            nodes.push(currentNode);
            currentNode = currentNode.next;
        }
        return nodes;
    };

    const handleSort = () => {
        setIsSearching(false);
        setSearchQuery('');
        setIsSorting(true);
    };

    return (
        <div>
            {!isLandscape && (
                <div
                    style={{
                        position: 'fixed',
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: '100%',
                        background: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        textAlign: 'center',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: '1000',
                    }}
                >
                    <p>Please rotate your screen to landscape mode for a better experience.</p>
                </div>
            )}

            {isLandscape && (
                <div className="container-fluid p-0">
                    <div className="d-flex">
                        <div
                            className="side-bar p-2"
                            style={{
                                width: '250px',
                                minHeight: '100vh',
                                backgroundColor: '#6E56CF',
                                color: '#fff',
                                padding: '20px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '20px',
                            }}
                        >
                            <ul className="nav flex-column">
                                <h5
                                    className="border-bottom pb-2 mt-3"
                                    style={{
                                        marginBottom: '10px',
                                        fontWeight: 'bold',
                                        borderBottom: '1px solid #fff',
                                    }}
                                >
                                    Modify Linked List
                                </h5>
                                <li className="nav-item sidebar-item">
                                    <Link className="nav-link sidebar-item" to="/linklist-form">
                                        New LinkList
                                    </Link>
                                </li>

                               
                                <li className="nav-item sidebar-item">
                                    <a
                                        className="nav-link sidebar-item"
                                        onClick={() => setShowAddNodeToHeadInput(!showAddNodeToHeadInput)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        Add Node to Head
                                    </a>
                                    {showAddNodeToHeadInput && (
                                        <div className="input-container mt-2 ms-3" style={{ display: 'flex', alignItems: 'center' }}>
                                            <input
                                                type="text"
                                                value={newNodeValueH}
                                                onChange={(e) => setNewNodeValueH(e.target.value)}
                                                placeholder="Add Node"
                                                className="form-control"
                                                style={{ width: '100px' }}
                                            />
                                            <button
                                                onClick={handleAddNodeToHead}
                                                className="btn btn-light ms-2 fw-bold"
                                                style={{ color: '#7b73eb' }}
                                            >
                                                Add
                                            </button>
                                        </div>
                                    )}
                                </li>
                              
                                <li className="nav-item sidebar-item">
                                    <a
                                        className="nav-link sidebar-item"
                                        onClick={() => setShowAddNodeInput(!showAddNodeInput)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        Add Node to Tail
                                    </a>
                                    {showAddNodeInput && (
                                        <div className="input-container mt-2 ms-3" style={{ display: 'flex', alignItems: 'center' }}>
                                            <input
                                                type="text"
                                                value={newNodeValue}
                                                onChange={(e) => setNewNodeValue(e.target.value)}
                                                placeholder="Add Node"
                                                className="form-control"
                                                style={{ width: '100px' }}
                                            />
                                            <button
                                                onClick={handleAddNodeToTail}
                                                className="btn btn-light ms-2 fw-bold"
                                                style={{ color: '#7b73eb' }}
                                            >
                                                Add
                                            </button>
                                        </div>
                                    )}
                                </li>
                               
                                <li className="nav-item sidebar-item">
                                    <a className="nav-link sidebar-item" onClick={() => setShowAddNodeBetweenInput(!showAddNodeBetweenInput)} style={{ cursor: 'pointer' }}>Add Node Between</a>
                                    {showAddNodeBetweenInput && (
                                        <div className="input-container mt-2 ms-3" style={{ display: 'flex', flexDirection: 'row' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                <input type="text" value={newNodeBetweenValue} onChange={(e) => setNewNodeBetweenValue(e.target.value)} placeholder="Node Value" className="form-control" style={{ width: '100px' }} />
                                            <input type="number" value={newNodePosition} onChange={(e) => setNewNodePosition(e.target.value)} placeholder="Position" className="form-control" style={{ width: '100px' }} />
                                            </div>
                                            <button onClick={handleAddNodeBetween} className="btn btn-light ms-2 fw-bold" style={{ color: '#7b73eb' }}>Add</button>
                                        </div>
                                    )}
                                </li>

                                <li className="nav-item sidebar-item">
                  <a
                    className="nav-link sidebar-item"
                    onClick={() => setShowRemoveNodeInput(!showRemoveNodeInput)}
                    style={{ cursor: 'pointer' }}
                  >
                    Remove Node
                  </a>
                  {showRemoveNodeInput && (
                    <div className="input-container mt-2 ms-3" style={{ display: 'flex', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={removeNodeValue}
                        onChange={(e) => setRemoveNodeValue(e.target.value)}
                        placeholder="Remove Node"
                        className="form-control"
                        style={{ width: '100px' }}
                      />
                      <button
                        onClick={handleRemoveNode}
                        className="btn btn-light ms-2 fw-bold"
                        style={{ color: '#7b73eb' }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </li>
                                <h5
                                    className="border-bottom pb-2 mt-3"
                                    style={{
                                        marginBottom: '10px',
                                        fontWeight: 'bold',
                                        borderBottom: '1px solid #fff',
                                    }}
                                >
                                    Searching
                                </h5>

                                <li className="nav-item sidebar-item">
                                    
                                    <div className="input-container mt-2 ms-3" style={{ display: 'flex', alignItems: 'center' }}>
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search Node"
                                            className="form-control"
                                            style={{ width: '100px' }}
                                        />
                                        <button
                                            onClick={() => {
                                                setIsSorting(false);
                                                setIsSearching(true);
                                                if (searchComponentRef.current) {
                                                    searchComponentRef.current.performSearch(searchQuery);
                                                }
                                            }}
                                            className="btn btn-light fw-bold ms-2"
                                            style={{ color: '#7b73eb' }}
                                        >
                                            Search
                                        </button>
                                    </div>
                                </li>

                                <h5
                                    className="border-bottom pb-2 mt-3"
                                    style={{
                                        marginBottom: '10px',
                                        fontWeight: 'bold',
                                        borderBottom: '1px solid #fff',
                                    }}
                                >
                                    Sorting
                                </h5>

                                <li className="nav-item sidebar-item">
                                    <button
                                        className="btn btn-light fw-bold"
                                        style={{ color: '#7b73eb',marginLeft:'13px' }}
                                        onClick={handleSort}
                                    >
                                        Sort Linked List
                                    </button>
                                </li>
                            </ul>
                        </div>
                        <div className="flex-grow-1 p-3">
                            <div
                                className="linked-list-visualization mt-5 text-center"
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    flexDirection: 'column',
                                }}
                            >
                                <h1 className="fw-bold">Linked List Visualization</h1>

                                {isSearching ? (
                                    <SearchComponent ref={searchComponentRef} linkedList={head} searchQuery={searchQuery} setIsSearching={setIsSearching} />
                                ) : isSorting ? (
                                    <SortingComponent linkedList={head} setLinkedList={setHead} />
                                ) : (
                                    <div
                                        className="linked-list-container"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginTop: '20px',
                                            flexWrap: 'wrap',
                                            justifyContent: 'center',
                                            position: 'relative',
                                        }}
                                    >
                                        {renderLinkedList().length === 0 && <p>No nodes in the linked list.</p>}
                                        {renderLinkedList().map((node, index) => (
                                            <div
                                                key={index}
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.5, delay: index * 0.2 }}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    marginRight: '10px',
                                                    marginBottom: '10px',
                                                }}
                                            >
                                                <div
                                                    className="linkedlist-node"
                                                    initial={{ x: index === 0 ? -50 : 0 }}
                                                    animate={{ x: 0 }}
                                                    transition={{ duration: 0.5 }}
                                                    
                                                >
                                                    {node.value}

                                                    {index === 0 && (
                                                        <motion.div
                                                            className="head-indicator"
                                                            initial={{ x: -20 }}
                                                            animate={{ x: 0 }}
                                                            transition={{ duration: 0.5 }}
                                                        >
                                                            Head
                                                        </motion.div>
                                                    )}

                                                    {index === renderLinkedList().length - 1 && (
                                                        <motion.div
                                                            className="tail-indicator"
                                                            initial={{ x: 20 }}
                                                            animate={{ x: 0 }}
                                                            transition={{ duration: 0.5 }}
                                                        >
                                                            Tail
                                                        </motion.div>
                                                    )}
                                                </div>


                                                {index < renderLinkedList().length - 1 && (
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: '50px' }} //arrow length on x axis
                                                        transition={{ duration: 0.5 }}
                                                        style={{
                                                            height: '2px',
                                                            backgroundColor: '#6E56CF',
                                                            margin: '0 10px',
                                                        }}
                                                    ></motion.div>
                                                )}
                                            </div>
                                        ))}
                                        <AnimatePresence>
                                            {isAddingBetween && newlyAddedNode && (
                                                <motion.div
                                                    key="newNode"
                                                    className='linkedlist-node'
                                                    initial={{ opacity: 0, y: 50, scale: 0.5 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 50, scale: 0.5 }}
                                                    transition={{ duration: 0.5 }}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '100%',
                                                        left: '50%',
                                                        transform: 'translateX(-50%)',
                                                        marginTop: '20px',
                                                        
                                                    }}
                                                >
                                                    {newlyAddedNode.value}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LLVisualization;




// import React, { useState, useEffect, useRef } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useLocation, Link } from 'react-router-dom';
// import SortingComponent from '../components/linklisttcomponents/LinkedListSort';
// import SearchComponent from '../components/linklisttcomponents/SearchComponent';
// import AddBetweenComponent from '../components/linklisttcomponents/AddBetweenComponent.jsx';

// class Node {
//     constructor(value) {
//         this.value = value;
//         this.next = null;
//     }
// }

// const LLVisualization = () => {
//     const [head, setHead] = useState(null);
//     const [newNodeValueH, setNewNodeValueH] = useState('');
//     const [newNodeValue, setNewNodeValue] = useState('');
//     const [newNodeBetweenValue, setNewNodeBetweenValue] = useState('');
//     const [newNodePosition, setNewNodePosition] = useState('');
//     const [showAddNodeInput, setShowAddNodeInput] = useState(false);
//     const [showAddNodeToHeadInput, setShowAddNodeToHeadInput] = useState(false);
//     const [showAddNodeBetweenInput, setShowAddNodeBetweenInput] = useState(false);
//     const [isSorting, setIsSorting] = useState(false);
//     const [isSearching, setIsSearching] = useState(false);
//     const [searchQuery, setSearchQuery] = useState('');
//     const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);
//     const location = useLocation();
//     const searchComponentRef = useRef(null);
//     const [isAddingBetween, setIsAddingBetween] = useState(false);
//     const [newlyAddedNode, setNewlyAddedNode] = useState(null);

//     // New states for remove functionality
//     const [showRemoveNodeInput, setShowRemoveNodeInput] = useState(false);
//     const [removeNodeValue, setRemoveNodeValue] = useState('');
//     const [showRemoveNodeByPositionInput, setShowRemoveNodeByPositionInput] = useState(false);
//     const [removeNodePosition, setRemoveNodePosition] = useState('');

//     useEffect(() => {
//         const handleResize = () => {
//             setIsLandscape(window.innerWidth > window.innerHeight);
//         };

//         window.addEventListener('resize', handleResize);
//         return () => window.removeEventListener('resize', handleResize);
//     }, []);

//     useEffect(() => {
//         if (location.state && location.state.linkedList) {
//             const list = location.state.linkedList;
//             let newHead = null;

//             list.forEach((value) => {
//                 const newNode = new Node(value);
//                 if (!newHead) {
//                     newHead = newNode;
//                 } else {
//                     let currentNode = newHead;
//                     while (currentNode.next) {
//                         currentNode = currentNode.next;
//                     }
//                     currentNode.next = newNode;
//                 }
//             });

//             setHead(newHead);
//         }
//     }, [location]);

//     const handleAddNodeToHead = () => {
//         if (newNodeValueH.trim() === '') {
//             alert('Please enter a valid value.');
//             return;
//         }

//         const newNode = new Node(newNodeValueH.trim());
//         newNode.next = head;
//         setHead(newNode);
//         setNewNodeValueH('');
//     };

//     const handleAddNodeToTail = () => {
//         if (newNodeValue.trim() === '') {
//             alert('Please enter a valid value.');
//             return;
//         }

//         const newNode = new Node(newNodeValue.trim());
//         if (!head) {
//             setHead(newNode);
//         } else {
//             let currentNode = head;
//             while (currentNode.next) {
//                 currentNode = currentNode.next;
//             }
//             currentNode.next = newNode;
//         }
//         setNewNodeValue('');
//     };

//     const handleAddNodeBetween = () => {
//         if (newNodeBetweenValue.trim() === '' || newNodePosition.trim() === '') {
//             alert('Please enter valid values.');
//             return;
//         }

//         const value = newNodeBetweenValue.trim();
//         const position = parseInt(newNodePosition, 10);

//         setIsAddingBetween(true);

//         setNewlyAddedNode({ value: value, position: position });

//         setTimeout(() => {
//             const updatedHead = AddBetweenComponent(head, value, position);
//             setHead(updatedHead);
//             setNewNodeBetweenValue('');
//             setNewNodePosition('');
//             setIsAddingBetween(false);
//             setNewlyAddedNode(null);
//         }, 1500);
//     };

//     // Function to handle node removal by value
//     const handleRemoveNode = () => {
//         if (removeNodeValue.trim() === '') {
//             alert('Please enter a value to remove.');
//             return;
//         }

//         const valueToRemove = removeNodeValue.trim();

//         if (!head) {
//             alert('List is empty, cannot remove.');
//             return;
//         }

//         if (head.value === valueToRemove) {
//             // If the head node is the one to remove
//             setHead(head.next);
//             setRemoveNodeValue('');
//             return;
//         }

//         let currentNode = head;
//         let prevNode = null;

//         while (currentNode && currentNode.value !== valueToRemove) {
//             prevNode = currentNode;
//             currentNode = currentNode.next;
//         }

//         if (!currentNode) {
//             alert('Node with that value not found.');
//             return;
//         }

//         // Remove the node
//         prevNode.next = currentNode.next;
//         setRemoveNodeValue('');
//     };

//     // Function to handle node removal by position
//     const handleRemoveNodeByPosition = () => {
//         if (removeNodePosition.trim() === '') {
//             alert('Please enter a position to remove.');
//             return;
//         }

//         const positionToRemove = parseInt(removeNodePosition, 10);

//         if (!head) {
//             alert('List is empty, cannot remove.');
//             return;
//         }

//         if (positionToRemove === 0) {
//             // If the head node is the one to remove
//             setHead(head.next);
//             setRemoveNodePosition('');
//             return;
//         }

//         let currentNode = head;
//         let currentIndex = 0;

//         while (currentNode.next && currentIndex < positionToRemove - 1) {
//             currentNode = currentNode.next;
//             currentIndex++;
//         }

//         if (!currentNode.next) {
//             alert('Position out of range.');
//             return;
//         }

//         // Remove the node
//         currentNode.next = currentNode.next.next;
//         setRemoveNodePosition('');
//     };

//     const renderLinkedList = () => {
//         let currentNode = head;
//         const nodes = [];
//         while (currentNode) {
//             nodes.push(currentNode);
//             currentNode = currentNode.next;
//         }
//         return nodes;
//     };

//     const handleSort = () => {
//         setIsSearching(false);
//         setSearchQuery('');
//         setIsSorting(true);
//     };

//     return (
//         <div>
//             {!isLandscape && (
//                 <div
//                     style={{
//                         position: 'fixed',
//                         top: '0',
//                         left: '0',
//                         width: '100%',
//                         height: '100%',
//                         background: 'rgba(0, 0, 0, 0.7)',
//                         color: 'white',
//                         textAlign: 'center',
//                         display: 'flex',
//                         justifyContent: 'center',
//                         alignItems: 'center',
//                         zIndex: '1000',
//                     }}
//                 >
//                     <p>Please rotate your screen to landscape mode for a better experience.</p>
//                 </div>
//             )}... {isLandscape && (
//                 <div className="container-fluid p-0">
//                     <div className="d-flex">
//                         <div
//                             className="side-bar p-2"
//                             style={{
//                                 width: '250px',
//                                 minHeight: '100vh',
//                                 backgroundColor: '#6E56CF',
//                                 color: '#fff',
//                                 padding: '20px',
//                                 display: 'flex',
//                                 flexDirection: 'column',
//                                 gap: '20px',
//                             }}
//                         >
//                             <ul className="nav flex-column">
//                                 <h5
//                                     className="border-bottom pb-2 mt-3"
//                                     style={{
//                                         marginBottom: '10px',
//                                         fontWeight: 'bold',
//                                         borderBottom: '1px solid #fff',
//                                     }}
//                                 >
//                                     Modify Linked List
//                                 </h5>
//                                 <li className="nav-item sidebar-item">
//                                     <Link className="nav-link sidebar-item" to="/linklist-form">
//                                         New LinkList
//                                     </Link>
//                                 </li>

//                                 <li className="nav-item sidebar-item">
//                                     <a
//                                         className="nav-link sidebar-item"
//                                         onClick={() => setShowAddNodeToHeadInput(!showAddNodeToHeadInput)}
//                                         style={{ cursor: 'pointer' }}
//                                     >
//                                         Add Node to Head
//                                     </a>
//                                     {showAddNodeToHeadInput && (
//                                         <div className="input-container mt-2 ms-3" style={{ display: 'flex', alignItems: 'center' }}>
//                                             <input
//                                                 type="text"
//                                                 value={newNodeValueH}
//                                                 onChange={(e) => setNewNodeValueH(e.target.value)}
//                                                 placeholder="Add Node"
//                                                 className="form-control"
//                                                 style={{ width: '100px' }}
//                                             />
//                                             <button
//                                                 onClick={handleAddNodeToHead}
//                                                 className="btn btn-light ms-2 fw-bold"
//                                                 style={{ color: '#7b73eb' }}
//                                             >
//                                                 Add
//                                             </button>
//                                         </div>
//                                     )}
//                                 </li>

//                                 <li className="nav-item sidebar-item">
//                                     <a
//                                         className="nav-link sidebar-item"
//                                         onClick={() => setShowAddNodeInput(!showAddNodeInput)}
//                                         style={{ cursor: 'pointer' }}
//                                     >
//                                         Add Node to Tail
//                                     </a>
//                                     {showAddNodeInput && (
//                                         <div className="input-container mt-2 ms-3" style={{ display: 'flex', alignItems: 'center' }}>
//                                             <input
//                                                 type="text"
//                                                 value={newNodeValue}
//                                                 onChange={(e) => setNewNodeValue(e.target.value)}
//                                                 placeholder="Add Node"
//                                                 className="form-control"
//                                                 style={{ width: '100px' }}
//                                             />
//                                             <button
//                                                 onClick={handleAddNodeToTail}
//                                                 className="btn btn-light ms-2 fw-bold"
//                                                 style={{ color: '#7b73eb' }}
//                                             >
//                                                 Add
//                                             </button>
//                                         </div>
//                                     )}
//                                 </li>

//                                 <li className="nav-item sidebar-item">
//                                     <a className="nav-link sidebar-item" onClick={() => setShowAddNodeBetweenInput(!showAddNodeBetweenInput)} style={{ cursor: 'pointer' }}>Add Node Between</a>
//                                     {showAddNodeBetweenInput && (
//                                         <div className="input-container mt-2 ms-3" style={{ display: 'flex', flexDirection: 'row' }}>
//                                             <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
//                                                 <input type="text" value={newNodeBetweenValue} onChange={(e) => setNewNodeBetweenValue(e.target.value)} placeholder="Node Value" className="form-control" style={{ width: '100px' }} />
//                                                 <input type="number" value={newNodePosition} onChange={(e) => setNewNodePosition(e.target.value)} placeholder="Position" className="form-control" style={{ width: '100px' }} />
//                                             </div>
//                                             <button onClick={handleAddNodeBetween} className="btn btn-light ms-2 fw-bold" style={{ color: '#7b73eb' }}>Add</button>
//                                         </div>
//                                     )}
//                                 </li>

//                                 {/* Remove Node by Value Section */}
//                                 <li className="nav-item sidebar-item">
//                                     <a
//                                         className="nav-link sidebar-item"
//                                         onClick={() => setShowRemoveNodeInput(!showRemoveNodeInput)}
//                                         style={{ cursor: 'pointer' }}
//                                     >
//                                         Remove Node by Value
//                                     </a>
//                                     {showRemoveNodeInput && (
//                                         <div className="input-container mt-2 ms-3" style={{ display: 'flex', alignItems: 'center' }}>
//                                             <input
//                                                 type="text"
//                                                 value={removeNodeValue}
//                                                 onChange={(e) => setRemoveNodeValue(e.target.value)}
//                                                 placeholder="Remove Node"
//                                                 className="form-control"
//                                                 style={{ width: '100px' }}
//                                             />
//                                             <button
//                                                 onClick={handleRemoveNode}
//                                                 className="btn btn-light ms-2 fw-bold"
//                                                 style={{ color: '#7b73eb' }}
//                                             >
//                                                 Remove
//                                             </button>
//                                         </div>
//                                     )}
//                                 </li>

//                                 {/* Remove Node by Position Section */}
//                                 <li className="nav-item sidebar-item">
//                                     <a
//                                         className="nav-link sidebar-item"
//                                         onClick={() => setShowRemoveNodeByPositionInput(!showRemoveNodeByPositionInput)}
//                                         style={{ cursor: 'pointer' }}
//                                     >
//                                         Remove Node by Position
//                                     </a>
//                                     {showRemoveNodeByPositionInput && (
//                                         <div className="input-container mt-2 ms-3" style={{ display: 'flex', alignItems: 'center' }}>
//                                             <input
//                                                 type="number"
//                                                 value={removeNodePosition}
//                                                 onChange={(e) => setRemoveNodePosition(e.target.value)}
//                                                 placeholder="Position"
//                                                 className="form-control"
//                                                 style={{ width: '100px' }}
//                                             />
//                                             <button
//                                                 onClick={handleRemoveNodeByPosition}
//                                                 className="btn btn-light ms-2 fw-bold"
//                                                 style={{ color: '#7b73eb' }}
//                                             >
//                                                 Remove
//                                             </button>
//                                         </div>
//                                     )}
//                                 </li>

//                                 <h5
//                                     className="border-bottom pb-2 mt-3"
//                                     style={{
//                                         marginBottom: '10px',
//                                         fontWeight: 'bold',
//                                         borderBottom: '1px solid #fff',
//                                     }}
//                                 >
//                                     Searching
//                                 </h5>

//                                 <li className="nav-item sidebar-item">
//                                     Search
//                                     <div className="input-container mt-2 ms-3" style={{ display: 'flex', alignItems: 'center' }}>
//                                         <input
//                                             type="text"
//                                             value={searchQuery}
//                                             onChange={(e) => setSearchQuery(e.target.value)}
//                                             placeholder="Search Node"
//                                             className="form-control"
//                                             style={{ width: '100px' }}
//                                         />
//                                         <button
//                                             onClick={() => {
//                                                 setIsSorting(false);
//                                                 setIsSearching(true);
//                                                 if (searchComponentRef.current) {
//                                                     searchComponentRef.current.performSearch(searchQuery);
//                                                 }
//                                             }}
//                                             className="btn btn-light fw-bold ms-2"
//                                             style={{ color: '#7b73eb' }}
//                                         >
//                                             Search
//                                         </button>
//                                     </div>
//                                 </li>

//                                 <h5
//                                     className="border-bottom pb-2 mt-3"
//                                     style={{
//                                         marginBottom: '10px',
//                                         fontWeight: 'bold',
//                                         borderBottom: '1px solid #fff',
//                                     }}
//                                 >
//                                     Sorting
//                                 </h5>

//                                 <li className="nav-item sidebar-item">
//                                     <button
//                                         className="btn btn-light fw-bold"
//                                         style={{ color: '#7b73eb' }}
//                                         onClick={handleSort}
//                                     >
//                                         Sort Linked List
//                                     </button>
//                                 </li>
//                             </ul>
//                         </div>
//                         <div className="flex-grow-1 p-3">
//                             <div
//                                 className="linked-list-visualization mt-5 text-center"
//                                 style={{
//                                     display: 'flex',
//                                     justifyContent: 'center',
//                                     alignItems: 'center',
//                                     minHeight: '50vh',
//                                 }}
//                             >
//                                 {isSorting ? (
//                                     <SortingComponent head={head} setHead={setHead} setIsSorting={setIsSorting} />
//                                 ) : isSearching ? (
//                                     <SearchComponent head={head} searchQuery={searchQuery} ref={searchComponentRef} />
//                                 ) : (
//                                     renderLinkedList().map((node, index) => (
//                                         <motion.div
//                                             key={index}
//                                             className="node"
//                                             style={{
//                                                 display: 'flex',
//                                                 alignItems: 'center',
//                                                 margin: '10px',
//                                                 padding: '10px',
//                                                 border: '1px solid #ccc',
//                                                 borderRadius: '5px',
//                                                 backgroundColor: '#f9f9f9',
//                                             }}
//                                             initial={{ opacity: 0, x: -50 }}
//                                             animate={{ opacity: 1, x: 0 }}
//                                             exit={{ opacity: 0, x: 50 }}
//                                             transition={{ duration: 0.3 }}
//                                         >
//                                             {node.value}
//                                             {index < renderLinkedList().length - 1 && (
//                                                 <motion.div
//                                                     className="arrow"
//                                                     style={{ margin: '0 10px' }}
//                                                     initial={{ opacity: 0, scale: 0 }}
//                                                     animate={{ opacity: 1, scale: 1 }}
//                                                     exit={{ opacity: 0, scale: 0 }}
//                                                     transition={{ duration: 0.2 }}
//                                                 >
//                                                     →
//                                                 </motion.div>
//                                             )}
//                                         </motion.div>
//                                     ))
//                                 )}
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default LLVisualization;
