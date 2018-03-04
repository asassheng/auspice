import React from "react";
import { select } from "d3-selection";

class Tangle extends React.Component {
  constructor(props) {
    super(props);
    this.state = {left: 0, top: 25, lookup: undefined, drawn: false};
    this.timeout = false;
  }
  shouldComponentUpdate(nextProps) {
    return (this.props.width !== nextProps.width || this.props.height !== nextProps.height);
  }
  drawLines(props) {
    if (!props) props = this.props; // eslint-disable-line
    select(this.d3ref).selectAll(".tangleLine").remove();

    const makeD = (idxs) => {
      const tip1 = props.leftNodes[idxs[0]].shell;
      const tip2 = props.rightNodes[idxs[1]].shell;
      // console.log("tip1:", tip1.xTip, tip1.yTip)
      // console.log("tip2:", tip2.xTip, tip2.yTip)
      return `M ${tip1.xTip},${tip1.yTip} L ${(props.width + props.spaceBetweenTrees) / 2 + tip2.xTip},${tip2.yTip}`;
    };
    select(this.d3ref)
      .append("g")
      .selectAll(".tangleLine")
      .data(props.lookup)
      .enter()
      .append("path")
      .attr("class", "tangleLine")
      .attr("d", makeD)
      .attr("stroke-width", 0.25)
      .attr("stroke", (idxs) => props.colors[idxs[0]]);
  }
  transitionColors(newColors) {
    select(this.d3ref).selectAll(".tangleLine")
      .transition().duration(500)
      .attr("stroke", (idxs) => newColors[idxs[0]]);
  }
  componentWillReceiveProps(nextProps) {
    if (!this.state.drawn && nextProps.rightNodes[0].shell) {
      this.drawLines(nextProps);
      this.setState({drawn: true});
    } else if (this.props.cVersion !== nextProps.cVersion) {
      this.transitionColors(nextProps.colors);
    } else if (this.props.vVersion !== nextProps.vVersion) {
      this.drawLines(nextProps);
    }
  }

  /* CDU is used to update phylotree when the SVG size _has_ changed (and this is why it's in CDU not CWRP) */
  componentDidUpdate(prevProps) {
    if (this.props.width !== prevProps.width || this.props.height !== prevProps.height) {
      if (this.timeout) {
        window.clearTimeout(this.timeout);
      } else {
        select(this.d3ref).selectAll(".tangleLine").remove();
      }
      this.timeout = window.setTimeout(this.drawLines.bind(this), 1000);
    }
  }
  render() {
    console.log("tangle render");
    return (
      <div style={{position: "absolute", left: this.state.left, top: this.state.top, zIndex: 1000, pointerEvents: "none"}}>
        <svg
          style={{cursor: "default", width: this.props.width, height: this.props.height}}
          ref={(c) => {this.d3ref = c;}}
        />
      </div>
    );
  }
}

export default Tangle;
