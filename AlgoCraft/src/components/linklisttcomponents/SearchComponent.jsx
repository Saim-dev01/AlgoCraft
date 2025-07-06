import React, {
  useState, useEffect, forwardRef,
  useImperativeHandle, useRef
} from 'react';
import { motion } from 'framer-motion';

const SearchComponent = forwardRef(({ linkedList, searchQuery, setIsSearching }, ref) => {
  const [searchMessage, setSearchMessage] = useState('');
  const [highlightedNode, setHighlightedNode] = useState(null);
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [currentLine, setCurrentLine] = useState(null);
  const [isCurrentlySearching, setIsCurrentlySearching] = useState(false);
  const [paused, setPaused] = useState(false);
  const [searchSpeed, setSearchSpeed] = useState(1000);
  const [stepLogs, setStepLogs] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [searchTimer, setSearchTimer] = useState(null);

  const scrollableDivRef = useRef(null);
  const searchStep = useRef(null);

  const algorithmLines = [
    'function searchLinkedList(value) {',
    '   let currentNode = head;',
    '   while (currentNode) {',
    '       if (currentNode.value === value) {',
    '           return currentNode;',
    '       }',
    '       currentNode = currentNode.next;',
    '   }',
    '   return null;',
  ];

  const performSearch = (value) => {
    if (isCurrentlySearching || paused) return;

    setIsCurrentlySearching(true);
    setIsSearching(true);
    setPaused(false);
    setVisitedNodes([]);
    setHighlightedNode(null);
    setSearchMessage('');
    setCurrentLine(1);
    setStepLogs([]);

    let current = linkedList;
    const visited = [];
    setCurrentNode(current);

    const step = () => {
      if (current && !paused) {
        setCurrentLine(3);
        visited.push(current);
        setVisitedNodes([...visited]);
        addStepLog(`Visiting node with value: ${current.value}`);

        if (current.value === value) {
          setCurrentLine(4);
          setHighlightedNode(current);
          setSearchMessage(`Found "${value}" in the list.`);
          addStepLog(`Found value "${value}" in the list.`);
          setIsCurrentlySearching(false);
          return;
        } else {
          setSearchMessage(`Visiting node: ${current.value}`);
          setCurrentLine(6);
          addStepLog(`Value "${value}" not found at current node. Moving to the next node.`);
          current = current.next;
          setCurrentNode(current);

          const timer = setTimeout(step, searchSpeed);
          setSearchTimer(timer);
          searchStep.current = step;
        }
      } else if (!current) {
        setCurrentLine(8);
        setSearchMessage(`"${value}" not found in the list.`);
        addStepLog(`Value "${value}" not found in the list.`);
        setIsCurrentlySearching(false);
      }
    };

    setTimeout(() => {
      setCurrentLine(2);
      addStepLog('Initialized currentNode to head.');
      const timer = setTimeout(step, searchSpeed);
      setSearchTimer(timer);
      searchStep.current = step;
    }, searchSpeed);
  };

  const handlePauseResume = () => {
    if (paused) {
      setPaused(false);
      if (searchStep.current) {
        const timer = setTimeout(searchStep.current, searchSpeed);
        setSearchTimer(timer);
      }
    } else {
      clearTimeout(searchTimer);
      setPaused(true);
    }
  };

  const handleStart = () => {
    setSearchMessage('');
    setVisitedNodes([]);
    setIsCurrentlySearching(false);
    setPaused(false);
    performSearch(searchQuery);
  };

  const handleReset = () => {
    clearTimeout(searchTimer);
    setIsCurrentlySearching(false);
    setPaused(false);
    setVisitedNodes([]);
    setHighlightedNode(null);
    setSearchMessage('');
    setStepLogs([]);
    setCurrentLine(null);
    setCurrentNode(null);
    setSearchSpeed(1000);
    searchStep.current = null;
  };

  const addStepLog = (message) => {
    setStepLogs((prevLogs) => [...prevLogs, message]);
  };

  useEffect(() => {
    if (scrollableDivRef.current) {
      scrollableDivRef.current.scrollTop = scrollableDivRef.current.scrollHeight;
    }
  }, [stepLogs]);

  useEffect(() => {
    if (isCurrentlySearching && !paused && searchStep.current) {
      clearTimeout(searchTimer);
      const timer = setTimeout(() => {
        searchStep.current();
      }, searchSpeed);
      setSearchTimer(timer);
    }
  }, [searchSpeed]);

  useImperativeHandle(ref, () => ({
    performSearch,
  }));

  const renderLinkedList = () => {
    let currentNode = linkedList;
    const nodes = [];
    while (currentNode) {
      nodes.push(currentNode);
      currentNode = currentNode.next;
    }
    return nodes;
  };

  const nodeVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'start', gap: '40px', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginTop: '20px' }}>
          <button className='startbtn' onClick={handleStart} disabled={isCurrentlySearching || paused}>Start</button>
          <button className='pausebtn' onClick={handlePauseResume} disabled={!isCurrentlySearching}>
            {paused ? 'Resume' : 'Pause'}
          </button>
          <button className='restartbtn' onClick={handleReset}>Reset</button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="speedSlider" style={{ marginRight: '10px', fontWeight: 'bold' }}>Speed:</label>
         <input
  id="speedSlider"
  type="range"
  min="200"
  max="2000"
  step="100"
  value={searchSpeed}
  onChange={(e) => setSearchSpeed(parseInt(e.target.value))}
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
          <span style={{ marginLeft: '10px', fontWeight: 'bold', color: '#6E56CF' }}>{searchSpeed} ms</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginTop: '10px' }}>
          {renderLinkedList().map((node, index) => {
            const nextNode = renderLinkedList()[index + 1];
            const isLineHighlighted = visitedNodes.includes(node) && nextNode && visitedNodes.includes(nextNode);
            return (
              <motion.div
                key={index}
                variants={nodeVariants}
                initial="hidden"
                animate="visible"
                style={{ display: 'flex', alignItems: 'center', marginRight: '10px' }}
              >
                <div
                  className="linkedlist-node"
                  style={{
                    backgroundColor: node === highlightedNode
                      ? 'rgb(219, 193, 96)'
                      : visitedNodes.includes(node)
                        ? 'rgb(147, 119, 185)'
                        : '#7b73eb',
                    border: node === highlightedNode
                      ? '1px solid rgb(172, 146, 207)'
                      : visitedNodes.includes(node)
                        ? '1px solid rgb(232, 193, 52)'
                        : '#7b73eb',
                    transition: 'background-color 0.3s ease',
                  }}
                >
                  {node.value}
                  {index === 0 && <div className="head-indicator">H</div>}
                  {index === renderLinkedList().length - 1 && <div className="tail-indicator">T</div>}
                </div>
                {index < renderLinkedList().length - 1 && (
                  <div
                    style={{
                      width: '50px',
                      height: '2px',
                      margin: '0 10px',
                      backgroundColor: isLineHighlighted ? '#eec643' : '#6E56CF',
                      transition: 'background-color 0.3s ease',
                    }}
                  ></div>
                )}
              </motion.div>
            );
          })}
        </div>

        <p style={{ marginTop: '25px', color: 'rgb(110, 86, 207)', fontWeight: 'bold' }}>{searchMessage}</p>

        <div
          style={{
            marginTop: '30px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            height: '300px',
            overflowY: 'scroll',
            width: '470px',
          }}
          ref={scrollableDivRef}
        >
          <h5 style={{ color: '#6E56CF', margin: '17px' }}>Steps Log:</h5>
          <ul style={{ listStyle: 'initial', lineHeight: '1.7', textAlign: 'left' }}>
            {stepLogs.map((log, index) => (
              <p key={index} style={{ color: '#000', margin: '9px 0' }}>
                <span style={{ fontSize: '1.2em', fontWeight: 'bold' }}>&bull;</span> {log}
              </p>
            ))}
          </ul>
        </div>
      </div>

      <div className='mt-5'>
        <h3 style={{ color: '#6E56CF' }}>Algorithm</h3>
        <div style={{
          color: 'white',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '16px',
          width: '320px',
          textAlign: 'left',
          fontFamily: 'monospace'
        }}>
          {algorithmLines.map((line, index) => (
            <div
              key={index}
              style={{
                backgroundColor: index === currentLine ? 'rgb(162, 164, 204)' : 'transparent',
                color: index === currentLine ? 'black' : 'black',
                border: index === currentLine ? '2px solid #ff9900' : 'none',
                fontWeight: index === currentLine ? 'bold' : 'normal',
                fontSize: index === currentLine ? '1.0em' : '1em',
                padding: index === currentLine ? '5px' : '1',
                borderRadius: '5px',
              }}
            >
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default SearchComponent;

