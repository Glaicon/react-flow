import React, { useState, useRef } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  removeElements,
  Controls,
  MiniMap,
  Background,
  updateEdge
} from 'react-flow-renderer';
import { Input, Button, Modal, Collapse } from 'antd';
import SideBar from './Sidebar';

import './index.css';

const { TextArea } = Input;
const { Panel } = Collapse;

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
  const [nodeName, setNodeNameValue] = useState('');
  const [edgeDescription, setEdgeDescription] = useState('');
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [scenarios, setScenarios] = useState(null);
  const [allDictionaries, setDictionaries] = useState([]);
  const [scenariosKey, setScenariosKey] = useState();
  const [painelKeys, setPainelKeys] = useState([1]);
  const [every, setEvery] = useState(false);

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
          el.data = { text: edgeDescription };
          el.label = edgeDescription;
          // el.className = 'normal-edge';
        }
        return el;
      })
    );

    setEdgeDescription('');
    setEdgeInputVisible(false);
  };

  const onEdgeDoubleClick = (edge) => {
    // var node = elements.find((e) => e.id === edge.source);
    setEdgeSelected(edge);
    setEdgeInputVisible(true);
  };

  const onNodeDoubleClick = (node) => {
    setNodeSelected(node);
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

  const callback = (key) => {
    console.log(key);
  }

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
                }-${countConn}`,
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
    var listKeys = [];
    allDictionaries.forEach((element) => {
      // Fills active keys of scenarios.
      listKeys.push(element.key)
      listValues.push(
        <>
          <Panel key={element.key} header={element.description}>
            <ul>
              {element.scenarios.map((sce, index) => {
                var nextIndex = index + 1;
                const nextElement = element.scenarios[nextIndex];
                if (sce.isConnection === undefined) {
                  return (
                    <p id={sce.key}>
                      <li>{nextElement && nextElement.isConnection ? `${sce.value} (${nextElement.value})` : sce.value}</li>
                    </p>
                  );
                }
              })}
            </ul>
          </Panel>
        </>
      );
    });
    // Clean the dictionary.
    setDictionaries([]);
    setScenarios(listValues);
    setPainelKeys(listKeys);
  };
  const onNodeDragStop = (event, node) => console.log('drag stop', node);
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

  const expandAll = () => {
    console.log(scenariosKey)
    setScenariosKey(painelKeys)
    console.log(painelKeys)

  }
  const collapseAll = () => {
    setScenariosKey([])
  }

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
                size={100}
                onConnect={(params) => onConnect(params)}
                onElementsRemove={onElementsRemove}
                onNodeDragStop={onNodeDragStop}
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
              >
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
                    placeholder="Change here..."
                    rows={4}
                    onChange={(event) => setNodeNameValue(event.target.value)}
                  />
                </Modal>
                <Modal title="Egde Description" visible={edgeVisible} centered
                  onOk={() => onEdgeUpdateText()}
                  onCancel={() => closeEdgeInput()}
                >
                  <TextArea
                    id="txt-edge"
                    autoFocus
                    showCount
                    value={edgeDescription}
                    maxLength={60}
                    placeholder="Change here..."
                    rows={4}
                    onChange={(event) => setEdgeDescription(event.target.value)}
                  />
                </Modal>
                <MiniMap />
                <Controls />
                <SideBar />
                <Background />
              </ReactFlow>
            </div>
          </ReactFlowProvider>
          <div className="scenarios__controls">
            <Button style={{ margin: '10px' }} onClick={() => generateScenarios()}>
              Generate Scenarios
            </Button>
            <Button style={{ float: 'right', margin: '10px' }} onClick={(e) => collapseAll()}>
              Collapse All
            </Button>
            <Button style={{ float: 'right', margin: '10px' }} onClick={(e) => expandAll()}>
              Expand All
            </Button>
            <Collapse showArrow onChange={(e) => setScenariosKey(e)}
              activeKey={scenariosKey}
              collapsible
            >
              {scenarios}
            </Collapse>
          </div>
        </div>
      </div>
    </>
  );
};

export default DnDFlow;
