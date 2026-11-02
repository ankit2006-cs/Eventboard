/* =====================================================
   CAMPUS EVENT BOARD — LAB ASSIGNMENT 6
   JavaScript, DOM, Events, Fetch API and Validation
   ===================================================== */


/* A2: Variables and data types */

// const is used by default.
const pageTitle = "Campus Event Board"; // String
const defaultSeats = 10;                // Number
const eventsAreOnline = false;          // Boolean

// let is used because this value changes after fetching.
let allEvents = [];


/* B1: Select HTML elements using DOM selectors */

const eventContainer = document.querySelector("#event-list");
const eventSearch = document.querySelector("#event-search");
const eventStatus = document.querySelector("#event-status");

const navLinks = document.querySelectorAll("#main-navigation a");

const menuButton = document.getElementById("menu-button");
const navigation = document.querySelector("#main-navigation");

const eventTableBody = document.querySelector("#event-table-body");

const eventForm = document.querySelector("#event-form");
const eventTitleInput = document.querySelector("#event-title");
const formMessage = document.querySelector("#form-message");


/* A4: Control flow using if / else */

function getSeatLabel(eventItem) {

    if (eventItem.seats === 0) {
        return "Full";
    }
    else if (eventItem.seats < 5) {
        return "Few left";
    }
    else {
        return "Open";
    }

}


/* A6: Function with parameter and return */

function formatEvent(eventItem) {

    const formattedDate = new Date(
        `${eventItem.date}T00:00:00`
    ).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });

    return `${eventItem.title} — ${formattedDate} — ${getSeatLabel(eventItem)}`;

}


/* B2 and B3: Render event cards dynamically */

function renderEvents(eventsToRender) {

    eventContainer.replaceChildren();
    eventTableBody.replaceChildren();

    // Display message if no events match.
    if (eventsToRender.length === 0) {

        const emptyItem = document.createElement("li");

        emptyItem.textContent = "No events match your search.";

        emptyItem.classList.add("empty-state");

        eventContainer.appendChild(emptyItem);

        return;
    }


    /* A5: for...of loop processes every event */

    for (const eventItem of eventsToRender) {

        // Create HTML elements.
        const cardItem = document.createElement("li");
        const article = document.createElement("article");

        const heading = document.createElement("h3");
        const dateLine = document.createElement("p");
        const venueLine = document.createElement("p");
        const timeLine = document.createElement("p");
        const modeLine = document.createElement("p");
        const seatsLine = document.createElement("p");
        const status = document.createElement("p");

        // Create RSVP button.
        const rsvpButton = document.createElement("button");

        // Set event information using textContent.
        heading.textContent = eventItem.title;

        dateLine.textContent =
            `Date: ${new Date(eventItem.date + "T00:00:00").toLocaleDateString("en-IN")}`;

        venueLine.textContent = `Venue: ${eventItem.venue}`;

        timeLine.textContent = `Time: ${eventItem.time}`;

        modeLine.textContent =
            `Mode: ${eventItem.online ? "Online" : "Offline"}`;

        seatsLine.textContent =
            `Seats available: ${eventItem.seats}`;

        status.textContent = getSeatLabel(eventItem);


        // Add CSS classes.
        article.classList.add("event-card");

        status.classList.add("seat-status");


        // B3: Change appearance when an event is full.
        if (eventItem.seats === 0) {

            article.classList.add("full");

            status.classList.add("event-full");

            article.style.opacity = "0.88";

        }


        // B3: Set attributes.
        status.setAttribute(
            "aria-label",
            `Registration status: ${getSeatLabel(eventItem)}`
        );


        // Configure RSVP button.
        rsvpButton.textContent =
            eventItem.seats === 0 ? "Fully Booked" : "RSVP Now";

        rsvpButton.classList.add("rsvp-button");

        rsvpButton.type = "button";

        rsvpButton.disabled = eventItem.seats === 0;

        rsvpButton.dataset.eventTitle = eventItem.title;


        // Add all elements to the event card.
        article.append(
            heading,
            dateLine,
            venueLine,
            timeLine,
            modeLine,
            seatsLine,
            status,
            rsvpButton
        );

        cardItem.appendChild(article);

        eventContainer.appendChild(cardItem);


        // Create schedule table rows.
        const row = document.createElement("tr");

        const values = [
            eventItem.title,
            new Date(eventItem.date + "T00:00:00").toLocaleDateString("en-IN"),
            eventItem.venue,
            eventItem.time
        ];

        for (const value of values) {

            const cell = document.createElement("td");

            cell.textContent = value;

            row.appendChild(cell);

        }

        eventTableBody.appendChild(row);


        // A6: Call function and use returned value.
        console.log(formatEvent(eventItem));

    }

}


/* A7: Arrow function and filter() method */

function filterEvents(searchText) {

    const normalizedQuery = searchText.trim().toLowerCase();

    const matchingEvents = allEvents.filter(eventItem =>

        `${eventItem.title} ${eventItem.venue} ${eventItem.category}`
            .toLowerCase()
            .includes(normalizedQuery)

    );

    renderEvents(matchingEvents);

}


/* B7: Fetch JSON data using async / await */

async function loadEvents() {

    eventStatus.textContent = "Loading...";

    eventContainer.setAttribute("aria-busy", "true");

    try {

        const response = await fetch("events.json");

        if (!response.ok) {

            throw new Error(
                `Could not load events. HTTP ${response.status}`
            );

        }

        const data = await response.json();

        if (!Array.isArray(data)) {

            throw new Error("Invalid events data.");

        }

        // Store fetched event objects.
        allEvents = data;

        // Success state.
        eventStatus.textContent =
            `Showing ${allEvents.length} events.`;

        renderEvents(allEvents);

        console.log(
            `${pageTitle}: loaded ${allEvents.length} events.`,
            {
                defaultSeats,
                eventsAreOnline,
                events: allEvents
            }
        );

    }
    catch (error) {

        // Error state.
        eventStatus.textContent =
            "Events could not be loaded. Please run the project using Live Server.";

        console.error("Event loading error:", error);

    }
    finally {

        eventContainer.setAttribute("aria-busy", "false");

    }

}


/* B4: Navigation button click event */

menuButton.addEventListener("click", () => {

    const isOpen = navigation.classList.toggle("is-open");

    menuButton.setAttribute(
        "aria-expanded",
        String(isOpen)
    );

    menuButton.setAttribute(
        "aria-label",
        isOpen ? "Close navigation menu" : "Open navigation menu"
    );

});


/* Close navigation after selecting a link */

navLinks.forEach(link => {

    link.addEventListener("click", () => {

        navigation.classList.remove("is-open");

        menuButton.setAttribute("aria-expanded", "false");

    });

});


/* B5: Event delegation, event.target and event bubbling */

eventContainer.addEventListener("click", event => {

    // Check whether RSVP button was clicked.
    if (event.target.matches(".rsvp-button")) {

        const clickedButton = event.target;

        const eventTitle = clickedButton.dataset.eventTitle;

        // Find the selected event in the original array.
        const selectedEvent = allEvents.find(
            ev => ev.title === eventTitle
        );

        if (selectedEvent && selectedEvent.seats > 0) {

            // Decrease available seats.
            selectedEvent.seats--;

            console.log(
                "RSVP successful:",
                selectedEvent.title
            );

            // Update the displayed cards and seat count.
            filterEvents(eventSearch.value);

        }

        return;

    }


    // Normal card click.
    const clickedCard = event.target.closest("article");

    if (clickedCard) {

        clickedCard.classList.toggle("selected");

        console.log(
            "Clicked event card:",
            clickedCard.querySelector("h3").textContent
        );

    }

});


/* B6: Search events while typing */

eventSearch.addEventListener("input", event => {

    filterEvents(event.target.value);

});


/* B6: Escape key clears the search */

eventSearch.addEventListener("keydown", event => {

    if (event.key === "Escape") {

        eventSearch.value = "";

        filterEvents("");

        eventSearch.focus();

    }

});


/* B8: Custom form validation using setCustomValidity() */

eventTitleInput.addEventListener("input", () => {

    if (eventTitleInput.value.trim().length < 2) {

        eventTitleInput.setCustomValidity(
            "Event title must contain at least 2 characters."
        );

    }
    else {

        eventTitleInput.setCustomValidity("");

    }

});


/* B8: Validate form before submission */

eventForm.addEventListener("submit", event => {

    // Prevent default form submission.
    event.preventDefault();

    // Custom validation.
    eventTitleInput.setCustomValidity(

        eventTitleInput.value.trim().length < 2
            ? "Event title must contain at least 2 characters."
            : ""

    );


    // Check all built-in and custom validation rules.
    if (!eventForm.checkValidity()) {

        eventForm.reportValidity();

        formMessage.textContent =
            "Please correct the highlighted fields.";

        formMessage.classList.add("form-error");

        return;

    }


    // Successful validation.
    formMessage.textContent =
        "Form validated successfully! This demo does not save or send the event.";

    formMessage.classList.remove("form-error");

    console.log(
        "Validated event suggestion:",
        Object.fromEntries(new FormData(eventForm))
    );

});


/* A8: Function scope demonstration */

function demonstrateLocalScope() {

    const localMessage =
        "This variable is available only inside this function.";

    console.log(localMessage);

}

demonstrateLocalScope();


/* Start the application */

loadEvents();