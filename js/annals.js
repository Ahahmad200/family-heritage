import { supabase } from "./supabase.js";


// =========================================
// FAMILY ANNALS
// =========================================

const familyAnnals =
    document.getElementById("familyAnnals");


// =========================================
// LOAD FAMILY ANNALS
// =========================================

async function loadFamilyAnnals() {

    if (!familyAnnals) {
        return;
    }

    familyAnnals.innerHTML = `
        <div class="annals-loading">
            <div class="annals-loading-icon">
                📖
            </div>

            <p>
                Loading family history...
            </p>
        </div>
    `;


    // =====================================
    // LOAD ANNALS
    // =====================================

    const {
        data: annals,
        error: annalsError
    } = await supabase
        .from("family_annals")
        .select(`
            id,
            title,
            event_date,
            event_type,
            person_id,
            description,
            photo_url,
            is_highlighted
        `)
        .order(
            "event_date",
            {
                ascending: true
            }
        );


    if (annalsError) {

        console.error(
            "Error loading family annals:",
            annalsError
        );

        familyAnnals.innerHTML = `
            <div class="relationship-message">

                <strong>
                    Unable to load family history.
                </strong>

                <p>
                    Please try again later.
                </p>

            </div>
        `;

        return;
    }


    // =====================================
    // NO EVENTS
    // =====================================

    if (!annals || annals.length === 0) {

        familyAnnals.innerHTML = `
            <div class="annals-empty">

                <div class="annals-empty-icon">
                    📜
                </div>

                <h3>
                    Our story is waiting to be written
                </h3>

                <p>
                    Family historical events will
                    appear here as they are added.
                </p>

            </div>
        `;

        return;
    }


    // =====================================
    // LOAD FAMILY MEMBERS
    // =====================================

    const {
        data: members,
        error: membersError
    } = await supabase
        .from("members")
        .select(`
            id,
            full_name
        `);


    if (membersError) {

        console.error(
            "Error loading family members:",
            membersError
        );

        return;
    }


    // =====================================
    // CREATE TIMELINE
    // =====================================

    familyAnnals.innerHTML = "";


    annals.forEach(
        (annal, index) => {

            const member =
                members.find(
                    person =>
                        person.id ===
                        annal.person_id
                );


            const eventDate =
                annal.event_date
                    ? new Date(
                        annal.event_date
                    )
                    : null;


            const formattedDate =
                eventDate
                    ? eventDate.toLocaleDateString(
                        "en-US",
                        {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                        }
                    )
                    : "Date not recorded";


            const year =
                eventDate
                    ? eventDate.getFullYear()
                    : "—";


            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "annals-event";


            if (annal.is_highlighted) {

                card.classList.add(
                    "annals-event-highlighted"
                );

            }


            card.innerHTML = `

                <div class="annals-marker">

                    <span>
                        ${index + 1}
                    </span>

                </div>


                <div class="annals-event-card">


                    <div class="annals-event-year">
                        ${year}
                    </div>


                    <div class="annals-event-content">


                        ${
                            annal.photo_url
                                ? `
                                    <img
                                        src="${annal.photo_url}"
                                        alt="${annal.title}"
                                        class="annals-event-image"
                                    >
                                `
                                : ""
                        }


                        <div class="annals-event-details">


                            <span
                                class="annals-event-type"
                            >
                                ${annal.event_type}
                            </span>


                            <h3>
                                ${annal.title}
                            </h3>


                            <div
                                class="annals-event-date"
                            >
                                📅 ${formattedDate}
                            </div>


                            ${
                                member
                                    ? `
                                        <div
                                            class="annals-event-person"
                                        >
                                            👤
                                            ${member.full_name}
                                        </div>
                                    `
                                    : ""
                            }


                            ${
                                annal.description
                                    ? `
                                        <p>
                                            ${annal.description}
                                        </p>
                                    `
                                    : ""
                            }


                        </div>

                    </div>

                </div>

            `;


            familyAnnals.appendChild(
                card
            );

        }
    );

}


// =========================================
// START
// =========================================

loadFamilyAnnals();
