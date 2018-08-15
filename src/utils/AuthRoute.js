import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import HttpTool from './HttpTool';

const AuthRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={props =>
        HttpTool.token ? (
          <Component {...props} />
        ) : (
          <Redirect to={{ pathname: "/login", state: { from: props.location } }} />
        )
      }
    />
  );
};


export default AuthRoute;