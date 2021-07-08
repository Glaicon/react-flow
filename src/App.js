import logo from './logo.svg';
// import './App.css';
// import ReactFlow2 from './components/React-flow'
import ReactFlow from './components/React-flow2'
import Provider from './components/Provider'
import Inital from './components/Initial'

// you need these styles for React Flow to work properly
// import 'react-flow-renderer/dist/style.css';

// additionally you can load the default theme
// import 'react-flow-renderer/dist/theme-default.css';
import 'antd/dist/antd.css';

function App() {
  return (
    <>
      <ReactFlow/>
      </>
  );
}

export default App;
