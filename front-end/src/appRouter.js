import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import Profile from './Profile';

const AppRouter = () => {
    return (
        <Router>
            <Switch>
                <Route exact path="/login" component={Login} />
                <Route exact path="/signup" component={Signup} />
                <PrivateRoute exact path="/profile" component={Profile} />
            </Switch>
        </Router>
    );
};

const isAuthenticated = () => {
    // Implementiere hier deine eigene Authentifizierungslogik
    // Überprüfe, ob der Benutzer eingeloggt ist und gib entsprechend true oder false zurück
    return true; // Beispiel: Immer eingeloggt
};

const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route
        {...rest}
        render={(props) =>
            isAuthenticated() ? (
                <Component {...props} />
            ) : (
                <Redirect to="/login" />
            )
        }
    />
);

export default AppRouter;
