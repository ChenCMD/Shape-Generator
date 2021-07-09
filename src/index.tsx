import React from 'react';
import ReactDOM from 'react-dom';
import ShapesGenerator from './components/ShapesGenerator';
import './styles/global.scss';

ReactDOM.render(
  <React.StrictMode>
    <ShapesGenerator />
  </React.StrictMode>,
  document.getElementById('root')
);