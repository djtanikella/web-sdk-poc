import React from "react";
import "./App.scss";

export default function Position(props) {
  const { metric, pointOne, pointTwo } = props;

  return (
    <div className="positionCard">
      <div className="primaryValue">
        {metric.name}: {metric.value}&#176;
      </div>
      <div className="coordinates">
        <div>
          <h2>{pointOne.name}</h2>
          <pre>x: {pointOne.value[0] && pointOne.value[0].toFixed(1)}</pre>
          <pre>y: {pointOne.value[1] && pointOne.value[1].toFixed(1)}</pre>
          <pre>z: {pointOne.value[2] && pointOne.value[2].toFixed(1)}</pre>
        </div>
        <div>
          <h2>{pointTwo.name}</h2>
          <pre>x: {pointTwo.value[0] && pointTwo.value[0].toFixed(1)}</pre>
          <pre>y: {pointTwo.value[1] && pointTwo.value[1].toFixed(1)}</pre>
          <pre>z: {pointTwo.value[2] && pointTwo.value[2].toFixed(1)}</pre>
        </div>
      </div>
    </div>
  );
}
