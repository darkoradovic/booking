import React, { Component } from "react";
import axios from "axios";
import AuthContext from "../context/auth-context";
import Spinner from "../components/Spinner/Spinner";

export class Bookings extends Component {
  state = {
    isLoading: false,
    bookings: []
  };

  

  static contextType = AuthContext;

  componentDidMount() {
    this.fetchBookings();
  }

  fetchBookings = () => {
    this.setState({ isLoading: true });
    const requestBody = {
      query: `
              query {
                bookings {
                  _id
                  createdAt
                  event{
                      _id
                      title
                      date
                  }
                }
              }
            `
    };

    axios
      .post("http://localhost:5000/graphql", requestBody, {
        headers: { Authorization: "Bearer " + this.context.token }
      })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Failed!");
        }
        return res.data;
      })
      .then(resData => {
        //console.log(resData);
        const bookings = resData.data.bookings;
        this.setState({ bookings: bookings, isLoading: false });
      });
  };

  cancelBooking = (bookingId) => {
    this.setState({ isLoading: true });
    const requestBody = {
      query: `
              mutation CancelBooking($id: ID!) {
                cancelBooking(bookingId: $id) {
                  _id
                  title
                }
              }
            `,
            variables:{
              id: bookingId
            }
    };

    axios
      .post("http://localhost:5000/graphql", requestBody, {
        headers: { Authorization: "Bearer " + this.context.token }
      })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Failed!");
        }
        return res.data;
      })
      .then(resData => {
        //console.log(resData);
        this.setState(prevState => {
            const updatedBookings = prevState.bookings.filter(booking => {
                return booking._id !== bookingId
            })
            return {bookings: updatedBookings, isLoading: false}
        })
      });
  }

  render() {
    return (
      <div className="bookings-wrapper">
        {this.state.isLoading ? (
          <Spinner />
        ) : (
          <ul className="bookings__list">
            {this.state.bookings.map(booking => {
              return (
                <li key={booking._id} className="bookings__item">
                  <div className="bookings__item-data">
                    {booking.event.title} -{" "}
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </div>
                  <div className="bookings__item-actions">
                    <button className="btn" onClick={this.cancelBooking.bind(this, booking._id)}>Cancel</button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }
}

export default Bookings;
