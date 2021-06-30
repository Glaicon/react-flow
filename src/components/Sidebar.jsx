import React from 'react';
import {Tooltip} from 'antd';

const SideBar = (props) => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="sidebar__controls">
      <aside>
        {/* <div className="description">You can drag these nodes to the pane on the right.</div> */}
        <Tooltip placement="right" title={'Input Node'} color={'#0041d0'}>
          <div
            className="dndnode input"
            onDragStart={(event) => onDragStart(event, 'input')}
            draggable
          ></div>
        </Tooltip>
        <Tooltip placement="right" title={'Default Node'}  color={'#1a192b'}>
          <div
            className="dndnode"
            onDragStart={(event) => onDragStart(event, 'default')}
            draggable
          ></div>
        </Tooltip>
        <Tooltip placement="right" title={'Output Node'} color={'#ff0072'}>
          <div
            className="dndnode output"
            onDragStart={(event) => onDragStart(event, 'output')}
            draggable
          ></div>
        </Tooltip>
      </aside>
    </div>
  );
};

export default SideBar;
