import React from 'react';
import ReactDOM from 'react-dom';
import './index.less';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import {
  // BrowserRouter as Router, 
  HashRouter as Router, 
} from 'react-router-dom';
// import vconsole from 'vconsole';

// (process.env.REACT_APP_IS_PRODUCTION !== '1') && new vconsole();

ReactDOM.render(

  <Router
  // basename={`/quickwords`}
  >
  <App />
  </Router>
  
  , document.getElementById('root'));
registerServiceWorker();
