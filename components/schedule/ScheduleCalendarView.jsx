"use client";

import React, { useState, useCallback } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

/* -------------------------
   Custom Toolbar
-------------------------- */
const CustomToolbar = ({ label, onNavigate, onView, view }) => {
  return (
    <div className="rbc-toolbar">
      <span className="rbc-btn-group">
        <button type="button" onClick={() => onNavigate("PREV")}>
          Back
        </button>
        <button type="button" onClick={() => onNavigate("NEXT")}>
          Next
        </button>
      </span>

      <span className="rbc-toolbar-label">{label}</span>

      <span className="rbc-btn-group">
        <button
          type="button"
          className={view === "month" ? "rbc-active" : ""}
          onClick={() => onView("month")}
        >
          Month
        </button>
        <button
          type="button"
          className={view === "week" ? "rbc-active" : ""}
          onClick={() => onView("week")}
        >
          Week
        </button>
        <button
          type="button"
          className={view === "day" ? "rbc-active" : ""}
          onClick={() => onView("day")}
        >
          Day
        </button>
        <button
          type="button"
          className={view === "agenda" ? "rbc-active" : ""}
          onClick={() => onView("agenda")}
        >
          Agenda
        </button>
      </span>
    </div>
  );
};

/* -------------------------
   Custom Agenda Event
-------------------------- */
const CustomAgendaEvent = ({ event }) => {
  return (
    <div className="flex items-center gap-2 text-sm w-full">
      <span className="font-semibold text-indigo-700 dark:text-indigo-400">{event.title}</span>
      <span className="text-gray-500 dark:text-gray-600">|</span>
      <span className="text-gray-600 dark:text-gray-400">{event.resource?.assignedToGroup?.name || ''}</span>
      {event.resource?.location && (
        <span className="ml-auto bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] font-medium text-gray-600 dark:text-gray-400">
            📍 {event.resource.location}
        </span>
      )}
    </div>
  );
};

/* -------------------------
   Custom Calendar Event
-------------------------- */
const CustomEvent = ({ event }) => {
    return (
      <div className="flex flex-col text-[10px] leading-tight p-0.5">
        <div className="font-bold truncate">{event.title}</div>
        {event.resource?.location && (
          <div className="truncate opacity-90 flex items-center gap-0.5">
            📍 {event.resource.location}
          </div>
        )}
        {event.resource?.course && (
          <div className="truncate opacity-80 italic italic">
            {event.resource.course.name}
          </div>
        )}
      </div>
    );
  };

/* -------------------------
   Calendar View
-------------------------- */
export default function ScheduleCalendarView({
  schedules = [],
  onSelectEvent,
}) {
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState(Views.MONTH);

  const events = schedules.flatMap((schedule) => {
    const scheduleEvents = [];

    // ✅ SAFETY: ensure sessions is always an array
    const sessions = Array.isArray(schedule?.sessions) ? schedule.sessions : [];

    // If no sessions, nothing to render
    if (sessions.length === 0) return [];

    if (schedule.isRecurring) {
      const dayMap = {
        Sunday: 0,
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6,
      };

      const selectedDays = Array.isArray(schedule.daysOfWeek)
        ? schedule.daysOfWeek.map((day) => dayMap[day])
        : [];

      let currentDate = moment(schedule.startDate);
      const endDate = moment(schedule.endDate);

      while (currentDate.isSameOrBefore(endDate, "day")) {
        if (selectedDays.includes(currentDate.day())) {
          sessions.forEach((session) => {
            const startDateTime =
              moment(currentDate).format("YYYY-MM-DD") +
              "T" +
              moment(session.startTime).format("HH:mm:ss");

            const endDateTime =
              moment(currentDate).format("YYYY-MM-DD") +
              "T" +
              moment(session.endTime).format("HH:mm:ss");

            scheduleEvents.push({
              id: session.id,
              title: schedule.title,
              start: new Date(startDateTime),
              end: new Date(endDateTime),
              allDay: false,
              resource: schedule,
            });
          });
        }

        currentDate.add(1, "day");
      }
    } else {
      // ✅ Single-day schedule
      sessions.forEach((session) => {
        const startDateTime =
          moment(schedule.startDate).format("YYYY-MM-DD") +
          "T" +
          moment(session.startTime).format("HH:mm:ss");

        const endDateTime =
          moment(schedule.startDate).format("YYYY-MM-DD") +
          "T" +
          moment(session.endTime).format("HH:mm:ss");

        scheduleEvents.push({
          id: `${schedule.id}-${session.id}`,
          title: schedule.title,
          start: new Date(startDateTime),
          end: new Date(endDateTime),
          allDay: false,
          resource: schedule,
        });
      });
    }

    return scheduleEvents;
  });

  const handleNavigate = useCallback((newDate) => {
    setDate(newDate);
  }, []);

  const handleView = useCallback((newView) => {
    setView(newView);
  }, []);

  const eventPropGetter = useCallback((event) => {
    const isTeacher = !!event.resource?.assignedToTeacherId;
    return {
      style: {
        backgroundColor: isTeacher ? "#4f46e5" : "#0891b2", // Indigo for teacher, Cyan for group
        borderRadius: "6px",
        fontSize: "11px",
        border: "none",
        color: "white",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
      },
    };
  }, []);

  const components = {
    toolbar: CustomToolbar,
    event: CustomEvent,
    agenda: {
      event: CustomAgendaEvent,
    },
  };

  return (
    <div className="h-[750px] bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
        onSelectEvent={onSelectEvent}
        components={components}
        date={date}
        view={view}
        onNavigate={handleNavigate}
        onView={handleView}
        eventPropGetter={eventPropGetter}
      />
    </div>
  );
}
