import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const SortingComponent = ({ linkedList, setLinkedList, setIsSorting }) => {
  const [originalList, setOriginalList] = useState(null);
  const [currentMessage, setCurrentMessage] = useState('');
  const [highlightedIndices, setHighlightedIndices] = useState([]);
  const [highlightedLine, setHighlightedLine] = useState(null);
  const [stepLogs, setStepLogs] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [speedMs, setSpeedMs] = useState(700);
  const [paused, setPaused] = useState(false);
  const pauseRef = useRef(paused);
  const speedRef = useRef(speedMs);
  const stepLogsRef = useRef(null);  // Define the reference to the step logs container

  useEffect(() => {
    pauseRef.current = paused;
  }, [paused]);

  useEffect(() => {
    speedRef.current = speedMs;
  }, [speedMs]);

  const delay = async () => {
    while (pauseRef.current) {
      await new Promise((r) => setTimeout(r, 100));
    }
    return new Promise((resolve) => setTimeout(resolve, speedRef.current));
  };

  const algorithmCode = [
    'function bubbleSortLinkedList(head) {',
    '  if (!head || !head.next) return head;',
    '  let swapped;',
    '  do {',
    '    swapped = false;',
    '    let current = head;',
    '    let prev = null;',
    '    while (current && current.next) {',
    '      if (current.value > current.next.value) {',
    '        const temp = current.next;',
    '        current.next = temp.next;',
    '        temp.next = current;',
    '        if (prev) {',
    '          prev.next = temp;',
    '        } else {',
    '          head = temp;',
    '        }',
    '        swapped = true;',
    '        prev = temp;',
    '      } else {',
    '        prev = current;',
    '        current = current.next;',
    '      }',
    '    }',
    '  } while (swapped);',
    '  return head;',
    '}',
  ];

  const cloneList = (head) => {
    if (!head) return null;
    const newHead = { value: head.value, next: null };
    let currentNew = newHead;
    let currentOld = head.next;
    while (currentOld) {
      currentNew.next = { value: currentOld.value, next: null };
      currentNew = currentNew.next;
      currentOld = currentOld.next;
    }
    return newHead;
  };

  const bubbleSortLinkedList = async (head) => {
    if (!head || !head.next) return head;
    let dummy = { next: head };
    let swapped;
    let iteration = 0;

    do {
      swapped = false;
      let prev = dummy;
      let current = dummy.next;

      while (current && current.next) {
        setHighlightedIndices([current.value, current.next.value]);
        setCurrentMessage(`Comparing ${current.value} and ${current.next.value}`);
        setHighlightedLine(8);
        setStepLogs((logs) => [...logs, `Comparing ${current.value} and ${current.next.value}`]);
        await delay();

        if (parseFloat(current.value) > parseFloat(current.next.value)) {
          setCurrentMessage(`Swapping ${current.value} and ${current.next.value}`);
          setHighlightedLine(10);
          setStepLogs((logs) => [...logs, `Swapping ${current.value} and ${current.next.value}`]);
          await delay();

          // Perform the node swap (without changing the values immediately)
          const temp = current.next;
          current.next = temp.next;
          temp.next = current;
          prev.next = temp;

          swapped = true;

          setLinkedList(cloneList(dummy.next));  // Update the UI with the new list
          await delay();

          prev = temp;
        } else {
          prev = current;
          current = current.next;
        }
      }

      iteration++;
      setStepLogs((logs) => [...logs, `End of iteration ${iteration}`]);
    } while (swapped);

    setHighlightedIndices([]);
    setCurrentMessage(`Sorting completed in ${iteration} iterations.`);
    setHighlightedLine(null);
    setStepLogs((logs) => [...logs, 'Sorting completed.']);

    return dummy.next;
  };

  const handleSort = async () => {
    setStepLogs([]);
    setShowDetails(true);
    const sortedHead = await bubbleSortLinkedList(linkedList);
    setLinkedList(sortedHead);
  };

  const handlePauseResume = () => {
    setPaused((prev) => !prev);
  };

  const handleReset = () => {
    if (!originalList) return;
    setLinkedList(cloneList(originalList));
    setHighlightedIndices([]);
    setCurrentMessage('');
    setHighlightedLine(null);
    setStepLogs([]);
    setShowDetails(false);
    setPaused(false);
  };

  const renderLinkedList = () => {
    const nodes = [];
    let currentNode = linkedList;
    while (currentNode) {
      nodes.push(currentNode);
      currentNode = currentNode.next;
    }

    return nodes.map((node, index) => {
      const isHighlighted = highlightedIndices.includes(node.value);
      return (
        <motion.div
          key={node.value}
          layout
          transition={{ duration: speedMs / 1000, ease: 'easeInOut' }}
          style={{ display: 'flex', alignItems: 'center', marginRight: '10px' }}
        >
          <motion.div
            // animate={{
            //    x: isHighlighted ? [0, 30, 0] : 0, // Moves the node along the X axis
            //    y: isHighlighted ? [0, 20, 0] : 0, // Move it a little bit vertically to simulate the swap
            // }}
            transition={{
              duration: speedMs / 1000,
              ease: 'easeInOut',
            }}
            style={{
              backgroundColor: isHighlighted ? '#a2a4cc' : '#7b73eb',
              border: isHighlighted ? '2px solid #ff9900' : 'none',
              padding: '10px 20px',
              borderRadius: '10px',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '18px',
              position: 'relative',
            }}
          >
            {node.value}
            {index === 0 && <div className="head-indicator">H</div>}
            {node.next === null && <div className="tail-indicator">T</div>}
          </motion.div>
          {node.next && (
            <motion.div
              animate={{
                opacity: isHighlighted ? [1, 0, 1] : 1, // Fade out and in to simulate a swap
              }}
              transition={{
                duration: speedMs / 1000,
                ease: 'easeInOut',
              }}
              style={{
                width: '50px',
                height: '2px',
                backgroundColor: isHighlighted ? '#ff9900' : '#6E57CF',
                margin: '0 10px',
              }}
            ></motion.div>
          )}
        </motion.div>
      );
    });
  };

  useEffect(() => {
    if (linkedList && !originalList) {
      setOriginalList(cloneList(linkedList));
    }
  }, [linkedList, originalList]);

  useEffect(() => {
    if (stepLogsRef.current) {
      stepLogsRef.current.scrollTop = stepLogsRef.current.scrollHeight;
    }
  }, [stepLogs]);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
      <div style={{marginTop:'20px'}}>
     
        <div style={{ marginBottom: '10px' }}>
          <button onClick={handleSort} className="startbtn">Start Sorting</button>
          <button onClick={handlePauseResume} className="pausebtn">{paused ? 'Resume' : 'Pause'}</button>
          <button onClick={handleReset} className="restartbtn">Reset</button>
          
        </div>
<div style={{marginBottom:'20px'}}>
   <label htmlFor="speedSlider" style={{ marginRight: '10px', fontWeight: 'bold' }}>Speed:</label>
       <input
  type="range"
  min="100"
  max="2000"
  step="100"
  value={speedMs}
  onChange={(e) => setSpeedMs(Number(e.target.value))}
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
          <span>{speedMs} ms</span>
  </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '20px' }}>
          {renderLinkedList()}
        </div>

        {showDetails && (
          <>
            <div className="messages" style={{ marginTop: '20px' }}>
              <p style={{ color: '#6E56CF', fontWeight: 'bold' }}>{currentMessage}</p>
            </div>
            <div className="step-logs" style={{ marginTop: '20px' }}>
            <div ref={stepLogsRef} style={{ height: '300px', overflowY: 'scroll', background: '#f9f9f9', padding: '10px', border: '1px solid #ccc' }}>
            <h5 style={{ color: '#6E56CF' }}>Steps Log:</h5>
              <ul style={{ listStyle: 'initial', lineHeight: '1.8', textAlign: 'left' }}>
                {stepLogs.map((log, idx) => (
                  <li key={idx}  style={{ color: '#000', margin: '5px 0' }}>
                    {log}</li>
                ))}
              </ul>
            </div>
            </div>
          </>
        )}
      </div>

      {showDetails && (
        <div style={{ borderLeft: '2px solid #ccc', paddingLeft: '20px',marginTop:'20px' }}>
          <h4 style={{ color: '#6E56CF' }}>Bubble Sort Algorithm</h4>
          <div style={{
              lineHeight: '1.9',
              fontSize: '16px',
              fontFamily: 'monospace',
              textAlign: 'left',
            }}
>
            {algorithmCode.map((line, idx) => (
              <pre
                key={idx}
                style={{
                  backgroundColor: highlightedLine === idx + 1 ? '#a2a4cc' : 'transparent',
                  border: highlightedLine === idx + 1 ? '2px solid #ff9900' : 'none',
                  padding: highlightedLine === idx + 1 ? '5px' : '0',
                  borderRadius: '5px',
                  margin: 0,
                }}
              >
                {line}
              </pre>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SortingComponent;


//without pause/resume
// import React, { useState, useEffect, useRef } from 'react';
// import { motion } from 'framer-motion';

// const SortingComponent = ({ linkedList, setLinkedList, setIsSorting }) => {
//   const [originalList, setOriginalList] = useState(null);
//   const [currentMessage, setCurrentMessage] = useState('');
//   const [highlightedNodes, setHighlightedNodes] = useState([]);
//   const [highlightedLine, setHighlightedLine] = useState(null);
//   const [sorting, setSorting] = useState(false);
//   const [stepLogs, setStepLogs] = useState([]);
//   const [showDetails, setShowDetails] = useState(false);
//   const [swappingNodes, setSwappingNodes] = useState([]);
//   const [speedMs, setSpeedMs] = useState(700); // Speed in ms (default 700ms delay)
//   const stepLogsRef = useRef(null);

//   const getDelay = () => speedMs;

//   const delay = (ms) =>
//     new Promise((resolve) => setTimeout(resolve, ms || getDelay()));

//   const algorithmCode = [
//     'function bubbleSortLinkedList(head) {',
//     '  if (!head || !head.next) return head;',
//     '  let swapped;',
//     '  do {',
//     '    swapped = false;',
//     '    let current = head;',
//     '    let prev = null;',
//     '    while (current && current.next) {',
//     '      if (current.value > current.next.value) {',
//     '        const temp = current.next;',
//     '        current.next = temp.next;',
//     '        temp.next = current;',
//     '        if (prev) {',
//     '          prev.next = temp;',
//     '        } else {',
//     '          head = temp;',
//     '        }',
//     '        swapped = true;',
//     '        prev = temp;',
//     '      } else {',
//     '        prev = current;',
//     '        current = current.next;',
//     '      }',
//     '    }',
//     '  } while (swapped);',
//     '  return head;',
//     '}',
//   ];

//   const bubbleSortLinkedList = async (head) => {
//     if (!head || !head.next) return head;

//     let swapped;
//     let iteration = 0;

//     do {
//       swapped = false;
//       let current = head;
//       let prev = null;

//       while (current && current.next) {
//         setHighlightedNodes([current, current.next]);
//         setCurrentMessage(`Comparing ${current.value} and ${current.next.value}`);
//         setHighlightedLine(8);
//         setStepLogs((prevLogs) => [
//           ...prevLogs,
//           `Comparing ${current.value} and ${current.next.value}`,
//         ]);
//         await delay();

//         if (parseFloat(current.value) > parseFloat(current.next.value)) {
//           setSwappingNodes([current, current.next]);
//           setCurrentMessage(`Swapping ${current.value} and ${current.next.value}`);
//           setHighlightedLine(10);
//           setStepLogs((prevLogs) => [
//             ...prevLogs,
//             `Preparing to swap ${current.value} and ${current.next.value}`,
//           ]);
//           await delay();

//           const temp = current.next;
//           current.next = temp.next;
//           temp.next = current;

//           if (prev) {
//             prev.next = temp;
//           } else {
//             head = temp;
//           }

//           swapped = true;
//           setLinkedList({ ...head });
//           setStepLogs((prevLogs) => [
//             ...prevLogs,
//             `Swapped: ${temp.value} <-> ${current.value}`,
//           ]);
//           setCurrentMessage(`Swapped ${temp.value} and ${current.value}`);
//           await delay();

//           setSwappingNodes([]);
//           prev = temp;
//           setStepLogs((prevLogs) => [...prevLogs, `Moved prev -> ${temp.value}`]);
//         } else {
//           prev = current;
//           current = current.next;
//           setStepLogs((prevLogs) => [
//             ...prevLogs,
//             `Moved current -> ${current ? current.value : 'null'}`,
//           ]);
//         }
//       }

//       iteration++;
//       setStepLogs((prevLogs) => [...prevLogs, `End of iteration ${iteration}`]);
//     } while (swapped);

//     setHighlightedNodes([]);
//     setCurrentMessage(`Sorting completed in ${iteration} iterations.`);
//     setStepLogs((prevLogs) => [...prevLogs, `Sorting completed.`]);
//     setHighlightedLine(null);
//     return head;
//   };

//   const cloneList = (head) => {
//     if (!head) return null;
//     const newHead = { value: head.value, next: null };
//     let currentNew = newHead;
//     let currentOld = head.next;
//     while (currentOld) {
//       currentNew.next = { value: currentOld.value, next: null };
//       currentNew = currentNew.next;
//       currentOld = currentOld.next;
//     }
//     return newHead;
//   };

//   useEffect(() => {
//     if (linkedList && !originalList) {
//       setOriginalList(cloneList(linkedList));
//     }
//   }, [linkedList, originalList]);

//   const handleSort = async () => {
//     setSorting(true);
//     setShowDetails(true);
//     setStepLogs([]);
//     const sortedHead = await bubbleSortLinkedList(linkedList);
//     setLinkedList(sortedHead);
//     setSorting(false);
//   };

//   const isHighlightedLink = (current, next) => {
//     return (
//       highlightedNodes.includes(current) &&
//       highlightedNodes.includes(next)
//     );
//   };

//   const handleReset = () => {
//     if (!originalList) return;
//     setLinkedList(cloneList(originalList));
//     setHighlightedNodes([]);
//     setSwappingNodes([]);
//     setCurrentMessage('');
//     setHighlightedLine(null);
//     setStepLogs([]);
//     setShowDetails(false);
//   };

//   const renderLinkedList = () => {
//     const nodes = [];
//     let currentNode = linkedList;
//     while (currentNode) {
//       nodes.push(currentNode);
//       currentNode = currentNode.next;
//     }

//     return nodes.map((node, index) => {
//       const isHighlighted = highlightedNodes.includes(node);
//       const isSwapping = swappingNodes.includes(node);

//       return (
//         <motion.div
//           key={node.value}
//           layout
//           transition={{ type: 'spring', stiffness: 200, damping: 30 }}
//           style={{
//             display: 'flex',
//             alignItems: 'center',
//             marginRight: '10px',
//             zIndex: isSwapping ? 1 : 0,
//           }}
//         >
//           <div
//             className="linkedlist-node"
//             style={{
//               backgroundColor: isHighlighted ? '#a2a4cc' : '#7b73eb',
//               border: isHighlighted ? '1px solid #ff9900' : 'none',
//               padding: '10px 20px',
//               borderRadius: '10px',
//               color: 'white',
//               fontWeight: 'bold',
//               fontSize: '18px',
//               position: 'relative',
//             }}
//           >
//             {node.value}
//             {index === 0 && <div className='head-indicator'>H</div>}
//             {node.next === null && <div className='tail-indicator'>T</div>}
//           </div>
//           {node.next && (
//             <div
//               style={{
//                 width: '50px',
//                 height: '2px',
//                 backgroundColor: isHighlightedLink(node, node.next)
//                   ? '#ff9900'
//                   : '#6E57CF',
//                 margin: '0 10px',
//                 transition: 'background-color 0.3s ease',
//               }}
//             ></div>
//           )}
//         </motion.div>
//       );
//     });
//   };

//   useEffect(() => {
//     if (stepLogsRef.current) {
//       stepLogsRef.current.scrollTop = stepLogsRef.current.scrollHeight;
//     }
//   }, [stepLogs]);

//   return (
//     <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
//       <div>
//         <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center' }}>
//           <button
//             className="startbtn text-white fw-bold"
//             style={{ color: '#7b73eb' }}
//             onClick={handleSort}
//             disabled={sorting}
//           >
//             Start Sorting
//           </button>
//           <button
//             className="restartbtn text-white fw-bold"
//             style={{ color: '#7b73eb', marginLeft: '10px' }}
//             onClick={handleReset}
//             disabled={sorting}
//           >
//             Reset
//           </button>

//           <div style={{ marginLeft: '20px', display: 'flex', alignItems: 'center' }}>
//             <label htmlFor="speedSlider" style={{ marginRight: '10px', fontWeight: 'bold' }}>
//               Speed:
//             </label>
//             <input
//               id="speedSlider"
//               type="range"
//               min="100"
//               max="2000"
//               step="100"
//               value={speedMs}
//               onChange={(e) => setSpeedMs(Number(e.target.value))}
//               disabled={sorting}
//               style={{
//                 appearance: 'none',
//                 width: '100px',
//                 height: '6px',
//                 background: '#e0dfff',
//                 borderRadius: '5px',
//                 outline: 'none',
//                 opacity: sorting ? 0.5 : 1,
//                 transition: 'opacity 0.3s',
//                 cursor: sorting ? 'not-allowed' : 'pointer',
//               }}
//             />
//             <span style={{ marginLeft: '10px', fontWeight: 'bold', color: '#6E56CF' }}>
//               {speedMs} ms
//             </span>
//           </div>

//         </div>

//         <div style={{ display: 'flex', alignItems: 'center', marginTop: '30px', flexWrap: 'wrap' }}>
//           {renderLinkedList()}
//         </div>

//         {showDetails && (
//           <>
//             <div className="messages" style={{ marginTop: '20px' }}>
//               <p style={{ color: '#6E56CF', fontWeight: 'bold' }}>{currentMessage}</p>
//             </div>
//             <div className="step-logs" style={{ marginTop: '20px' }}>
//               <div
//                 ref={stepLogsRef}
//                 style={{
//                   height: '300px',
//                   overflowY: 'scroll',
//                   border: '1px solid #ccc',
//                   borderRadius: '5px',
//                   backgroundColor: '#f9f9f9',
//                   padding: '10px',
//                 }}
//               >
//                 <h5 style={{ color: '#6E56CF' }}>Steps Log:</h5>
//                 <ul style={{ listStyle: 'initial', lineHeight: '1.8', textAlign: 'left' }}>
//                   {stepLogs.map((log, index) => (
//                     <li key={index} style={{ color: '#000', margin: '5px 0' }}>
//                       {log}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             </div>
//           </>
//         )}
//       </div>

//       {showDetails && (
//         <div style={{ borderLeft: '2px solid #ccc', paddingLeft: '20px', marginTop: '40px' }}>
//           <h4 style={{ color: '#6E56CF' }}>Bubble Sort Algorithm</h4>
//           <div
//             style={{
//               lineHeight: '1.9',
//               fontSize: '16px',
//               fontFamily: 'monospace',
//               textAlign: 'left',
//             }}
//           >
//             {algorithmCode.map((line, index) => (
//               <pre
//                 key={index}
//                 style={{
//                   backgroundColor: highlightedLine === index + 1 ? '#a2a4cc' : 'transparent',
//                   fontWeight: highlightedLine === index + 1 ? 'bold' : 'normal',
//                   padding: highlightedLine === index + 1 ? '5px' : '0',
//                   borderRadius: '5px',
//                   border: highlightedLine === index + 1 ? '2px solid #ff9900' : 'none',
//                   margin: 0,
//                 }}
//               >
//                 {line}
//               </pre>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SortingComponent;



// //swap animation without slider
// import React, { useState, useEffect, useRef } from 'react';
// import { motion } from 'framer-motion';

// const SortingComponent = ({ linkedList, setLinkedList, setIsSorting }) => {
//   const [currentMessage, setCurrentMessage] = useState('');
//   const [highlightedNodes, setHighlightedNodes] = useState([]);
//   const [highlightedLine, setHighlightedLine] = useState(null);
//   const [sorting, setSorting] = useState(false);
//   const [stepLogs, setStepLogs] = useState([]);
//   const [showDetails, setShowDetails] = useState(false);
//   const [swappingNodes, setSwappingNodes] = useState([]);
//   const stepLogsRef = useRef(null);

//   const algorithmCode = [
//     'function bubbleSortLinkedList(head) {',
//     '  if (!head || !head.next) return head;',
//     '  let swapped;',
//     '  do {',
//     '    swapped = false;',
//     '    let current = head;',
//     '    let prev = null;',
//     '    while (current && current.next) {',
//     '      if (current.value > current.next.value) {',
//     '        const temp = current.next;',
//     '        current.next = temp.next;',
//     '        temp.next = current;',
//     '        if (prev) {',
//     '          prev.next = temp;',
//     '        } else {',
//     '          head = temp;',
//     '        }',
//     '        swapped = true;',
//     '        prev = temp;',
//     '      } else {',
//     '        prev = current;',
//     '        current = current.next;',
//     '      }',
//     '    }',
//     '  } while (swapped);',
//     '  return head;',
//     '}',
//   ];

//   const bubbleSortLinkedList = async (head) => {
//     if (!head || !head.next) return head;

//     let swapped;
//     let iteration = 0;

//     do {
//       swapped = false;
//       let current = head;
//       let prev = null;

//       while (current && current.next) {
//         setHighlightedNodes([current, current.next]);
//         setCurrentMessage(`Comparing ${current.value} and ${current.next.value}`);
//         setHighlightedLine(8);
//         setStepLogs((prevLogs) => [...prevLogs, `Comparing ${current.value} and ${current.next.value}`]);
//         await new Promise((resolve) => setTimeout(resolve, 700));

//         if (parseFloat(current.value) > parseFloat(current.next.value)) {
//           setSwappingNodes([current, current.next]);
//           setCurrentMessage(`Swapping ${current.value} and ${current.next.value}`);
//           setHighlightedLine(10);
//           setStepLogs((prevLogs) => [...prevLogs, `Preparing to swap ${current.value} and ${current.next.value}`]);
//           await new Promise((resolve) => setTimeout(resolve, 700));

//           const temp = current.next;
//           current.next = temp.next;
//           temp.next = current;

//           if (prev) {
//             prev.next = temp;
//           } else {
//             head = temp;
//           }

//           swapped = true;
//           setLinkedList({ ...head });
//           setStepLogs((prevLogs) => [...prevLogs, `Swapped: ${temp.value} <-> ${current.value}`]);
//           setCurrentMessage(`Swapped ${temp.value} and ${current.value}`);
//           await new Promise((resolve) => setTimeout(resolve, 700));

//           setSwappingNodes([]);
//           prev = temp;
//           setStepLogs((prevLogs) => [...prevLogs, `Moved prev -> ${temp.value}`]);
//         } else {
//           prev = current;
//           current = current.next;
//           setStepLogs((prevLogs) => [...prevLogs, `Moved current -> ${current ? current.value : 'null'}`]);
//         }
//       }

//       iteration++;
//       setStepLogs((prevLogs) => [...prevLogs, `End of iteration ${iteration}`]);
//     } while (swapped);

//     setHighlightedNodes([]);
//     setCurrentMessage(`Sorting completed in ${iteration} iterations.`);
//     setStepLogs((prevLogs) => [...prevLogs, `Sorting completed.`]);
//     setHighlightedLine(null);
//     return head;
//   };

//   const handleSort = async () => {
//     setSorting(true);
//     setShowDetails(true);
//     setStepLogs([]);
//     const sortedHead = await bubbleSortLinkedList(linkedList);
//     setLinkedList(sortedHead);
//     setSorting(false);
//   };

//   const isHighlightedLink = (current, next) => {
//     return (
//       highlightedNodes.includes(current) &&
//       highlightedNodes.includes(next)
//     );
//   };

//   const renderLinkedList = () => {
//     const nodes = [];
//     let currentNode = linkedList;
//     while (currentNode) {
//       nodes.push(currentNode);
//       currentNode = currentNode.next;
//     }

//     return nodes.map((node, index) => {
//       const isHighlighted = highlightedNodes.includes(node);
//       const isSwapping = swappingNodes.includes(node);

//       return (
//         <motion.div
//           key={node.value}
//           layout
//           transition={{ type: 'spring', stiffness: 200, damping: 30 }}
//           style={{
//             display: 'flex',
//             alignItems: 'center',
//             marginRight: '10px',
//             zIndex: isSwapping ? 1 : 0,
//           }}
//         >
//           <div
//             className="linkedlist-node"
//             style={{
//               backgroundColor: isHighlighted ? '#a2a4cc' : '#7b73eb',
//               border: isHighlighted ? '1px solid #ff9900' : 'none',
//               padding: '10px 20px',
//               borderRadius: '10px',
//               color: 'white',
//               fontWeight: 'bold',
//               fontSize: '18px',
//               position: 'relative',
//             }}
//           >
//             {node.value}
//             {index === 0 && <div className='head-indicator'>H</div>}
//             {node.next === null && <div className='tail-indicator'>T</div>}
//           </div>
//           {node.next && (
//             <div
//               style={{
//                 width: '50px',
//                 height: '2px',
//                 backgroundColor: isHighlightedLink(node, node.next)
//                   ? '#ff9900'
//                   : '#6E57CF',
//                 margin: '0 10px',
//                 transition: 'background-color 0.3s ease',
//               }}
//             ></div>
//           )}
//         </motion.div>
//       );
//     });
//   };

//   useEffect(() => {
//     if (stepLogsRef.current) {
//       stepLogsRef.current.scrollTop = stepLogsRef.current.scrollHeight;
//     }
//   }, [stepLogs]);

//   const handleReset = () => {
//     window.location.reload();
//   };

//   return (
//     <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
//       <div>
//         <div style={{ marginTop: '20px' }}>
//           <button
//             className="btn btn-light fw-bold"
//             style={{ color: '#7b73eb' }}
//             onClick={handleSort}
//             disabled={sorting}
//           >
//             Start Sorting
//           </button>
//           <button
//             className="btn btn-light fw-bold"
//             style={{ color: '#7b73eb', marginLeft: '10px' }}
//             onClick={handleReset}
//             disabled={sorting}
//           >
//             Reset
//           </button>
//         </div>

//         <div
//           style={{
//             display: 'flex',
//             alignItems: 'center',
//             marginTop: '30px',
//             flexWrap: 'wrap',
//           }}
//         >
//           {renderLinkedList()}
//         </div>

//         {showDetails && (
//           <>
//             <div className="messages" style={{ marginTop: '20px' }}>
//               <p style={{ color: '#6E56CF', fontWeight: 'bold' }}>{currentMessage}</p>
//             </div>
//             <div className="step-logs" style={{ marginTop: '20px' }}>
//               <div
//                 ref={stepLogsRef}
//                 style={{
//                   height: '300px',
//                   overflowY: 'scroll',
//                   border: '1px solid #ccc',
//                   borderRadius: '5px',
//                   backgroundColor: '#f9f9f9',
//                   padding: '10px',
//                 }}
//               >
//                 <h5 style={{ color: '#6E56CF' }}>Steps Log:</h5>
//                 <ul
//                   style={{
//                     listStyle: 'initial',
//                     lineHeight: '1.8',
//                     textAlign: 'left',
//                   }}
//                 >
//                   {stepLogs.map((log, index) => (
//                     <li key={index} style={{ color: '#000', margin: '5px 0' }}>
//                       {log}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             </div>
//           </>
//         )}
//       </div>

//       {showDetails && (
//         <div style={{ borderLeft: '2px solid #ccc', paddingLeft: '20px', marginTop: '40px' }}>
//           <h4 style={{ color: '#6E56CF' }}>Bubble Sort Algorithm</h4>
//           <div
//             style={{
//               lineHeight: '1.9',
//               fontSize: '16px',
//               fontFamily: 'monospace',
//               textAlign: 'left',
//             }}
//           >
//             {algorithmCode.map((line, index) => (
//               <pre
//                 key={index}
//                 style={{
//                   backgroundColor: highlightedLine === index + 1 ? '#a2a4cc' : 'transparent',
//                   fontWeight: highlightedLine === index + 1 ? 'bold' : 'normal',
//                   padding: highlightedLine === index + 1 ? '5px' : '0',
//                   borderRadius: '5px',
//                   border: highlightedLine === index + 1 ? '2px solid #ff9900' : 'none',
//                   margin: 0,
//                 }}
//               >
//                 {line}
//               </pre>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SortingComponent;



//without animation
// import React, { useState, useEffect, useRef, useCallback } from 'react';

// const SortingComponent = ({ linkedList, setLinkedList, setIsSorting }) => {
//   const [currentMessage, setCurrentMessage] = useState('');
//   const [highlightedNodes, setHighlightedNodes] = useState([]);
//   const [highlightedLine, setHighlightedLine] = useState(null);
//   const [sorting, setSorting] = useState(false);
//   const [stepLogs, setStepLogs] = useState([]);
//   const [showDetails, setShowDetails] = useState(false);
//   const stepLogsRef = useRef(null);
//   const [initialLinkedList, setInitialLinkedList] = useState(null);

//   const algorithmCode = [
//     'function bubbleSortLinkedList(head) {',
//     '  if (!head || !head.next) return head;',
//     '  let swapped;',
//     '  do {',
//     '    swapped = false;',
//     '    let current = head;',
//     '    let prev = null;',
//     '    while (current && current.next) {',
//     '      if (current.value > current.next.value) {',
//     '        const temp = current.next;',
//     '        current.next = temp.next;',
//     '        temp.next = current;',
//     '        if (prev) {',
//     '          prev.next = temp;',
//     '        } else {',
//     '          head = temp;',
//     '        }',
//     '        swapped = true;',
//     '        prev = temp;',
//     '      } else {',
//     '        prev = current;',
//     '        current = current.next;',
//     '      }',
//     '    }',
//     '  } while (swapped);',
//     '  return head;',
//     '}',
//   ];

//   const cloneLinkedList = useCallback((head) => {
//     if (!head) return null;
//     const newHead = { ...head };
//     let currentOriginal = head.next;
//     let currentClone = newHead;

//     while (currentOriginal) {
//       currentClone.next = { ...currentOriginal };
//       currentClone = currentClone.next;
//       currentOriginal = currentOriginal.next;
//     }

//     return newHead;
//   }, []);

//   useEffect(() => {
//     if (linkedList) {
//       setInitialLinkedList(cloneLinkedList(linkedList));
//     }
//   }, [linkedList, cloneLinkedList]);

//   const bubbleSortLinkedList = async (head) => {
//     if (!head || !head.next) return head;

//     let swapped;
//     let iteration = 0;

//     do {
//       swapped = false;
//       let current = head;
//       let prev = null;

//       while (current && current.next) {
//         setHighlightedNodes([current, current.next]);
//         setCurrentMessage(`Comparing ${current.value} and ${current.next.value}`);
//         setStepLogs((prevLogs) => [...prevLogs, `Comparing ${current.value} and ${current.next.value}`]);
//         setHighlightedLine(8);

//         await new Promise((resolve) => setTimeout(resolve, 1000));

//         if (compareValues(current.value, current.next.value) > 0) {
//           const temp = current.next;
//           current.next = temp.next;
//           temp.next = current;

//           if (prev) {
//             prev.next = temp;
//             setStepLogs((prevLogs) => [
//               ...prevLogs,
//               `Pointer update: prev.next -> ${temp.value}`,
//             ]);
//           } else {
//             head = temp;
//             setStepLogs((prevLogs) => [...prevLogs, `Head updated: head -> ${temp.value}`]);
//           }

//           swapped = true;
//           setLinkedList({ ...head });

//           setCurrentMessage(`Swapped ${temp.value} and ${current.value}`);
//           setStepLogs((prevLogs) => [...prevLogs, `Swapped nodes: ${temp.value} <-> ${current.value}`]);
//           setHighlightedLine(10);
//           await new Promise((resolve) => setTimeout(resolve, 1000));

//           prev = temp;
//           setStepLogs((prevLogs) => [...prevLogs, `Pointer moved: prev -> ${temp.value}`]);
//         } else {
//           prev = current;
//           current = current.next;
//           setStepLogs((prevLogs) => [
//             ...prevLogs,
//             `Pointer moved: current -> ${current ? current.value : 'null'}`,
//           ]);
//         }
//       }

//       iteration++;
//       setStepLogs((prevLogs) => [...prevLogs, `End of iteration ${iteration}`]);
//     } while (swapped);

//     setHighlightedNodes([]);
//     setCurrentMessage(`Sorting completed in ${iteration} iterations.`);
//     setStepLogs((prevLogs) => [...prevLogs, `Sorting completed in ${iteration} iterations.`]);
//     setHighlightedLine(null);
//     return head;
//   };

//   const handleSort = async () => {
//     setSorting(true);
//     setShowDetails(true);
//     setStepLogs([]);
//     const sortedHead = await bubbleSortLinkedList(linkedList);
//     setLinkedList(sortedHead);
//     setSorting(false);
//   };

//   const compareValues = (a, b) => {
//     const numA = parseFloat(a);
//     const numB = parseFloat(b);

//     const isNumA = !Number.isNaN(numA);
//     const isNumB = !Number.isNaN(numB);

//     // If both are numbers, compare numerically
//     if (isNumA && isNumB) {
//       return numA - numB;
//     }

//     // Otherwise, compare as strings (alphabets)
//     return String(a).localeCompare(String(b));
//   };

//   const renderLinkedList = () => {
//     const nodes = [];
//     let currentNode = linkedList;

//     while (currentNode) {
//       nodes.push(currentNode);
//       currentNode = currentNode.next;
//     }

//     return nodes.map((node, index) => (
//       <div key={index} style={{ display: 'flex', alignItems: 'center', marginRight: '10px' }}>
//         <div
//         className='linkedlist-node'
//           style={{
//             backgroundColor: highlightedNodes.includes(node) ? '#a2a4cc' : '#7b73eb',
          
//             border: highlightedNodes.includes(node)?'1px solid #ff9900' : 'none',
//           }}
//         >
//           {node.value}

//           {index === 0 && <div className="head-indicator">H</div>}
//           {node.next === null && <div className="tail-indicator">T</div>}
//         </div>
//         {node.next && (
//           <div
//             style={{
//               width: '50px',
//               height: '2px',
//               backgroundColor: '#6E57CF',
//               margin: '0 10px',
//             }}
//           ></div>
//         )}
//       </div>
//     ));
//   };

//   useEffect(() => {
//     if (stepLogsRef.current) {
//       stepLogsRef.current.scrollTop = stepLogsRef.current.scrollHeight;
//     }
//   }, [stepLogs]);

//   // Handler function to reset the linked list
//   const handleReset = () => {
//     window.location.reload();
//   };

//   return (
//     <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
//       <div>
//         <div className="button-container mt-5">
//           <button
//             className="btn btn-light fw-bold"
//             style={{ color: '#7b73eb' }}
//             onClick={handleSort}
//             disabled={sorting}
//           >
//             Start Sorting
//           </button>
//           {/* Reset Button */}
//           <button
//             className="btn btn-light fw-bold"
//             style={{ color: '#7b73eb', marginLeft: '10px' }}
//             onClick={handleReset}
//             disabled={sorting}
//           >
//             Reset
//           </button>
//         </div>
//         <div
//           className="linked-list-container"
//           style={{
//             display: 'flex',
//             alignItems: 'center',
//             marginTop: '30px',
//             flexWrap: 'wrap',
//           }}
//         >
//           {renderLinkedList()}
//         </div>
//         {showDetails && (
//           <>
//             <div className="messages mt-4">
//               <p style={{ color: '#6E56CF', fontWeight: 'bold' }}>{currentMessage}</p>
//             </div>

//             <div className="step-logs mt-4">
//               <div
//                 ref={stepLogsRef}
//                 style={{
//                   height: '300px',
//                   overflowY: 'scroll',
//                   border: '1px solid #ccc',
//                   borderRadius: '5px',
//                   backgroundColor: '#f9f9f9',
//                 }}
//               > <h5 style={{ color: '#6E56CF', margin: '17px' }}>Steps Log:</h5>
//                 <ul style={{ listStyle: 'initial', lineHeight: '1.8', textAlign: 'left' }}>
//                   {stepLogs.map((log, index) => (
//                     <li key={index} style={{ color: '#000', margin: '5px 0' }}>
//                       {log}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//       {showDetails && (
//         <div style={{ borderLeft: '2px solid #ccc', paddingLeft: '20px', marginTop: '48px' }}>
//           <h4 style={{ color: '#6E56CF' }}>Bubble Sort Algorithm</h4>
//           <div style={{ lineHeight: '1.9', fontSize: '16px', fontFamily: 'monospace', textAlign: 'left' }}>
//             {algorithmCode.map((line, index) => (
//               <pre
//                 key={index}
//                 style={{
//                   color: highlightedLine === index + 1 ? '#000' : '#000',
//                   fontWeight: highlightedLine === index + 1 ? 'bold' : 'normal',
//                   fontSize: highlightedLine === index + 1 ? '1.0em' : '1em', // Increased size
//                   backgroundColor: highlightedLine === index + 1 ? '#a2a4cc' : 'transparent',
//                   padding: highlightedLine === index + 1 ? '5px' : '0',
//                   borderRadius: '5px',
//                   border: highlightedLine === index + 1 ? '2px solid #ff9900' : 'none',
//                   margin: 0,
//                 }}
//               >
//                 {line}
//               </pre>

//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SortingComponent;


