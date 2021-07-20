import React from 'react';
import { render } from 'react-dom';
import ParentSize from '@visx/responsive/lib/components/ParentSize';
import { Container } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import App from "./App";
import "./index.scss";

const defaultMargin = { top: 0, left: 120, right: 120, bottom: 20 };

render(
  <Container className="app-container" style={{ height: "560px" }} fluid>
    <ParentSize id="position-element">{({ width, height }) => <App width={width *.95} height={height} margin={defaultMargin} />}</ParentSize>
  </Container>,
  document.getElementById('root'),
);
