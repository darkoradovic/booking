import React, { Component } from "react";
import Modal from "../components/Modal/Modal";
import Backdrop from "../components/Backdrop/Backdrop";
import axios from "axios";
import AuthContext from "../context/auth-context";
import Spinner from "../components/Spinner/Spinner";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


toast.configure({autoClose: 6000})

export class Events extends Component {
  state = {
    creating: false,
    title: "",
    price: "",
    date: "",
    description: "",
    events: [],
    isLoading: false,
    selectedEvent: null
  };

  isActive = true;

  static contextType = AuthContext;

  componentDidMount() {
    this.fetchEvents();
  }



  handleChange = e => {
    this.setState({
      [e.target.id]: e.target.value
    });
  };

  createEventHandler = () => {
    this.setState({
      creating: true
    });
  };

  modalConfirm = () => {
    this.setState({ creating: false });

    const { title, price, description, date } = this.state;

    if (
      title.trim().length === 0 ||
      price <= 0 ||
      date.trim().length === 0 ||
      description.trim().length === 0
    ) {
      return;
    }

    //const event = { title, price, description, date };
    //console.log(event);

    const requestBody = {
      query: `
        mutation {
          createEvent(eventInput: {title: "${title}",description: "${description}",price: ${price},date: "${date}"}){
            _id
            title
            description
            date
            price
          }
        }
      `
    };

    const token = this.context.token;

    axios
      .post("http://localhost:5000/graphql", requestBody, {
        headers: { Authorization: "Bearer " + token }
      })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Failed!");
        }
        return res.data;
      })
      .then(resData => {
        this.setState(prevState => {
          const updatedEvents = [...prevState.events];
          updatedEvents.push({
            _id: resData.data.createEvent._id,
            title: resData.data.createEvent.title,
            description: resData.data.createEvent.description,
            date: resData.data.createEvent.date,
            price: resData.data.createEvent.price,
            creator: {
              _id: this.context.userId
            }
          });
          return { events: updatedEvents };
         
        });
      });
  };

  notify = () => {
    toast.success("Event Added :)", {
      position: toast.POSITION.TOP_RIGHT
    });
  }

  modalCancel = () => {
    this.setState({ creating: false, selectedEvent: null });
  };

  fetchEvents = () => {
    this.setState({ isLoading: true });
    const requestBody = {
      query: `
        query {
          events {
            _id
            title
            description
            date
            price
            creator{
              _id
              email
            }
          }
        }
      `
    };

    axios
      .post("http://localhost:5000/graphql", requestBody)
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Failed!");
        }
        return res.data;
      })
      .then(resData => {
        //console.log(resData);
        const events = resData.data.events;
        if (this.isActive) {
          this.setState({ events: events, isLoading: false });
        }
      });
  };

  showDetailHandler = eventId => {
    this.setState(prevState => {
      const selectedEvent = prevState.events.find(e => e._id === eventId);
      return { selectedEvent: selectedEvent };
    });
  };

  bookEventHandler = () => {
    if (!this.context.token) {
      this.setState({ selectedEvent: null });
      return;
    }
    const requestBody = {
      query: `
        mutation {
          bookEvent(eventId: "${this.state.selectedEvent._id}") {
            _id
            createdAt
            updatedAt
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
        console.log(resData);
        this.setState({ selectedEvent: null });
        /* const events = resData.data.events;
        this.setState({ events: events, isLoading: false }); */
      });
  };

  componentWillUnmount() {
    this.isActive = false;
  }

  render() {

    const num = Math.floor(Math.random() * 5000) + 1;;
    const imageUrl = `https://api.adorable.io/avatars/${num}`

    const eventsList = this.state.events.map(event => {
      return (
        <div key={event._id} className="wrap">
          <li className="event-post">
            <div className="event-post__img">
               <img src={imageUrl} alt=".." /> 
            </div>
            <div className="event-post__info">
              <div>
                <h1 className="event-post__title">{event.title}</h1>
                <div className="event-post__date">
                  <span>€ {event.price}</span>
                  <span>{new Date(event.date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </li>
          <div className="info-btn">
            {this.context.userId === event.creator._id ? (
              <p>You are the owner</p>
            ) : (
              <button
                className="event-post__cta"
                onClick={this.showDetailHandler.bind(this, event._id)} //bind da bi smo povezali taj event sa otvorenim u modalu
              >
                View Details
              </button>
            )}
          </div>
        </div>
      );
    });

    return (
      <React.Fragment>
        {(this.state.creating || this.state.selectedEvent) && <Backdrop />}
        {this.state.creating && (
          <Modal
            title="Add Event"
            canCancel={true}
            canConfirm={true}
            onCancel={this.modalCancel}
            onConfirm={this.modalConfirm}
            onNotify={this.notify}
            confirmText="Confirm"
          >
            <form>
              <div className="form-control-modal">
                <label htmlFor="title">Title</label>
                <input type="text" id="title" onChange={this.handleChange} />
              </div>
              <div className="form-control-modal">
                <label htmlFor="price">Price</label>
                <input type="number" id="price" onChange={this.handleChange} />
              </div>
              <div className="form-control-modal">
                <label htmlFor="date">Date</label>
                <input
                  type="datetime-local"
                  id="date"
                  onChange={this.handleChange}
                />
              </div>
              <div className="form-control-modal">
                <label htmlFor="description">Description</label>
                <textarea
                  rows="4"
                  id="description"
                  onChange={this.handleChange}
                />
              </div>
            </form>
          </Modal>
        )}
        {this.state.selectedEvent && (
          <Modal
            title={this.state.selectedEvent.title}
            canCancel={true}
            canConfirm={true}
            onCancel={this.modalCancel}
            onConfirm={this.bookEventHandler}
            confirmText={this.context.token ? "Book" : "Confirm"}
          >
            <h1>{this.state.selectedEvent.title}</h1>
            <h2>
              € {this.state.selectedEvent.price} -{" "}
              {new Date(this.state.selectedEvent.date).toLocaleDateString()}
            </h2>
            <p>{this.state.selectedEvent.description}</p>
          </Modal>
        )}
        {this.context.token && (
          <div className="events-wrapper">
            <p>Share your own events</p>
            <button className="btn" onClick={this.createEventHandler}>
              Create event
            </button>
          </div>
        )}
        {this.state.isLoading ? (
          <Spinner />
        ) : (
          <ul className="events__list">{eventsList}</ul>
        )}
        {/* <button onClick={this.notify}>Click me</button> */}
      </React.Fragment>
    );
  }
}

export default Events;
