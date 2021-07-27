import Collapse from "@kunukn/react-collapse";
import "./styles.scss";
import Down from "./Down";

  const Block = ({ isOpen, title, onToggle, children, id }) => {
    return (
      <div className="block">
        <button className="btn toggle" onClick="document.getElementById('id1').style.color = 'red'">
          <span>{title}</span>
          <Down isOpen={isOpen} />
        </button>
        <Collapse layoutEffect isOpen={isOpen}>
          {children}
        </Collapse>
      </div>
    );
  }

  export default Block