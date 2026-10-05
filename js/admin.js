import { supabase } from "./supabase.js";
// ===============================
// ADMIN ACCESS PROTECTION
// ===============================

async function checkAdminAccess() {

    const {
        data: { user }
    } = await supabase.auth.getUser();

    // No logged-in user
    if (!user) {

        window.location.href =
            "admin-login.html";

        return false;
    }


    // Check whether user is an administrator
    const { data: admin, error } =
        await supabase
            .from("admin_users")
            .select("id")
            .eq(
                "auth_user_id",
                user.id
            )
            .maybeSingle();


    if (error || !admin) {

        await supabase.auth.signOut();

        window.location.href =
            "admin-login.html";

        return false;
    }


    return true;
}

// ===============================
// GET HTML ELEMENTS
// ===============================

const membersList =
    document.getElementById("membersList");

const memberSearch =
    document.getElementById("memberSearch");

const addMemberButton =
    document.getElementById("addMemberButton");

const memberFormContainer =
    document.getElementById("memberFormContainer");

const memberForm =
    document.getElementById("memberForm");

const memberFormTitle =
    document.getElementById("memberFormTitle");

const closeMemberForm =
    document.getElementById("closeMemberForm");

const cancelMemberForm =
    document.getElementById("cancelMemberForm");

const memberMessage =
    document.getElementById("memberMessage");

const memberId =
    document.getElementById("memberId");

const fullName =
    document.getElementById("fullName");

const gender =
    document.getElementById("gender");

const dateOfBirth =
    document.getElementById("dateOfBirth");

const placeOfBirth =
    document.getElementById("placeOfBirth");

const photoUrl =
    document.getElementById("photoUrl");

const isDeceased =
    document.getElementById("isDeceased");

const dateOfDeath =
    document.getElementById("dateOfDeath");

const biography =
    document.getElementById("biography");

const totalMembers =
    document.getElementById("totalMembers");

const livingMembers =
    document.getElementById("livingMembers");

const deceasedMembers =
    document.getElementById("deceasedMembers");


// ===============================
// STORE ALL MEMBERS
// ===============================

let allMembers = [];


// ===============================
// LOAD MEMBERS
// ===============================

async function loadMembers() {

    membersList.innerHTML = `
        <p class="admin-loading">
            Loading family members...
        </p>
    `;

    const { data, error } = await supabase
        .from("members")
        .select(`
            id,
            full_name,
            gender,
            date_of_birth,
            place_of_birth,
            photo_url,
            biography,
            is_deceased,
            date_of_death
        `)
        .order("full_name");

    if (error) {

        console.error("LOAD MEMBERS ERROR:", error);

        membersList.innerHTML = `
            <p class="admin-error">
                Unable to load family members.
                <br>
                ${error.message}
            </p>
        `;

        return;
    }

    allMembers = data || [];

    updateStatistics();

    displayMembers(allMembers);
}


// ===============================
// UPDATE STATISTICS
// ===============================

function updateStatistics() {

    const total =
        allMembers.length;

    const deceased =
        allMembers.filter(
            member => member.is_deceased === true
        ).length;

    const living =
        total - deceased;

    totalMembers.textContent =
        total;

    livingMembers.textContent =
        living;

    deceasedMembers.textContent =
        deceased;
}


// ===============================
// DISPLAY MEMBERS
// ===============================

function displayMembers(members) {

    if (members.length === 0) {

        membersList.innerHTML = `
            <p class="admin-empty">
                No family members found.
            </p>
        `;

        return;
    }

    membersList.innerHTML = "";


    members.forEach(member => {

        const card =
            document.createElement("div");

        card.className =
            "admin-member-row";


        const status =
            member.is_deceased
                ? "Deceased"
                : "Living";


        const photo =
            member.photo_url
                ? `
                    <img
                        src="${member.photo_url}"
                        alt="${member.full_name}"
                    >
                `
                : `
                    <div class="admin-member-placeholder">
                        ${getInitials(member.full_name)}
                    </div>
                `;


        card.innerHTML = `

            <div class="admin-member-photo">

                ${photo}

            </div>


            <div class="admin-member-info">

                <h3>
                    ${member.full_name}
                </h3>

                <p>
                    ${member.gender || "Gender not added"}
                </p>

                <span
                    class="
                        admin-member-status
                        ${member.is_deceased ? "deceased" : ""}
                    "
                >
                    ${status}
                </span>

            </div>


            <div class="admin-member-actions">

    <button
        class="admin-view-button"
        data-id="${member.id}"
    >
        View
    </button>

    <button
        class="admin-edit-button"
        data-id="${member.id}"
    >
        Edit
    </button>

    <button
        class="admin-delete-button"
        data-id="${member.id}"
    >
        Delete
    </button>

</div>
        `;


        membersList.appendChild(card);

    });
    
// ===============================
// VIEW BUTTONS
// ===============================

document
    .querySelectorAll(".admin-view-button")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const id =
                    button.dataset.id;

                viewMember(id);

            }
        );

    });

    // ===============================
    // EDIT BUTTONS
    // ===============================

    document
        .querySelectorAll(".admin-edit-button")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        button.dataset.id;

                    editMember(id);

                }
            );

        });


    // ===============================
    // DELETE BUTTONS
    // ===============================

    document
        .querySelectorAll(".admin-delete-button")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        button.dataset.id;

                    deleteMember(id);

                }
            );

        });

}


// ===============================
// GET INITIALS
// ===============================

function getInitials(name) {

    const words =
        name.trim().split(" ");


    if (words.length === 1) {

        return words[0]
            .charAt(0)
            .toUpperCase();

    }


    return (
        words[0].charAt(0) +
        words[words.length - 1].charAt(0)
    ).toUpperCase();

}


// ===============================
// ADD MEMBER BUTTON
// ===============================

addMemberButton.addEventListener(
    "click",
    () => {

        openMemberForm();

    }
);


// ===============================
// OPEN MEMBER FORM
// ===============================

function openMemberForm() {

    memberForm.reset();

    memberId.value = "";

    memberFormTitle.textContent =
        "Add Family Member";

    memberMessage.textContent = "";

    memberFormContainer.style.display =
        "block";

}


// ===============================
// CLOSE FORM
// ===============================

function closeForm() {

    memberFormContainer.style.display =
        "none";

}


closeMemberForm.addEventListener(
    "click",
    closeForm
);


cancelMemberForm.addEventListener(
    "click",
    closeForm
);


// ===============================
// EDIT MEMBER
// ===============================

function editMember(id) {

    const member =
        allMembers.find(
            item => item.id === id
        );


    if (!member) {

        return;

    }


    memberFormTitle.textContent =
        "Edit Family Member";


    memberId.value =
        member.id;


    fullName.value =
        member.full_name || "";


    gender.value =
        member.gender || "";


    dateOfBirth.value =
        member.date_of_birth || "";


    placeOfBirth.value =
        member.place_of_birth || "";


    photoUrl.value =
        member.photo_url || "";


    isDeceased.value =
        member.is_deceased
            ? "true"
            : "false";


    dateOfDeath.value =
        member.date_of_death || "";


    biography.value =
        member.biography || "";


    memberMessage.textContent = "";


    memberFormContainer.style.display =
        "block";


    window.scrollTo({

        top:
            memberFormContainer.offsetTop,

        behavior:
            "smooth"

    });

}


// ===============================
// SAVE MEMBER
// ===============================

memberForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        memberMessage.textContent =
            "Saving member...";


        const memberData = {

            full_name:
                fullName.value.trim(),

            gender:
                gender.value || null,

            date_of_birth:
                dateOfBirth.value || null,

            place_of_birth:
                placeOfBirth.value.trim() || null,

            photo_url:
                photoUrl.value.trim() || null,

            biography:
                biography.value.trim() || null,

            is_deceased:
                isDeceased.value === "true",

            date_of_death:
                dateOfDeath.value || null

        };


        let result;


        // ===============================
        // ADD NEW MEMBER
        // ===============================

        if (!memberId.value) {

            result =
                await supabase
                    .from("members")
                    .insert([
                        memberData
                    ]);

        }


        // ===============================
        // UPDATE EXISTING MEMBER
        // ===============================

        else {

            result =
                await supabase
                    .from("members")
                    .update(
                        memberData
                    )
                    .eq(
                        "id",
                        memberId.value
                    );

        }


        // ===============================
        // CHECK ERROR
        // ===============================

        if (result.error) {

            console.error(
                "SAVE MEMBER ERROR:",
                result.error
            );


            memberMessage.innerHTML =
                `
                Unable to save member.
                <br>
                ${result.error.message}
                `;

            return;

        }


        // ===============================
        // SUCCESS
        // ===============================

        memberMessage.textContent =
            "Member saved successfully!";


        await loadMembers();


        setTimeout(
            closeForm,
            800
        );

    }
);


// ===============================
// DELETE MEMBER
// ===============================

async function deleteMember(id) {

    const member =
        allMembers.find(
            item => item.id === id
        );


    if (!member) {

        return;

    }


    const confirmed =
        confirm(
            `Are you sure you want to delete ${member.full_name}?`
        );


    if (!confirmed) {

        return;

    }


    const { error } =
        await supabase
            .from("members")
            .delete()
            .eq("id", id);


    if (error) {

        console.error(
            "DELETE MEMBER ERROR:",
            error
        );


        alert(
            "Unable to delete member.\n\n" +
            error.message
        );

        return;

    }


    alert(
        "Member deleted successfully."
    );


    await loadMembers();

}


// ===============================
// SEARCH MEMBERS
// ===============================

memberSearch.addEventListener(
    "input",
    function() {

        const search =
            memberSearch.value
                .toLowerCase()
                .trim();


        const filtered =
            allMembers.filter(
                member =>
                    member.full_name
                        .toLowerCase()
                        .includes(search)
            );


        displayMembers(filtered);

    }
);


// ===============================
// START ADMIN PAGE
// ===============================

loadMembers();
// =================================
// RELATIONSHIP MANAGEMENT
// =================================

const relationshipPerson =
    document.getElementById("relationshipPerson");

const relationshipType =
    document.getElementById("relationshipType");

const relatedPerson =
    document.getElementById("relatedPerson");

const saveRelationshipButton =
    document.getElementById("saveRelationshipButton");

const relationshipMessage =
    document.getElementById("relationshipMessage");

const relationshipsList =
    document.getElementById("relationshipsList");


// =================================
// LOAD MEMBERS INTO DROPDOWNS
// =================================

function loadRelationshipMembers() {

    relationshipPerson.innerHTML = `
        <option value="">
            Select person
        </option>
    `;

    relatedPerson.innerHTML = `
        <option value="">
            Select related person
        </option>
    `;


    allMembers.forEach(member => {

        const option1 =
            document.createElement("option");

        option1.value =
            member.id;

        option1.textContent =
            member.full_name;

        relationshipPerson.appendChild(
            option1
        );


        const option2 =
            document.createElement("option");

        option2.value =
            member.id;

        option2.textContent =
            member.full_name;

        relatedPerson.appendChild(
            option2
        );

    });

}


// =================================
// LOAD EXISTING RELATIONSHIPS
// =================================

async function loadRelationships() {

    relationshipsList.innerHTML = `
        <p class="admin-loading">
            Loading relationships...
        </p>
    `;


    const { data, error } =
        await supabase
            .from("relationships")
            .select(`
                id,
                person_id,
                related_person_id,
                relationship_type
            `);


    if (error) {

        console.error(
            "LOAD RELATIONSHIPS ERROR:",
            error
        );


        relationshipsList.innerHTML = `
            <p class="admin-error">
                Unable to load relationships.
                <br>
                ${error.message}
            </p>
        `;

        return;

    }


    if (!data || data.length === 0) {

        relationshipsList.innerHTML = `
            <p class="admin-empty">
                No relationships have been added yet.
            </p>
        `;

        return;

    }


    relationshipsList.innerHTML = "";


    data.forEach(relationship => {

        const person =
            allMembers.find(
                member =>
                    member.id ===
                    relationship.person_id
            );


        const relatedPersonData =
            allMembers.find(
                member =>
                    member.id ===
                    relationship.related_person_id
            );


        if (!person || !relatedPersonData) {

            return;

        }


        const row =
            document.createElement("div");

        row.className =
            "relationship-row";


        let relationshipText =
            relationship.relationship_type;


        if (
            relationship.relationship_type ===
            "child"
        ) {

            relationshipText =
                "Child of";

        }


        if (
            relationship.relationship_type ===
            "parent"
        ) {

            relationshipText =
                "Parent of";

        }


        if (
            relationship.relationship_type ===
            "spouse"
        ) {

            relationshipText =
                "Spouse of";

        }


        row.innerHTML = `

            <div class="relationship-info">

                <strong>
                    ${person.full_name}
                </strong>

                <span>
                    ${relationshipText}
                </span>

                <strong>
                    ${relatedPersonData.full_name}
                </strong>

            </div>


            <button
                class="admin-delete-button delete-relationship-button"
                data-id="${relationship.id}"
            >
                Delete
            </button>

        `;


        relationshipsList.appendChild(
            row
        );

    });


    // =================================
    // DELETE RELATIONSHIP BUTTONS
    // =================================

    document
        .querySelectorAll(
            ".delete-relationship-button"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    deleteRelationship(
                        button.dataset.id
                    );

                }
            );

        });

}


// =================================
// SAVE RELATIONSHIP
// =================================

saveRelationshipButton.addEventListener(
    "click",
    async function() {

        const personId =
            relationshipPerson.value;

        const type =
            relationshipType.value;

        const relatedPersonId =
            relatedPerson.value;


        if (
            !personId ||
            !type ||
            !relatedPersonId
        ) {

            relationshipMessage.textContent =
                "Please select all relationship fields.";

            return;

        }


        if (
            personId === relatedPersonId
        ) {

            relationshipMessage.textContent =
                "A person cannot be related to themselves.";

            return;

        }


        relationshipMessage.textContent =
            "Saving relationship...";


        const { error } =
            await supabase
                .from("relationships")
                .insert([

                    {
                        person_id:
                            personId,

                        related_person_id:
                            relatedPersonId,

                        relationship_type:
                            type

                    }

                ]);


        if (error) {

    console.error(
        "SAVE RELATIONSHIP ERROR:",
        error
    );


    if (
        error.code === "23505"
    ) {

        relationshipMessage.textContent =
            "This relationship already exists.";

    } else {

        relationshipMessage.textContent =
            "Unable to save relationship: " +
            error.message;

    }


    return;

}


        relationshipMessage.textContent =
            "Relationship saved successfully!";


        relationshipPerson.value =
            "";

        relationshipType.value =
            "";

        relatedPerson.value =
            "";


        await loadRelationships();

    }
);


// =================================
// DELETE RELATIONSHIP
// =================================

async function deleteRelationship(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this relationship?"
        );


    if (!confirmed) {

        return;

    }


    const { error } =
        await supabase
            .from("relationships")
            .delete()
            .eq(
                "id",
                id
            );


    if (error) {

        console.error(
            "DELETE RELATIONSHIP ERROR:",
            error
        );


        alert(
            "Unable to delete relationship.\n\n" +
            error.message
        );

        return;

    }


    alert(
        "Relationship deleted successfully."
    );


    await loadRelationships();

}


// =================================
// START RELATIONSHIP MANAGEMENT
// =================================

checkAdminAccess().then((isAdmin) => {

    if (!isAdmin) {
        return;
    }

    loadMembers().then(() => {

        loadRelationshipMembers();

        loadRelationships();

    });

});
// ===============================
// VIEW MEMBER DETAILS
// ===============================

async function viewMember(memberId) {

    const member =
        allMembers.find(
            item => item.id === memberId
        );


    if (!member) {

        alert("Member information not found.");

        return;
    }


    const status =
        member.is_deceased
            ? "Deceased"
            : "Living";


    const photo =
        member.photo_url
            ? `
                <img
                    src="${member.photo_url}"
                    alt="${member.full_name}"
                    class="admin-view-member-photo"
                >
            `
            : `
                <div class="admin-view-member-placeholder">
                    ${getInitials(member.full_name)}
                </div>
            `;


    const birthDate =
        member.date_of_birth
            ? member.date_of_birth
            : "Not added";


    const birthPlace =
        member.place_of_birth
            ? member.place_of_birth
            : "Not added";


    const biography =
        member.biography
            ? member.biography
            : "No biography has been added yet.";

// Remove any existing member popup

const existingModal =
    document.querySelector(
        ".admin-member-view-modal"
    );

if (existingModal) {
    existingModal.remove();
}
    const modal =
        document.createElement("div");

    modal.className =
        "admin-member-view-modal";


    modal.innerHTML = `

        <div class="admin-member-view-content">

            <button
                class="admin-member-view-close"
                type="button"
            >
                ×
            </button>


            <div class="admin-member-view-photo">
                ${photo}
            </div>


            <h2>
                ${member.full_name}
            </h2>


            <span class="admin-member-view-status">
                ${status}
            </span>


            <div class="admin-member-view-details">

                <p>
                    <strong>Gender:</strong>
                    ${member.gender || "Not added"}
                </p>

                <p>
                    <strong>Date of Birth:</strong>
                    ${birthDate}
                </p>

                <p>
                    <strong>Place of Birth:</strong>
                    ${birthPlace}
                </p>

                ${
                    member.is_deceased
                    ? `
                        <p>
                            <strong>Date of Death:</strong>
                            ${member.date_of_death || "Not added"}
                        </p>
                    `
                    : ""
                }

                <div class="admin-member-biography">

                    <strong>Biography</strong>

                    <p>
                        ${biography}
                    </p>

                </div>

            </div>

        </div>

    `;


    document.body.appendChild(modal);


    // CLOSE BUTTON

    modal
        .querySelector(
            ".admin-member-view-close"
        )
        .addEventListener(
            "click",
            () => modal.remove()
        );


    // CLOSE WHEN CLICKING OUTSIDE

    modal.addEventListener(
        "click",
        function(event) {

            if (event.target === modal) {

                modal.remove();

            }

        }
    );

}
