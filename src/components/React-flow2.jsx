import React, {useState, useRef} from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  removeElements,
  Controls,
  MiniMap,
  Background,
  updateEdge,
} from 'react-flow-renderer';
import {Input, Button} from 'antd';
import {IoIosCheckmarkCircle, IoIosCloseCircle} from 'react-icons/io';
import SideBar from './Sidebar';
import CustomEdge from './CustomEdge';
import './index.css';
const {TextArea} = Input;

const initialElements = [
  {
    id: '0',
    type: 'selectorNode',
    data: {label: 'Start'},
    position: {x: 250, y: 5},
  },
];

const DnDFlow = () => {
  const [textAreaVisible, setTextAreaVisible] = useState(false);
  const [edgeVisible, setEdgeInputVisible] = useState(false);
  const [nodeSelected, setNodeSelected] = useState({});
  const [edgeSelected, setEdgeSelected] = useState({});
  const [elements, setElements] = useState(initialElements);
  const [modalPosition, setModalPosition] = useState('');
  const [nodeName, setNodeNameValue] = useState('');
  const [edgeDescription, setEdgeDescription] = useState('');
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [scenarios, setScenarios] = useState(null);

  const edgeTypes = {
    custom: CustomEdge,
  };
  const onConnect = (params) => setElements((els) => addEdge(params, els));

  const onElementsRemove = (elementsToRemove) =>
    setElements((els) => removeElements(elementsToRemove, els));

  const onLoad = (_reactFlowInstance) =>
    setReactFlowInstance(_reactFlowInstance);

  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  // gets called after end of edge gets dragged to another source or target.
  const onEdgeUpdate = (oldEdge, newConnection) =>
    setElements((els) => updateEdge(oldEdge, newConnection, els));

  const onEdgeUpdateText = () => {
    setElements((elements) =>
      elements.map((el) => {
        if (el.id === edgeSelected.id) {
          // it's important that you create a new object here
          // in order to notify react flow about the change
          el.label = edgeDescription;
          el.className = 'normal-edge';
        }
        return el;
      })
    );

    setEdgeDescription('');
    setEdgeInputVisible(false);
  };

  const onEdgeDoubleClick = (edge) => {
    console.log(edge);
    var node = elements.find((e) => e.id === edge.source);
    setModalPosition(node.position);
    setEdgeSelected(edge);
    setEdgeInputVisible(true);
  };

  const onNodeDoubleClick = (node) => {
    setModalPosition(node.position);
    console.log(node);
    setNodeSelected(node);
    setTextAreaVisible(true);
  };

  const modifyTextInputArea = () => {
    // Modify name value of de node selected.
    setElements((elements) =>
      elements.map((el) => {
        if (el.id === nodeSelected.id) {
          // it's important that you create a new object here
          // in order to notify react flow about the change
          el.data = {
            ...el.data,
            label: nodeName,
          };
        }

        return el;
      })
    );

    setNodeNameValue('');
    setTextAreaVisible(false);
  };

  const modifyNodePosition = (node) => {
    console.log(node);
    // Modify name value of de node selected.
    setElements((elements) =>
      elements.map((el) => {
        if (el.id === node.id) {
          // it's important that you create a new object here
          // in order to notify react flow about the change
          el.position = {
            ...el.position,
            x: node.position.x,
            y: node.position.y,
          };
          setModalPosition(el.position);
          console.log(el.position);
        }

        return el;
      })
    );

    console.log(elements);
  };

  const closeInputArea = () => {
    // Clear the input area text and set text area visible false.
    setNodeNameValue('');
    setTextAreaVisible(false);
  };

  const closeEdgeInput = () => {
    // Clear the input area text and set text area visible false.
    setEdgeDescription('');
    setEdgeInputVisible(false);
  };

  const generateScenarios = () => {
    var dictScenarios = []; // create an empty array
    elements.sort((a, b) => a.source - b.source);
    var connections = elements.filter((el) => el.source !== undefined);
    var elementsSelecteds = elements.filter((el) => el.source === undefined);
    // Started of first Node, id 0.
    var firstNodeConnection = connections.filter((el) => el.source === '0');
    console.log(firstNodeConnection);
    var countConn = 0;
    elementsSelecteds.forEach((e) => {
      connections.forEach((c) => {
        if (e.id === c.target) {
          if (!dictScenarios.find((e) => e.source === c.source)) {
            if (c.label) {
              var key = '';
              if (
                dictScenarios.filter(
                  (a) => a.key === `${c.source}-${c.target}-${countConn}`
                )
              ) {
                key = `${c.source}-${c.target}-${countConn + 1}`;
              } else {
                key = `${c.source}-${c.target}-${countConn}`;
              }
              dictScenarios.push({
                key: key,
                source: c.source,
                target: c.target,
                value: c.label,
              });
            }
            dictScenarios.push({
              key: `${c.source}-${c.target}-${countConn}`,
              source: c.source,
              target: c.target,
              value: e.data.label,
            });
            countConn++;
          } else {
            var connects = elements.filter((e) => e.source === c.source);
            console.log(connects);
            if (connects) {
              connections = connections.filter((x) => {
                return x.source !== c.source && x.target !== c.target && x.id;
              });
            }
          }
        }
      });
    });
    var listValues = [];
    dictScenarios.forEach((element) => {
      listValues.push(
        <p id={element.key} style={{marginLeft: '1%'}}>
          {element.value}
        </p>
      );
    });

    setScenarios(listValues);

    console.log(dictScenarios);
    console.log(connections);
    console.log(elements);
  };

  const onDrop = (event) => {
    event.preventDefault();

    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const type = event.dataTransfer.getData('application/reactflow');
    const position = reactFlowInstance.project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });
    var ids = [];

    elements.forEach((el) => {
      if (el.id && el.source === undefined) {
        console.log(el.id);
        ids.push(parseInt(el.id));
      }
    });
    var lastId = Math.max(...ids);
    console.log(lastId);
    console.log(lastId++);
    const newNode = {
      id: `${lastId++}`,
      type,
      position,
      data: {label: `${type} node`},
    };

    setElements((es) => es.concat(newNode));
  };

  return (
    <div className="wrapper">
      <div className="dndflow">
        <ReactFlowProvider>
          <div className="reactflow-wrapper" ref={reactFlowWrapper}>
            <ReactFlow
              elements={elements}
              onConnect={onConnect}
              onElementsRemove={onElementsRemove}
              onLoad={onLoad}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeDoubleClick={(event, node) => onNodeDoubleClick(node)}
              onNodeDragStop={(event, node) => {
                modifyNodePosition(node);
              }}
              onEdgeDoubleClick={(event, node) => onEdgeDoubleClick(node)}
              onEdgeUpdate={onEdgeUpdate}
              snapToGrid={true}
              edgeTypes={edgeTypes}
              key="edges"
            >
              {textAreaVisible && (
                <>
                  <TextArea
                    id="txta-node-name"
                    autoFocus
                    showCount
                    value={nodeName}
                    maxLength={100}
                    placeholder="Altere aqui"
                    style={{
                      position: 'absolute',
                      left: `${modalPosition.x}px`,
                      top: `${modalPosition.y}px`,
                      zIndex: 10,
                    }}
                    onChange={(event) => setNodeNameValue(event.target.value)}
                  />
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<IoIosCheckmarkCircle />}
                    style={{
                      position: 'absolute',
                      left: `${modalPosition.x + 205}px`,
                      top: `${modalPosition.y - 5}px`,
                      zIndex: 10,
                      backgroundColor: '#4CAF50',
                    }}
                    onClick={() => modifyTextInputArea()}
                  />
                  <Button
                    type="primary"
                    danger
                    shape="circle"
                    icon={<IoIosCloseCircle />}
                    style={{
                      position: 'absolute',
                      left: `${modalPosition.x + 205}px`,
                      top: `${modalPosition.y + 35}px`,
                      zIndex: 10,
                    }}
                    onClick={() => closeInputArea()}
                  />
                </>
              )}
              {edgeVisible && (
                <>
                  <Input
                    id="txt-edge"
                    autoFocus
                    value={edgeDescription}
                    placeholder="Altere aqui"
                    style={{
                      width: '200px',
                      position: 'absolute',
                      left: `${modalPosition.x}px`,
                      top: `${modalPosition.y + 100}px`,
                      zIndex: 10,
                    }}
                    onChange={(event) => setEdgeDescription(event.target.value)}
                  />
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<IoIosCheckmarkCircle />}
                    style={{
                      position: 'absolute',
                      left: `${modalPosition.x + 205}px`,
                      top: `${modalPosition.y + 100}px`,
                      zIndex: 10,
                      backgroundColor: '#4CAF50',
                    }}
                    onClick={() => onEdgeUpdateText()}
                  />
                  <Button
                    type="primary"
                    danger
                    shape="circle"
                    icon={<IoIosCloseCircle />}
                    style={{
                      position: 'absolute',
                      left: `${modalPosition.x + 240}px`,
                      top: `${modalPosition.y + 100}px`,
                      zIndex: 10,
                    }}
                    onClick={() => closeEdgeInput()}
                  />
                </>
              )}
              <MiniMap />
              <Controls />
              <SideBar />
              <Background />
            </ReactFlow>
          </div>
        </ReactFlowProvider>
        <div className="scenarios__controls">
          <Button style={{margin: '10px'}} onClick={() => generateScenarios()}>
            Gerar Cenários
          </Button>
          <di>{scenarios}</di>
        </div>
      </div>
    </div>
  );
};

export default DnDFlow;
