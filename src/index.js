import React from 'react';
import ReactDOM from 'react-dom';
import './index.less';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { BrowserRouter as Router} from 'react-router-dom';

// import vconsole from 'vconsole';
// new vconsole();

ReactDOM.render(
  <Router>
    <App />
  </Router>
  , document.getElementById('root'));
registerServiceWorker();
