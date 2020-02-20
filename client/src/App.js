import React from "react";
import "./App.css";
import { Route, Switch, Redirect } from "react-router-dom";
import Auth from "./pages/Auth";
import Events from "./pages/Events";
import Bookings from "./pages/Bookings";
import Navbar from "./components/Navigation/Navbar";

import AuthContext from "./context/auth-context";

class App extends React.Component {
  state = {
    token: null,
    userId: null
  };

  login = (token, userId, tokenExpiration) => {
    this.setState({ token: token, userId: userId });
  };

  logout = () => {
    this.setState({ token: null, userId: null });
  };

  render() {
    return (
      <div className="App">
        <AuthContext.Provider
          value={{
            token: this.state.token,
            userId: this.state.userId,
            login: this.login,
            logout: this.logout
          }}
        >
          <Navbar />
          <Switch>
            {!this.state.token && <Redirect from="/" to="/auth" exact />}
            {!this.state.token && <Redirect from="/bookings" to="/auth" exact />}
            {this.state.token && <Redirect from="/" to="/events" exact />}
            {this.state.token && <Redirect from="/auth" to="/events" exact />}
            {!this.state.token && <Route path="/auth" component={Auth} />}
            <Route path="/events" component={Events} />
            {this.state.token && (
              <Route path="/bookings" component={Bookings} />
            )}
          </Switch>
        </AuthContext.Provider>
      </div>
    );
  }
}
export default App;
