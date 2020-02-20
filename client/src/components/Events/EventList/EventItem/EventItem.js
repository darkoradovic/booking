import React from 'react'

const EventItem = (props) => {
    return (
        <li key={props.eventId} className="events__list-item">
          {props.title}
        </li>
    )
}

export default EventItem
