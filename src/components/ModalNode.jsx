import React, { useState } from 'react';
import { Modal, Button } from 'antd';

const ModalNode = (props) => {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <Modal
        title="Modal 1000px width"
        centered
        visible={visible}
        onOk={() => setVisible(false)}
        onCancel={() => setVisible(false)}
        width={1000}
      >
        <p>some contents...</p>
        <p>some contents...</p>
        <p>some contents...</p>
      </Modal>
    </>
  );
};

export default ModalNode;