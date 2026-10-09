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
            <button
                type="button"
                class="annals-member-link"
                data-member-id="${escapeHTML(member.id)}"
            >
                ${escapeHTML(member.full_name)}
            </button>
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
// CLICK FAMILY MEMBER NAME
// =========================================

familyAnnals.addEventListener("click", async function(event) {
    const button = event.target.closest(".annals-member-link");

    if (!button) return;

    const memberId = button.dataset.memberId;

    try {
        const { data: member, error } = await supabase
            .from("members")
            .select(`
                id,
                full_name,
                gender,
                is_deceased,
                photo_url,
                biography,
                date_of_birth,
                place_of_birth,
                date_of_death
            `)
            .eq("id", memberId)
            .single();

        if (error) throw error;

        // Show the member's details in a simple popup.
        const existingPopup = document.getElementById("annalsMemberPopup");

if (existingPopup) {
    existingPopup.remove();
}

const popup = document.createElement("dialog");
popup.id = "annalsMemberPopup";

popup.style.cssText = `
    position: fixed !important;
    inset: 0 !important;
    margin: auto !important;
    width: min(500px, calc(100% - 30px));
    max-width: 500px;
    max-height: 85vh;
    overflow-y: auto;
    padding: 24px;
    border: none;
    border-radius: 18px;
    box-sizing: border-box;
    background: #fffaf0;
    color: #382719;
    z-index: 2147483647;
`;

popup.innerHTML = `
    <div class="annals-member-popup-card">
        <button
            type="button"
            class="annals-member-popup-close"
            aria-label="Close profile"
            style="float:right;font-size:28px;border:none;background:none;cursor:pointer;"
        >×</button>

        ${member.photo_url ? `
            <img
                class="annals-member-popup-photo"
                src="${escapeHTML(member.photo_url)}"
                alt="${escapeHTML(member.full_name)}"
                style="display:block;max-width:100%;max-height:250px;object-fit:contain;margin:15px auto;border-radius:12px;"
            >
        ` : ""}

        <h2>${escapeHTML(member.full_name)}</h2>

        <p>${member.is_deceased ? "Deceased" : "Living"}</p>

        ${member.date_of_birth ? `
            <p>🎂 Date of birth: ${escapeHTML(member.date_of_birth)}</p>
        ` : ""}

        ${member.place_of_birth ? `
            <p>📍 Place of birth: ${escapeHTML(member.place_of_birth)}</p>
        ` : ""}

        <h3>Biography</h3>

        <p>${escapeHTML(member.biography || "Biography will be added soon.")}</p>
    </div>
`;

popup.addEventListener("click", function(closeEvent) {
    if (
        closeEvent.target === popup ||
        closeEvent.target.closest(".annals-member-popup-close")
    ) {
        popup.close();
        popup.remove();
    }
});

popup.addEventListener("cancel", function() {
    popup.remove();
});

document.body.appendChild(popup);

popup.showModal();

        popup.addEventListener("click", function(closeEvent) {
            if (
                closeEvent.target === popup ||
                closeEvent.target.closest(".annals-member-popup-close")
            ) {
                popup.remove();
            }
        });

    } catch (error) {
        console.error("Unable to load member profile:", error);
        alert("Unable to load this family member's profile. Please try again.");
    }
});
// =========================================
// START
// =========================================

loadFamilyAnnals();
