import React, { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths } from "date-fns";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./styles.css";

const getDaysInMonth = (date) => {
  return eachDayOfInterval({ start: startOfMonth(date), end: endOfMonth(date) });
};

const initialResources = JSON.parse(localStorage.getItem("resources")) || [
  "Resource 1", "Resource 2", "Resource 3", "Resource 4", "Resource 5", "Resource 6", "Resource 7", "Resource 8", "Resource 9"
];
const initialEvents = JSON.parse(localStorage.getItem("events"))?.map(event => ({
  ...event,
  date: new Date(event.date) // Convert string back to Date object
})) || [];

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [resources, setResources] = useState(initialResources);
  const [events, setEvents] = useState(initialEvents);
  const [eventCounter, setEventCounter] = useState(events.length + 1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartDay, setDragStartDay] = useState(null);

  useEffect(() => {
    localStorage.setItem("resources", JSON.stringify(resources));
    localStorage.setItem("events", JSON.stringify(events));
  }, [resources, events]);

  const days = getDaysInMonth(currentMonth);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const updatedEvents = [...events];
    const eventIndex = updatedEvents.findIndex(e => e.id === result.draggableId);
    updatedEvents[eventIndex].date = days[result.destination.index];
    setEvents(updatedEvents);
  };

  const handleAddEvent = (startDay, endDay, resourceIndex) => {
    const newEvents = [];
    for (let i = startDay; i <= endDay; i++) {
      newEvents.push({
        id: `event-${eventCounter + i - startDay}`,
        name: `Event ${eventCounter + i - startDay}`,
        date: days[i],
        resourceIndex,
        color: `hsl(${Math.random() * 360}, 70%, 70%)`,
      });
    }
    setEvents([...events, ...newEvents]);
    setEventCounter(eventCounter + (endDay - startDay + 1));
  };

  const handleMouseDown = (index) => {
    setIsDragging(true);
    setDragStartDay(index);
  };

  const handleMouseUp = (index, resourceIndex) => {
    if (isDragging && dragStartDay !== null) {
      handleAddEvent(Math.min(dragStartDay, index), Math.max(dragStartDay, index), resourceIndex);
    }
    setIsDragging(false);
    setDragStartDay(null);
  };

  const addResource = () => {
    setResources([...resources, `Resource ${resources.length + 1}`]);
  };

  const handleDeleteEvent = (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      setEvents(events.filter(event => event.id !== eventId));
    }
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button className="nav-btn" onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}>❮</button>
        <h2>{format(currentMonth, "MMMM yyyy")}</h2>
        <button className="nav-btn" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>❯</button>
        <button className="add-resource-btn" onClick={addResource}>Add Resource</button>
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="calendar-grid">
          {resources.map((resource, resIndex) => (
            <div key={resIndex} className="calendar-row">
              <div className="resource-name">{resource}</div>
              <Droppable droppableId={String(resIndex)} direction="horizontal">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="droppable-area">
                    {days.map((day, index) => (
                      <div
                        key={index}
                        className={`calendar-cell ${format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") ? "highlight-today" : ""}`}
                        onMouseDown={() => handleMouseDown(index)}
                        onMouseUp={() => handleMouseUp(index, resIndex)}
                      >
                        {resIndex === 0 ? format(day, "d") : ""}
                        {events.filter(event => event.date.getTime() === day.getTime() && event.resourceIndex === resIndex).map(event => (
                          <Draggable key={event.id} draggableId={event.id} index={index}>
                            {(provided) => (
                              <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="event" style={{ backgroundColor: event.color }}>
                                {event.name}
                                <button className="delete-btn" onClick={() => handleDeleteEvent(event.id)}>✖</button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                      </div>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
