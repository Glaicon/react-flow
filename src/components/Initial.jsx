import React, {useState, useEffect} from 'react';
import ReactFlow from 'react-flow-renderer';
import {Modal, Input, Button, Tooltip} from 'antd';
import {SearchOutlined} from '@ant-design/icons';
import {IoIosCheckmarkCircle, IoIosCloseCircle} from 'react-icons/io';
const {TextArea} = Input;

const elements = [
  {
    id: '1',
    type: 'input', // input node
    data: {label: 'Input Node'},
    position: {x: 250, y: 25},
  },
  // default node
  {
    id: '2',
    // you can also pass a React component as a label
    data: {label: <div>Default Node</div>},
    position: {x: 100, y: 125},
  },
  {
    id: '3',
    type: 'output', // output node
    data: {label: 'Output Node'},
    position: {x: 250, y: 250},
  },
  // animated edge
  {id: 'e1-2', source: '1', target: '2', animated: true},
  {id: 'e2-3', source: '2', target: '3'},
];

const Initial = () => {
  const [textAreaVisible, setTextAreaVisible] = useState(false);
  const [nodeSelected, setNodeSelected] = useState({});
  const [nodes, setNodes] = useState();
  const [modalPosition, setModalPosition] = useState('');
  const [nodeName, setNodeNameValue] = useState('');
  useEffect(() => {
    setNodes(elements);
  }, [nodes, setNodes]);

  const onNodeDoubleClick = (nodeId) => {
    var element = elements.find((e) => e.id === nodeId);
    setModalPosition(element.position);
    console.log(element);
    setNodeSelected(element);
    setTextAreaVisible(true);
  };

  const ModifyTextInputArea = () => {
    // Modify name value of de node selected.
    setNodes((nodes) =>
      nodes.map((el) => {
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
    console.log(nodes);
  };

  const closeInputArea = () => {
    // Clear the input area text and set text area visible false.
    setNodeNameValue('');
    setTextAreaVisible(false);
  };

  return (
    <>
      <ReactFlow
        elements={nodes}
        onNodeDoubleClick={(event) =>
          onNodeDoubleClick(event.currentTarget.dataset.id)
        }
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
                zIndex: 5000,
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
                zIndex: 5000,
                backgroundColor: '#4CAF50',
              }}
              onClick={() => ModifyTextInputArea()}
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
                zIndex: 5000,
              }}
              onClick={() => closeInputArea()}
            />
          </>
        )}
      </ReactFlow>
    </>
  );
};

export default Initial;
