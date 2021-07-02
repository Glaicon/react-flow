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

// const initialScenario = new Array({
//   key: 1,
//   description: 'Cenário 1',
//   scenarios: [
//     {
//       key: '',
//       source: '',
//       target: '',
//       value: '',
//     },
//   ],
// });

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

  const generateScenarios3 = () => {
    setDictionaries([]);
    var outputsList = elements.filter((e) => e.type === 'output');
    var connections = elements.filter((el) => el.source !== undefined);
    var elementsSelecteds = elements.filter((el) => el.source === undefined);

    console.log(outputsList);
    var maxKey = 1;
    outputsList.forEach((out) => {
      var connInitialOutput = connections.filter(
        (conn) => conn.target === out.id
      )[0];
      var initialSource = out.id;
      if (connInitialOutput.label) {
        initialSource = (parseInt(out.id) + 1).toString();
      }
      var countConn = 0;
      var key = maxKey++;
      let scenarioInitial = {
        key: `${out.id}-${countConn}`,
        source: out.id,
        target: out.id,
        value: out.data.label,
      };
      let scenario = {
        key: key,
        description: `Cenário ${key}`,
        scenarios: [
          {
            key: scenarioInitial.key,
            source: initialSource,
            target: scenarioInitial.target,
            value: scenarioInitial.value,
          },
        ],
      };
      console.log(scenario);
      console.log(scenarioInitial);
      var scenarioLast = scenarioInitial;
      do {
        var connectionSelected = connections.filter(
          (conn) => conn.target === scenarioLast.source
        )[0];
        // connections.forEach((conn) =>
        // if (conn.target === s.source) {
        console.log(connectionSelected);
        console.log(connections);

        var elementSelected = elementsSelecteds.filter(
          (c) => c.id === connectionSelected.source
        )[0];
        console.log(elementSelected);
        console.log(elementsSelecteds);
        if (connectionSelected.label) {
          scenarioLast = {
            key: `${connectionSelected.source}-${connectionSelected.target}-${
              countConn + 1
            }`,
            source: connectionSelected.source,
            target: connectionSelected.target,
            value: elementSelected.data.label,
          };
          scenario.scenarios.push(scenarioLast);
          scenarioLast = {
            key: `${connectionSelected.source}-${connectionSelected.target}-${countConn}`,
            source: connectionSelected.source,
            target: connectionSelected.target,
            value: connectionSelected.label,
          };
          scenario.scenarios.push(scenarioLast);
        } else {
          scenarioLast = {
            key: `${connectionSelected.source}-${connectionSelected.target}-${countConn}`,
            source: connectionSelected.source,
            target: connectionSelected.target,
            value: elementSelected.data.label,
          };
          if (scenarioLast.source !== '0') {
            scenario.scenarios.push(scenarioLast);
          }
          countConn++;
        }
      } while (scenarioLast.source !== '0');
      scenario.scenarios.sort((a, b) => a.source - b.source);
      allDictionaries.push(scenario);
      // scenario.scenarios.forEach((s) => {
      //   console.log(s)
      //   var connectionSelected = connections.filter(
      //     (conn) => conn.target === s.target
      //   );
      //   // connections.forEach((conn) =>
      //   // if (conn.target === s.source) {
      //     console.log(connectionSelected)
      //     // console.log(connections)

      //   var elementSelected = elementsSelecteds.filter(
      //     (c) => c.id === connectionSelected.target
      //   );
      //   console.log(elementSelected)
      //   console.log(elementsSelecteds)
      //   if (connectionSelected.label) {
      //     var scen = {
      //       key: `${connectionSelected.source}-${connectionSelected.target}-${countConn}`,
      //       source: connectionSelected.source,
      //       target: connectionSelected.target,
      //       value: connectionSelected.label,
      //     };
      //   } else {
      //     scen = {
      //       key: `${connectionSelected.source}-${connectionSelected.target}-${countConn}`,
      //       source: connectionSelected.source,
      //       target: connectionSelected.target,
      //       value: elementSelected.data.label,
      //     };
      //   }
      //   scenario.scenarios.push(scen);
      //   // }
      //   // });
      //   countConn++;
      // });

      console.log(scenario.scenarios);
      console.log(allDictionaries);
      // allDictionaries.push(scenario);
      setDictionaries(allDictionaries);
    });
    // });
    var listValues = [];
    allDictionaries.forEach((element) => {
      listValues.push(
        <div key={element.key + '-dic'}>
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
    setScenarios(listValues);
  };

  const generateScenarios2 = () => {
    console.log(allDictionaries);
    elements.sort((a, b) => a.source - b.source);
    var connections = elements.filter((el) => el.source !== undefined);
    var elementsSelecteds = elements.filter(
      (el) => el.source === undefined && el.id !== 0
    );
    var countConn = 0;
    connections.forEach((conn) => {
      var elementSelected = elementsSelecteds.filter(
        (c) => c.id === conn.target
      )[0];
      var connection = allDictionaries.filter((c) =>
        c.scenarios.filter((sce) => sce.source === conn.source)
      );
      let keys = allDictionaries.map((a) => a.key);
      var maxKey = Math.max(...keys);
      if (connection) {
        setDictionaries((allDictionaries) =>
          allDictionaries.map((el) => {
            console.log('Connection');
            console.log(connection);
            console.log(el.scenarios);
            var scenarios = el.scenarios.filter(
              (scen) => scen.source !== connection.scenarios[0].source
            );
            if (conn.label) {
              el.key = maxKey++;
              el.description = `Cenário ${el.key}`;
              el.scenarios = {
                ...scenarios,
                key: `${conn.source}-${conn.target}-${countConn}`,
                source: conn.source,
                target: conn.target,
                value: conn.label,
              };
            } else {
              el.key = maxKey++;
              el.description = `Cenário ${el.key}`;
              el.scenarios = {
                ...scenarios,
                key: `${conn.source}-${conn.target}-${countConn}`,
                source: conn.source,
                target: conn.target,
                value: elementSelected.data.label,
              };
            }
            return el;
          })
        );
        // } else {
        //   console.log("ENTROU AQUI")
        //   setDictionaries((dicts) =>
        //     dicts.dictionaries.map((el) => {
        //       var dictSelected = el.scenarios.filter(
        //         (sc) => sc.source === conn.source
        //       )[0];
        //       if (conn.label) {
        //         if (dictSelected) {
        //           el.key = dictSelected.key;
        //           el.description = dictSelected.description;
        //           el.scenarios = {
        //             ...el.scenarios,
        //             key: `${conn.source}-${conn.target}-${countConn}`,
        //             source: conn.source,
        //             target: conn.target,
        //             value: conn.label,
        //           };
        //         }
        //       } else {
        //         if (dictSelected) {
        //           el.key = dictSelected.key;
        //           el.description = dictSelected.description;
        //           el.scenarios = {
        //             ...el.scenarios,
        //             key: `${conn.source}-${conn.target}-${countConn}`,
        //             source: conn.source,
        //             target: conn.target,
        //             value: elementSelected.data.label,
        //           };
        //         }
        //       }
        //       return dicts;
        //     })
        //   );
      }
    });
    //   }
    //     var maxKey = Math.max(...allDictionaries.dictionaries.keys);
    //    allDictionaries.dictionaries.push({
    //     key: maxKey++,
    //     description: `Cenário ${key}`,
    //     scenarios: [
    //       ...scenarios,{
    //         key: `${conn.source}-${conn.target}-${countConn}`,
    //         source: conn.source,
    //         target: conn.target,
    //         value: elementSelected.data.label,
    //       },
    //     ]
    //    })
    //    setDictionaries(allDictionaries);
    //   } else {
    //     var elementSelected = elementsSelecteds.filter(
    //       (el) => el.id === conn.target
    //     )[0];
    //     console.log(elementSelected);
    //     if (conn.label) {
    //       var key = "";
    //       if (
    //         dictScenarios.filter(
    //           (a) => a.key === `${conn.source}-${conn.target}-${countConn}`
    //         )
    //       ) {
    //         key = `${conn.source}-${conn.target}-${countConn + 1}`;
    //       } else {
    //         key = `${conn.source}-${conn.target}-${countConn}`;
    //       }
    //       dictScenarios.push({
    //         key: key,
    //         source: conn.source,
    //         target: conn.target,
    //         value: conn.label,
    //       });
    //     }
    //     dictScenarios.push({
    //       key: `${conn.source}-${conn.target}-${countConn}`,
    //       source: conn.source,
    //       target: conn.target,
    //       value: elementSelected.data.label,
    //       lastNode: elementSelected.type === "output",
    //     });
    //   }
    // });
    var listValues = [];
    allDictionaries.forEach((element) => {
      listValues.push(
        <>
          <h2>{element.description}</h2>
          {element.scenarios.forEach((sce) => {
            return (
              <p id={sce.key} style={{marginLeft: '1%'}}>
                {sce.value}
              </p>
            );
          })}
          ;
        </>
      );
    });
    setScenarios(listValues);

    console.log(allDictionaries);
    console.log(connections);
    console.log(elements);
  };

  const createDictionary = () => {};
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
                key = `${c.source}-${c.target}-${countConn}`;
              } else {
                key = `${c.source}-${c.target}-${countConn + 1}`;
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
    console.log(elements);
    elements.forEach((el) => {
      if (el.id && el.source === undefined) {
        console.log(el.id);
        ids.push(parseInt(el.id));
      }
    });
    console.log(ids);
    var lastId = Math.max(...ids);
    console.log(lastId);
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
          <Button style={{margin: '10px'}} onClick={() => generateScenarios3()}>
            Gerar Cenários
          </Button>
          {scenarios}
        </div>
      </div>
    </div>
  );
};

export default DnDFlow;
