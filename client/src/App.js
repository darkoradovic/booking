import React from "react";
import "./App.css";
import { Route, Switch, Redirect } from "react-router-dom";
import Auth from "./pages/Auth";
import Events from "./pages/Events";
import Bookings from "./pages/Bookings";
import Navbar from "./components/Navigation/Navbar";

import AuthContext from "./context/auth-context";

import Cookies from 'js-cookie'

class App extends React.Component {
  state = {
    token: null,
    userId: null,
    auth: false
  };

  componentDidMount(){
    this.readCookie()
  }

  login = (token, userId, tokenExpiration) => {
    this.setState({ token: token, userId: userId, auth: true });
    //localStorage.setItem("Token", JSON.stringify(this.state.token));
    Cookies.set("token", token, {expires: 1})
    Cookies.set("userID", userId, {expires: 1})
  };

  logout = () => {
    this.setState({ token: null, userId: null, auth: false });
    //localStorage.removeItem("Token");
    Cookies.remove("token")
    Cookies.remove("userID")
  };

  readCookie = () => {
    const token =  Cookies.get("token");
    const userID = Cookies.get("userID")
    if(token){
      this.setState({auth: true, token: token, userId: userID})
    }
    //console.log(this.state)
  }



  render() {
    //console.log(this.state)
    return (
      <div className="App">
        <AuthContext.Provider
          value={{
            token: this.state.token,
            userId: this.state.userId,
            auth: this.state.auth,
            login: this.login,
            logout: this.logout
          }}
        >
          <Navbar />
          <Switch>
            {!this.state.token && <Redirect from="/" to="/auth" exact />}
            {!this.state.token && (
              <Redirect from="/bookings" to="/auth" exact />
            )}
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
