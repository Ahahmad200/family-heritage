import { supabase } from "./supabase.js";

// =========================================
// FAMILY ANNALS — HISTORICAL TIMELINE
// =========================================

const familyAnnals = document.getElementById("familyAnnals");

// Safely display text received from the database.
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

// Format a date without accidentally changing the calendar day.
function formatEventDate(dateString) {
    if (!dateString) return "Date not recorded";

    const parts = dateString.split("-").map(Number);

    if (parts.length !== 3 || parts.some(Number.isNaN)) {
        return "Date not recorded";
    }

    const [year, month, day] = parts;
    const date = new Date(Date.UTC(year, month - 1, day));

    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
    ) {
        return "Date not recorded";
    }

    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC"
    });
}

// =========================================
// LOAD FAMILY ANNALS
// =========================================

async function loadFamilyAnnals() {
    if (!familyAnnals) return;

    familyAnnals.innerHTML = `
        <div class="annals-loading">
            <div class="annals-loading-icon">📖</div>
            <p>Loading family history...</p>
        </div>
    `;

    try {
        // Load historical events.
        const { data: annals, error: annalsError } = await supabase
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
            .order("event_date", {
                ascending: true,
                nullsFirst: false
            })
            .order("created_at", {
                ascending: true
            });

        if (annalsError) throw annalsError;

        if (!annals || annals.length === 0) {
            familyAnnals.innerHTML = `
                <div class="annals-empty">
                    <div class="annals-empty-icon">📜</div>
                    <h3>Our story is waiting to be written</h3>
                    <p>
                        Family historical events will appear here
                        as they are added.
                    </p>
                </div>
            `;
            return;
        }

        // Load family members for the event connections.
        const { data: members, error: membersError } = await supabase
            .from("members")
            .select("id, full_name, photo_url, biography");

        if (membersError) throw membersError;

        const memberMap = new Map(
            (members || []).map(member => [member.id, member])
        );

        familyAnnals.innerHTML = "";

        // Render events in chronological order.
        annals.forEach((annal, index) => {
            const member = memberMap.get(annal.person_id);
            const formattedDate = formatEventDate(annal.event_date);

            const year = annal.event_date &&
                /^\d{4}-\d{2}-\d{2}$/.test(annal.event_date)
                ? annal.event_date.slice(0, 4)
                : "Year unknown";

            const card = document.createElement("article");
            card.className = "annals-event";

            if (annal.is_highlighted) {
                card.classList.add("annals-event-highlighted");
            }

            const safeTitle = escapeHTML(annal.title || "Untitled event");
            const safeType = escapeHTML(annal.event_type || "Family event");
            const safeDescription = escapeHTML(annal.description || "");

            const photoHTML = annal.photo_url
                ? `
                    <img
                        src="${escapeHTML(annal.photo_url)}"
                        alt="${safeTitle}"
                        class="annals-event-image"
                        loading="lazy"
                    >
                `
                : "";

            const memberHTML = member
                ? `
                    <div class="annals-event-person">
                        👤
                        <span>${escapeHTML(member.full_name)}</span>
                    </div>
                `
                : "";

            card.innerHTML = `
                <div class="annals-marker">
                    <span>${index + 1}</span>
                </div>

                <div class="annals-event-card">
                    <div class="annals-event-year">
                        ${escapeHTML(year)}
                    </div>

                    <div class="annals-event-content">
                        ${photoHTML}

                        <div class="annals-event-details">
                            <span class="annals-event-type">
                                ${safeType}
                            </span>

                            <h3>${safeTitle}</h3>

                            <div class="annals-event-date">
                                📅 ${escapeHTML(formattedDate)}
                            </div>

                            ${memberHTML}

                            ${
                                safeDescription
                                    ? `<p>${safeDescription}</p>`
                                    : ""
                            }
                        </div>
                    </div>
                </div>
            `;

            familyAnnals.appendChild(card);
        });

    } catch (error) {
        console.error("Error loading family annals:", error);

        familyAnnals.innerHTML = `
            <div class="annals-empty">
                <h3>Unable to load family history</h3>
                <p>
                    Please refresh the page and try again.
                    If the problem continues, check the browser console.
                </p>
            </div>
        `;
    }
}

// =========================================
// START
// =========================================

loadFamilyAnnals();
