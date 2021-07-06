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
    type: 'input',
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
    setModalPosition(node.position);
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

  const generateScenarios = () => {
    // console.log(scenarios);
    // console.log(allDictionaries);
    var outputsList = elements.filter((e) => e.type === 'output');
    var connections = elements.filter((el) => el.source !== undefined);

    var maxKey = 1;
    // console.log(outputsList)
    outputsList.forEach((output) => {
      var connectionsByOutput = connections.filter(
        (conn) => conn.target === output.id
      );
      console.log("connectionsByOutput");
      console.log(connectionsByOutput);
      connectionsByOutput.forEach((out) => {
        // var connInitialOutput = connections.filter(
        //   (conn) => conn.target === output.id
        // )[0];
        console.log(out)
        // var initialSource = output.id;
        // if (output.label) {
        //   initialSource = (parseInt(out.id) + 1).toString();
        // }
        var countConn = 0;
        var key = maxKey++;
        let scenarioInitial = {
          key: `${output.id}-${out.source}`,
          source: out.source,
          target: out.target,
          value: output.data.label,
        };
        console.log(scenarioInitial)
        let scenario = {
          key: key,
          description: `Cenário ${key}`,
          scenarios: [
            {
              key: scenarioInitial.key,
              source: scenarioInitial.source,
              target: scenarioInitial.target,
              value: scenarioInitial.value,
              sequence: parseInt(output.id)
            },
          ],
        };
        var scenarioLast = scenarioInitial;
        do {
          var connectionSelected = getConnectionSelected(scenarioLast);
          console.log("connectionSelected")
          console.log(connectionSelected)
          
          var elementSelected = getElementSelected(connectionSelected);
          console.log("elementSelected")
          console.log(elementSelected)
          if (connectionSelected.label) {

            scenarioLast = {
              key: `${scenario.key}-${connectionSelected.source}-${
                connectionSelected.target
              }-${countConn + 1}`,
              source: connectionSelected.source,
              target: connectionSelected.target,
              value: connectionSelected.label,
              sequence: parseInt(connectionSelected.source),
            };
            scenario.scenarios.push(scenarioLast);
            scenarioLast = {
              key: `${scenario.key}-${connectionSelected.source}-${connectionSelected.target}-${countConn}`,
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
          <h2>{element.description}</h2>
          {element.scenarios.map((sce) => {
            return (
              <p id={sce.key} style={{marginLeft: '1%'}}>
                {sce.value}
              </p>
            );
          })}
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
          {scenarios}
        </div>
      </div>
    </div>
  );
};

export default DnDFlow;
