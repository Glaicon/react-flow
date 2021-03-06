import React, { useState, useRef } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  removeElements,
  Controls,
  MiniMap,
  Background,
  updateEdge,
} from 'react-flow-renderer';
import { Input, Button, Modal } from 'antd';
import { IoIosCheckmarkCircle, IoIosCloseCircle } from 'react-icons/io';
import SideBar from './Sidebar';
import CustomEdge from './CustomEdge';
import './index.css';
const { TextArea } = Input;

const initialElements = [
  {
    id: '0',
    type: 'input',
    data: { label: 'Start' },
    position: { x: 250, y: 5 },
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
  const [allDictionaries, setDictionaries] = useState([]);

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
    var node = elements.find((e) => e.id === edge.source);
    setModalPosition(node.position);
    setEdgeSelected(edge);
    setEdgeInputVisible(true);
  };

  const onNodeDoubleClick = (node) => {
    setNodeSelected(node);
    // setModalPosition(nodeSelected.position);
    setTextAreaVisible(true);
    console.log(nodeSelected.position)
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

  const modifyNodePosition = (event, node) => {
    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const position = reactFlowInstance.project({
      x: node.position.x - reactFlowBounds.left,
      y: node.position.y - reactFlowBounds.top,
    });
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
          node.position = el.position;
          setNodeSelected(node);
          setModalPosition(position)
          console.log("modal")
          console.log(modalPosition)
          console.log("Node")
          console.log(position)
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

  const closeEdgeInput = (elementsSelecteds) => {
    // Clear the input area text and set text area visible false.
    setEdgeDescription('');
    setEdgeInputVisible(false);
  };

  const getElementSelected = (connectionSelected) => {
    var elementsSelecteds = elements.filter((el) => el.source === undefined);
    console.log(elementsSelecteds);
    return elementsSelecteds.filter(
      (c) => c.id === connectionSelected.target
    )[0];
  };
  const getConnectionSelected = (scenarioLast) => {
    var connections = elements.filter((el) => el.source !== undefined);
    return connections.filter((conn) => conn.target === scenarioLast.source)[0];
  };
  const getConnection = (nodeId) => {
    var connections = elements.filter((el) => el.source !== undefined);
    return connections.filter((conn) => conn.source === nodeId)[0];
  };

  const generateScenarios = () => {
    var outputsList = elements.filter((e) => e.type === 'output');
    var connections = elements.filter((el) => el.source !== undefined);

    var maxKey = 1;
    outputsList.forEach((output) => {
      var connectionsByOutput = connections.filter(
        (conn) => conn.target === output.id
      );
      console.log('connectionsByOutput');
      console.log(connectionsByOutput);
      connectionsByOutput.forEach((out) => {
        var countConn = 0;
        var key = maxKey++;
        let scenarioInitial = {
          key: `${output.id}-${out.source}`,
          source: out.source,
          target: out.target,
          value: output.data.label,
        };
        let scenario = {
          key: key,
          description: `Cen??rio ${key}`,
          scenarios: [
            {
              key: scenarioInitial.key,
              source: scenarioInitial.source,
              target: scenarioInitial.target,
              value: scenarioInitial.value,
              sequence: parseInt(output.id),
            },
          ],
        };
        var scenarioLast = scenarioInitial;
        do {
          var connectionSelected = getConnectionSelected(scenarioLast);
          var elementSelected = getElementSelected(connectionSelected);
          if (connectionSelected.label) {
            scenarioLast = {
              key: `${scenario.key}-${connectionSelected.source}-${connectionSelected.target
                }-${countConn + 1}`,
              source: connectionSelected.source,
              target: connectionSelected.target,
              value: connectionSelected.label,
              isConnection: true,
              sequence: parseInt(connectionSelected.source),
            };
            scenario.scenarios.push(scenarioLast);
            scenarioLast = {
              key: `${scenario.key}-${connectionSelected.source}-${connectionSelected.target
                }-${countConn + 1}`,
              source: connectionSelected.source,
              target: connectionSelected.target,
              value: elementSelected.data.label,
              sequence: parseInt(connectionSelected.source),
            };
            scenario.scenarios.push(scenarioLast);
          } else {
            scenarioLast = {
              key: `${scenario.key}-${connectionSelected.source}-${connectionSelected.target}-${countConn}`,
              source: connectionSelected.source,
              target: connectionSelected.target,
              value: elementSelected.data.label,
              sequence: parseInt(connectionSelected.source) + 1,
            };
            if (elementSelected.id !== '0') {
              scenario.scenarios.push(scenarioLast);
            }
            countConn++;
          }
        } while (scenarioLast.source !== '0');
        scenario.scenarios.sort((a, b) => a.source - b.source);
        allDictionaries.push(scenario);
        setDictionaries(allDictionaries);
        console.log(allDictionaries);
      });
    });

    // Fills the scenarios in the painel.
    var listValues = [];
    allDictionaries.forEach((element) => {
      listValues.push(
        <div id={'scenario-' + element.key}>
          <h2 style={{ marginLeft: 5 }}>{element.description}</h2>
          <ul>
            {element.scenarios.map((sce, index) => {
              var nextIndex = index + 1;
              const nextElement = element.scenarios[nextIndex];
              console.log(nextElement)
              if (sce.isConnection === undefined) {
                return (
                  <p id={sce.key} style={{ marginLeft: '1%' }}>
                    <li>{nextElement && nextElement.isConnection ? `${sce.value} (${nextElement.value})` : sce.value}</li>
                  </p>
                );
              }
            })}
          </ul>
        </div>
      );
    });
    // Clean the dictionary.
    setDictionaries([]);
    setScenarios(listValues);
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
        ids.push(parseInt(el.id));
      }
    });
    var lastId = Math.max(...ids);
    const newNode = {
      id: `${lastId + 1}`,
      type,
      position,
      data: { label: `${type} node` },
    };

    setElements((es) => es.concat(newNode));
  };

  return (
    <>

      <div className="wrapper">
        <div className="paineltxa">
          <TextArea autoSize placeholder="Escreva aqui..." />
        </div>
        <div className="dndflow">
          <ReactFlowProvider>
            <div className="reactflow-wrapper" ref={reactFlowWrapper}>
              <ReactFlow
                elements={elements}
                size= {100}
                onConnect={onConnect}
                onElementsRemove={onElementsRemove}
                onLoad={onLoad}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onNodeDoubleClick={(event, node) => onNodeDoubleClick(node)}
                onNodeDragStop={(event, node) => {
                  modifyNodePosition(event, node);
                }}
                onEdgeDoubleClick={(event, node) => onEdgeDoubleClick(node)}
                onEdgeUpdate={onEdgeUpdate}
                snapToGrid={true}
                edgeTypes={edgeTypes}
                key="edges"
              >
                {textAreaVisible && (
                  <>
                  <Modal title="Node Description" visible={textAreaVisible} centered
                  onOk={() => modifyTextInputArea()}
                  onCancel={() => closeInputArea()}
                  >                 
                  <TextArea
                      id="txta-node-name"
                      autoFocus
                      showCount
                      value={nodeName}
                      maxLength={200}
                      placeholder="Altere aqui"
                      rows= {4}
                      onChange={(event) => setNodeNameValue(event.target.value)}
                    />
                </Modal>
                    {/* <TextArea
                      id="txta-node-name"
                      autoFocus
                      showCount
                      value={nodeName}
                      maxLength={150}
                      placeholder="Altere aqui"
                      autoSize
                      style={{
                        width:"50%",
                        position: 'absolute',
                        left: "30%",
                        top: "30%",
                        zIndex: 10,
                      }}
                      onChange={(event) => setNodeNameValue(event.target.value)}
                    /> */}
                    {/* <Button
                      type="primary"
                      shape="circle"
                      icon={<IoIosCheckmarkCircle />}
                      style={{
                        position: 'absolute',
                        left: "75.5%",
                        top: "36.5%",
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
                        position: 'absolute',
                        left: "78.5%",
                        top: "36.5%",
                        zIndex: 10,
                      }}
                      onClick={() => closeInputArea()}
                    /> */}
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
                        position: '',
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
            <Button style={{ margin: '10px' }} onClick={() => generateScenarios()}>
              Gerar Cen??rios
            </Button>
            {scenarios}
          </div>
        </div>
      </div>
    </>
  );
};

export default DnDFlow;
