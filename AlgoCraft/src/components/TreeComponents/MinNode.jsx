import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import '../../style/MinNode.css';
import '../../style/TreeForm.css';

const MinNode = ({ root }) => {
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isFinding, setIsFinding] = useState(false);
  const [highlightedLine, setHighlightedLine] = useState(null);
  const [minNode, setMinNode] = useState(null);
  const [currentHighlightNode, setCurrentHighlightNode] = useState(null);
  const [isLandscape, setIsLandscape] = useState(null);
  const [showAlgorithm, setShowAlgorithm] = useState(false);
  const [ShowSteps, setShowSteps] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null); // Track timeout reference

  const algorithmLines = [
    "function findMin(node) {",
    "  if (node === null) return null;",
    "  while (node.children && node.children[0]) {",
    "    node = node.children[0];",
    "  }",
    "  return node;",
    "}",
  ];

  const handleFindMin = () => {
    if (!root) return;

    setShowAlgorithm(true);
    setShowSteps(true);

    const newSteps = [];
    let currentNode = root;

    newSteps.push({
      text: `Starting at root node: ${currentNode.name}`,
      node: currentNode,
      highlight: 1,
    });

    while (currentNode && currentNode.children && currentNode.children[0]) {
      newSteps.push({
        text: `Traversing left to node: ${currentNode.children[0].name}`,
        node: currentNode.children[0],
        highlight: 3,
      });
      currentNode = currentNode.children[0];
    }

    newSteps.push({
      text: `Minimum node found: ${currentNode.name}`,
      node: currentNode,
      highlight: 5,
    });

    setSteps(newSteps);
    setIsFinding(true);
    setMinNode(currentNode);
    setCurrentHighlightNode(newSteps[0].node);
    setCurrentStep(0);
    setIsPaused(false); // Reset pause state
  };

  const handleClear = () => {
    setSteps([]);
    setCurrentStep(0);
    setIsFinding(false);
    setHighlightedLine(null);
    setMinNode(null);
    setCurrentHighlightNode(null);
    setShowAlgorithm(false);
    setShowSteps(false);
    setIsPaused(false);
    clearTimeout(timerRef.current);
  };

  useEffect(() => {
    const checkOrientation = () => {
      const isLandscapeMode = window.innerWidth > window.innerHeight;
      setIsLandscape(isLandscapeMode);
    };

    checkOrientation();
    window.addEventListener("resize", checkOrientation);

    return () => {
      window.removeEventListener("resize", checkOrientation);
    };
  }, []);

  useEffect(() => {
    if (!isPaused) {
      // if we’ve run out of steps, stop the run
      if (isFinding && currentStep >= steps.length) {
        setIsFinding(false);
        return;
      }
    }
    if (isFinding && !isPaused && currentStep < steps.length) {
      timerRef.current = setTimeout(() => {
        const step = steps[currentStep];
        setHighlightedLine(step.highlight);
        setCurrentHighlightNode(step.node);
        setCurrentStep((prevStep) => prevStep + 1);

      }, speed);
    }

    return () => clearTimeout(timerRef.current);
  }, [isFinding, isPaused, currentStep, steps, speed]);

  const renderTreeD3 = () => {
    d3.select("#tree-container").selectAll("*").remove();
    if (!root) return;

    // Dynamic sizing logic
    function getDepth(node) {
      if (!node.children || node.children.length === 0) return 1;
      return 1 + Math.max(...node.children.map(getDepth));
    }
    function getLeafCount(node) {
      if (!node.children || node.children.length === 0) return 1;
      return node.children.map(getLeafCount).reduce((a, b) => a + b, 0);
    }
    const depth = getDepth(root);
    const leafCount = getLeafCount(root);
    let nodeSpacingX = 90;
    let nodeSpacingY = 100;
    if (leafCount > 10) nodeSpacingX = Math.max(40, 90 - (leafCount - 10) * 3);
    if (depth > 6) nodeSpacingY = Math.max(50, 100 - (depth - 6) * 8);
    const width = Math.max(leafCount * nodeSpacingX, 700);
    const height = Math.max(depth * nodeSpacingY, 400);

    const svg = d3
      .select("#tree-container")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const g = svg.append("g").attr("transform", "translate(100, 20)");
    const treeLayout = d3.tree().size([width - 200, height - 100]);
    const rootNode = d3.hierarchy(root);
    const treeData = treeLayout(rootNode);

    g.selectAll(".link")
      .data(treeData.links())
      .enter()
      .append("line")
      .attr("class", "link")
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y)
      .style("stroke", "#ccc")
      .style("stroke-width", 2);

    const node = g
      .selectAll(".node")
      .data(treeData.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.x},${d.y})`);

    node
      .append("circle")
      .attr("r", 20)
      .style("fill", (d) => {
        if (minNode && d.data === minNode) return "orange";
        if (currentHighlightNode && d.data === currentHighlightNode) return "#A2A4CC";
        return "#634DBA";
      });

    node
      .append("text")
      .attr("dy", 4)
      .attr("x", 0)
      .attr("text-anchor", "middle")
      .style("fill", "#fff")
      .text((d) => d.data.name);
  };

  useEffect(() => {
    renderTreeD3();
  }, [root, minNode, currentHighlightNode]);

  return (
    <div className="bfs-container">
      <h1>Find Minimum Node in Tree</h1>
      <div
        className="bfs-controls"
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
          marginBottom: '1rem',
          width: '68%'      // ← make it span the whole parent
        }}
      >
        <button
          className="btn startbutton px-4"
          onClick={handleFindMin}
          disabled={isFinding}
        >
          {isFinding ? "Finding..." : "Find Min Node"}
        </button>
        <button
          className="btn resetbutton btn-purple px-4"
          onClick={handleClear}
          style={{ marginLeft: '0.5rem' }}
        >
          Reset
        </button>
        <button
          className="btn startbutton px-4"
          onClick={() => setIsPaused((prev) => !prev)}
          disabled={!isFinding || currentStep >= steps.length}
        >
          {isPaused ? "Resume" : "Pause"}
        </button>
      </div>
      <div >
        {minNode && currentStep === steps.length && (
          <div style={{
            textAlign: "center",
            fontSize: "2px",
            color: "red",
            fontWeight: "bold",
            display: 'flex',
            justifyContent: 'center',
            gap: '0.5rem',
            width: '68%'
          }}
          >
            <h5>Minimum Node is:{minNode.name}</h5>
          </div>
        )}
      </div>
      <div className="bfs-main" style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
        <div className="bfs-left" style={{ flex: 1 }}>
          <div
            id="tree-container"
            className="visualization-container"
            style={{
              border: '1px solid #ccc',
              padding: '10px',
              background: '#fff',
              borderRadius: '8px',
              width: '100%', 'height': '100%',
              minHeight: '300px',
              boxSizing: 'border-box'
            }}
          ></div>
        </div>
        <div className="bfs-right algo-sidebar-fixed" style={{ position: 'relative', top: '-36px', width: 300, minWidth: 300, maxWidth: 300, background: '#fff', color: '#222', padding: '18px 12px', borderRadius: '12px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
          <h1 className="clrhead" style={{ fontSize: 22, marginBottom: 12 }}>Algorithm Code</h1>
          <div className="card p-3 pb-2 bfs-card shadow-md" style={{ background: '#fff' }}>
            <pre className="bfs-code" style={{ margin: 0 }}>
              {algorithmLines.map((line, idx) => (
                <div key={idx} className={highlightedLine === idx ? 'highlight' : ''}>
                  {highlightedLine === idx && '→ '}
                  <code>{line}</code>
                </div>
              ))}
            </pre>
          </div>
          <div className="bfs-speed-control ms-3">
            <label htmlFor="speedRange" style={{ marginRight: 8 }}>Speed: {speed} ms</label>
            <input
              id="speedRange"
              type="range"
              min="100"
              max="2000"
              step="100"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
          </div>
        </div>
      </div>
      <div className="steps-container mt-4">
        <h4>Traversal Steps:</h4>
        <ul>
          {steps.slice(0, currentStep).map((step, index) => (
            <li key={index}>
              <p>{step.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MinNode;
