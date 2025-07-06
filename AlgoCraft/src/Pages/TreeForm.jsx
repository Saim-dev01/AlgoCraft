import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as d3 from 'd3';
import '../style/TreeForm.css';
import '../style/ArrayForm.css';

const TreeForm = () => {
  const [nodeValues, setNodeValues] = useState('');
  const [showTree, setShowTree] = useState(false);
  const [treeData, setTreeData] = useState(null);
  const navigate = useNavigate();

  const handleDefaultValues = () => {
    setNodeValues('50,30,70,20,40,60,80'); // Example BST default values
  };

  const handleShowTree = () => {
    if (nodeValues.trim() === '') {
      alert('Please enter valid node values.');
      return;
    }

    const elements = nodeValues.split(',').map((el) => parseInt(el.trim(), 10));

    // Validate the input
    if (elements.some(isNaN)) {
      alert('Please enter valid numbers.');
      return;
    }

    const tree = buildTreeData(elements);

    if (!tree || !tree.name) {
      alert('Tree could not be generated. Please check your input.');
      return;
    }

    setTreeData(tree); // Update tree data state
    setShowTree(true); // Ensure tree is shown
  };

  const handleSubmit = () => {
    if (nodeValues.trim() === '') {
      alert('Please enter valid node values.');
      return;
    }

    const elements = nodeValues.split(',').map((el) => parseInt(el.trim(), 10));

    // Validate the input
    if (elements.some(isNaN)) {
      alert('Please enter valid numbers.');
      return;
    }

    const tree = buildTreeData(elements);

    // Debugging output to ensure correct tree structure
    console.log(tree);

    // Use navigate to go to TreeVisualization with state
    navigate('/tree-visualization', { state: { treeData: tree } });
  };
  useEffect(() => {
    const handleResize = () => {
      if (treeData) {
        renderTree(treeData);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [treeData]);

  useEffect(() => {
    if (showTree && treeData) {
      renderTree(treeData);
    }
  }, [showTree, treeData]); // Re-run when `showTree` or `treeData` changes
  const renderTree = (data) => {
    // Clear previous tree visualization
    d3.select('#tree-container').selectAll('*').remove();

    if (!data || !data.name) {
      console.error('Invalid tree data:', data);
      return;
    }

    const leafCount = data.children ? data.children.length : 1;
    const depth = (function getDepth(node) {
      if (!node || !node.children || node.children.length === 0) return 1;
      return 1 + Math.max(...node.children.map(getDepth));
    })(data);

    let nodeSpacingX = 90;
    let nodeSpacingY = 100;
    if (leafCount > 10) {
      nodeSpacingX = Math.max(40, 90 - (leafCount - 10) * 3);
    }
    if (depth > 6) {
      nodeSpacingY = Math.max(50, 100 - (depth - 6) * 8);
    }
    const width = Math.max(leafCount * nodeSpacingX, 700);
    const height = Math.max(depth * nodeSpacingY, 400);

    const treeLayout = d3.tree().size([width - 200, height - 100]);
    const root = d3.hierarchy(data);

    const nodes = treeLayout(root);

    // Create the SVG element with dynamic size
    const svg = d3.select('#tree-container')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('display', 'flex')  // Ensures it's rendered properly within the container
      .style('max-width', '100%') // Ensure the width is capped to the container width
      .style('max-height', '100%'); // Ensure the height is capped to the container height

    const g = svg.append('g')
      .attr('transform', 'translate(40,60)');

    // Add links (edges between nodes)
    g.selectAll('.link')
      .data(nodes.links())
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y)
      .style('stroke', '#ccc')
      .style('stroke-width', 2);

    // Add nodes (vertices)
    const node = g.selectAll('.node')
      .data(nodes.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d) => `translate(${d.x},${d.y})`);

    node.append('circle')
      .attr('r', 20)
      .style('fill', '#634DBA');

    node.append('text')
      .attr('dy', 4)
      .attr('text-anchor', 'middle')
      .style('fill', '#fff')
      .text((d) => d.data.name);
  };

  const buildTreeData = (values) => {
    const insertNode = (root, value) => {
      if (!root) return { name: value, left: null, right: null };

      if (value < root.name) {
        root.left = insertNode(root.left, value);
      } else {
        root.right = insertNode(root.right, value);
      }

      return root;
    };

    const convertToD3Format = (node) => {
      if (!node) return null;
      const children = [];
      if (node.left) children.push(convertToD3Format(node.left));
      if (node.right) children.push(convertToD3Format(node.right));

      return { name: node.name, children };
    };

    let tree = null;
    values.forEach(value => {
      tree = insertNode(tree, value);
    });

    return convertToD3Format(tree);
  };

  return (
    <div className="form-array-container d-lg-flex mt-3container">
      <div className="form-section col-lg-6 ps-4 ms-lg-2">
        <h2 className='text-center fw-bold mb-4 mt-4'>Tree Data</h2>
        <div className="form-group">
          <label>Enter Node Values (comma-separated):</label>
          <input
            type="text"
            value={nodeValues}
            onChange={(e) => setNodeValues(e.target.value)}
            placeholder="e.g., 50,30,70,20,40,60,80"
            className="form-control"
          />
        </div>
        <div className="button-group">
          <button className="btn btn-default-values" onClick={handleDefaultValues}>
            Default Values
          </button>
          <button className="btn btn-show-tree" onClick={handleShowTree}>
            Show Tree
          </button>
          <button className="btn btn-submit" onClick={handleSubmit}>
            Submit
          </button>
        </div>
      </div>

      <div className="right-section">
        {showTree && <div>
          <h2 className='text-center fw-bold mb-5'>Initial Visualization</h2>
          <div id="tree-container" className="visualization-container1">
          </div>
        </div>}
      </div>
    </div>
  );
};

export default TreeForm;
