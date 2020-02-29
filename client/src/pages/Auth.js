import React, { Component } from "react";
import axios from "axios";
import AuthContext from "../context/auth-context";

export class Auth extends Component {
  state = {
    email: "",
    password: "",
    isLogin: true
  };

  static contextType = AuthContext;

  handleChange = e => {
    this.setState({
      [e.target.id]: e.target.value
    });
  };

  submitHandler = e => {
    e.preventDefault();
    const { email, password } = this.state;

    if (email.trim().length === 0 || password.trim().length === 0) {
      return;
    }
    //console.log(this.state.email);

    let requestBody = {
      query: `
            query{
                login(email: "${this.state.email}", password: "${this.state.password}"){
                    userId
                    token
                    tokenExpiration
                }
            }
        `
    };

    if (!this.state.isLogin) {
      requestBody = {
        query: `
              mutation{
                  createUser(userInput: {email: "${this.state.email}", password: "${this.state.password}"}){
                        _id
                         email
                }
            }
         `
      };
    }

    axios
      .post("http://localhost:5000/graphql", requestBody)
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Failed!");
        }
        return res.data;
      })
      .then(resData => {
        if (resData.data.login.token) {
          this.context.login(
            resData.data.login.token,
            resData.data.login.userId,
            resData.data.login.tokenExpiration
          );
        }
      });
  };

  switchModeHandler = () => {
    this.setState(prevState => {
      return { isLogin: !prevState.isLogin };
    });
  };

  render() {
    return (
      <React.Fragment>
        <div className="area">
          <ul className="circles">
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
          </ul>
          <div className="form-wrapper">
            <form className="auth-form" onSubmit={this.submitHandler}>
              <div className="form-control">
                <label htmlFor="email">E-mail</label>
                <input
                  type="email"
                  id="email"
                  onChange={this.handleChange}
                  placeholder="example@test.com"
                />
              </div>
              <div className="form-control">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  onChange={this.handleChange}
                  placeholder="******"
                />
              </div>
              <div className="form-actions">
                <button type="submit">Submit</button>
                <button type="button" onClick={this.switchModeHandler}>
                  Switch to {this.state.isLogin ? "Signup" : "Login"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default Auth;
