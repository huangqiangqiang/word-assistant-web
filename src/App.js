import React, { Component } from 'react';
import './App.less';
import Translate from './components/Translate';
import Login from './components/Login';
import WordHistory from './components/WordHistory';
import Detect from './components/Detect';
import { Route, Switch, Redirect } from 'react-router-dom';
import AuthRoute from './utils/AuthRoute';
import { withRouter } from 'react-router-dom';
import NavigationBar from './components/Navigationbar';

const classPrefix = 'App';

class App extends Component {
  render() {
    return (
      <div className={classPrefix}>
        <Switch>
          <AuthRoute exact path="/" component={WordHistory} />
          <Route path="/login" component={Login} />
          <AuthRoute path="/translate" component={Translate} />
          <AuthRoute path="/detect" component={Detect} />
          <Redirect to="/login"/>
        </Switch>
        <NavigationBar />
      </div>
    );
  }
}

export default withRouter(App);
