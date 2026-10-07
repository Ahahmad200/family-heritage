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

const memberPhoto =
    document.getElementById("memberPhoto");

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
// UPLOAD MEMBER PHOTO
// ===============================

async function uploadMemberPhoto(file, memberId) {

    if (!file) {
        return null;
    }

    const fileExtension =
        file.name.split(".").pop();

    const fileName =
        memberId + "." + fileExtension;

    const filePath =
        fileName;

    const { error: uploadError } =
        await supabase.storage
            .from("family-photos")
            .upload(
                filePath,
                file,
                {
                    upsert: true
                }
            );

    if (uploadError) {

        console.error(
            "PHOTO UPLOAD ERROR:",
            uploadError
        );

        throw uploadError;
    }

    const { data } =
        supabase.storage
            .from("family-photos")
            .getPublicUrl(filePath);

    return data.publicUrl;
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
                    ])
                    .select("id")
                    .single();

        }


        // ===============================
        // UPDATE EXISTING MEMBER
        // ===============================

        else {

            result = {
                data: {
                    id: memberId.value
                },
                error: null
            };

        }


        // ===============================
        // CHECK MEMBER SAVE ERROR
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
        // GET MEMBER ID
        // ===============================

        const savedMemberId =
            result.data.id;


        // ===============================
        // UPLOAD PHOTO
        // ===============================

        const selectedPhoto =
            memberPhoto.files[0];


        if (selectedPhoto) {

            memberMessage.textContent =
                "Uploading family photo...";

            try {

                const photoUrl =
                    await uploadMemberPhoto(
                        selectedPhoto,
                        savedMemberId
                    );


                // Save photo URL to member record

                const { error: photoError } =
                    await supabase
                        .from("members")
                        .update({
                            photo_url: photoUrl
                        })
                        .eq(
                            "id",
                            savedMemberId
                        );


                if (photoError) {

                    throw photoError;

                }

            } catch (error) {

                console.error(
                    "PHOTO SAVE ERROR:",
                    error
                );

                memberMessage.innerHTML =
                    `
                    Member saved, but photo upload failed.
                    <br>
                    ${error.message}
                    `;

                await loadMembers();

                return;
            }

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

// ===============================
// LOAD MEMBER RELATIONSHIPS
// ===============================

const { data: memberRelationships, error: relationshipError } =
    await supabase
        .from("relationships")
        .select(`
            person_id,
            related_person_id,
            relationship_type
        `)
        .or(
            `person_id.eq.${memberId},related_person_id.eq.${memberId}`
        );

if (relationshipError) {

    console.error(
        "VIEW MEMBER RELATIONSHIP ERROR:",
        relationshipError
    );

}
    if (!member) {

        alert("Member information not found.");

        return;
    }

// ===============================
// ORGANIZE FAMILY RELATIONSHIPS
// ===============================

const parents = [];
const children = [];
const spouses = [];

(memberRelationships || []).forEach(
    relationship => {

        const relatedMember =
            allMembers.find(
                item =>
                    item.id ===
                    (
                        relationship.person_id === memberId
                            ? relationship.related_person_id
                            : relationship.person_id
                    )
            );

        if (!relatedMember) {
            return;
        }


        // Parent
        if (
            relationship.relationship_type === "child"
        ) {

            if (
                relationship.person_id === memberId
            ) {

                parents.push(
                    relatedMember
                );

            } else {

                children.push(
                    relatedMember
                );

            }

        }


        // Parent relationship
        if (
            relationship.relationship_type === "parent"
        ) {

            if (
                relationship.person_id === memberId
            ) {

                children.push(
                    relatedMember
                );

            } else {

                parents.push(
                    relatedMember
                );

            }

        }


        // Spouse
        if (
            relationship.relationship_type === "spouse"
        ) {

            spouses.push(
                relatedMember
            );

        }

    }
);
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
            
            <button
    type="button"
    class="find-relationship-button"
    data-member-id="${member.id}"
>
    🔗 How am I related?
</button>
            
                <!-- FAMILY RELATIONSHIPS -->

                ${
                    parents.length > 0
                    ? `
                        <div class="member-family-info">

                            <strong>Parents</strong>

                            ${parents.map(parent => `
                                <button
    type="button"
    class="member-family-link"
    data-member-id="${parent.id}"
>
    🌿 ${parent.full_name}
</button>
                            `).join("")}

                        </div>
                    `
                    : ""
                }


                ${
                    spouses.length > 0
                    ? `
                        <div class="member-family-info">

                            <strong>Spouse</strong>

                            ${spouses.map(spouse => `
                                <button
    type="button"
    class="member-family-link"
    data-member-id="${spouse.id}"
>
    ❤️ ${spouse.full_name}
</button>
                                
                            `).join("")}

                        </div>
                    `
                    : ""
                }


                ${
                    children.length > 0
                    ? `
                        <div class="member-family-info">

                            <strong>Children</strong>

                            ${children.map(child => `
                                <button
    type="button"
    class="member-family-link"
    data-member-id="${child.id}"
>
    👶 ${child.full_name}
</button>
                            `).join("")}

                        </div>
                    `
                    : ""
                }
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
    modal.querySelectorAll(".member-family-link").forEach(button => {

    button.addEventListener("click", () => {

        const relatedMemberId =
            button.dataset.memberId;

        modal.remove();

        viewMember(relatedMemberId);

    });

});
    const relationshipButton =
    modal.querySelector(".find-relationship-button");

if (relationshipButton) {

    relationshipButton.addEventListener(
        "click",
        function() {

            const selectedMemberId =
                this.dataset.memberId;

            findFamilyRelationship(
    selectedMemberId
);

        }
    );

}
// Enlarge member photo when clicked

const memberPhoto =
    modal.querySelector(".admin-view-member-photo");

if (memberPhoto) {

    memberPhoto.style.cursor = "pointer";

    memberPhoto.addEventListener(
        "click",
        function() {

            const photoModal =
                document.createElement("div");

            photoModal.className =
                "admin-photo-fullscreen";

            photoModal.innerHTML = `
                <img
                    src="${member.photo_url}"
                    alt="${member.full_name}"
                >
            `;

            document.body.appendChild(
                photoModal
            );

            photoModal.addEventListener(
                "click",
                function() {
                    photoModal.remove();
                }
            );

        }
    );

                }

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
async function findFamilyRelationship(targetMemberId) {

    const { data: relationships, error } =
        await supabase
            .from("relationships")
            .select(`
                person_id,
                related_person_id,
                relationship_type
            `);

    if (error) {

        console.error(
            "RELATIONSHIP FINDER ERROR:",
            error
        );

        alert(
            "Unable to load family relationships."
        );

        return;
    }

    const targetMember =
        allMembers.find(
            member =>
                member.id === targetMemberId
        );

    if (!targetMember) {
        return;
    }

    const queue = [
        {
            id: targetMemberId,
            path: []
        }
    ];

    const visited = new Set();

    let foundPath = null;

    while (queue.length > 0) {

        const current =
            queue.shift();

        if (visited.has(current.id)) {
            continue;
        }

        visited.add(current.id);

        for (
            const relationship
            of relationships || []
        ) {

            let nextId = null;

            if (
                relationship.person_id ===
                current.id
            ) {

                nextId =
                    relationship.related_person_id;

            }

            else if (
                relationship.related_person_id ===
                current.id
            ) {

                nextId =
                    relationship.person_id;

            }

            if (!nextId) {
                continue;
            }

            if (visited.has(nextId)) {
                continue;
            }

            const nextMember =
                allMembers.find(
                    member =>
                        member.id === nextId
                );

            if (!nextMember) {
                continue;
            }
            let relationshipLabel = "";

if (
    relationship.relationship_type === "child"
) {
    relationshipLabel = "Parent";
}

else if (
    relationship.relationship_type === "parent"
) {
    relationshipLabel = "Child";
}

else if (
    relationship.relationship_type === "spouse"
) {
    relationshipLabel = "Spouse";
}

else {
    relationshipLabel =
        relationship.relationship_type;
}

            const newPath = [
    ...current.path,
    {
        id: nextMember.id,
        name: nextMember.full_name,
        relationship:
            relationshipLabel
    }
];

console.log(
    "RELATIONSHIP LABEL:",
    relationshipLabel
);

            queue.push({
                id: nextId,
                path: newPath
            });

            if (newPath.length >= 1) {

                foundPath =
                    newPath;

                break;
            }
        }

        if (foundPath) {
            break;
        }
    }

    const relationshipModal =
        document.createElement("div");

    relationshipModal.className =
        "relationship-result-modal";

    relationshipModal.innerHTML = `
    <div class="relationship-result-card">

        <button
            type="button"
            class="relationship-result-close"
        >
            ×
        </button>

        <h2>
            🔗 Family Relationship
        </h2>

        <p class="relationship-result-intro">
            Family connection for:
        </p>

        <h3>
            ${targetMember.full_name}
        </h3>

        <label for="relationshipTargetSelect">
            Choose a family member:
        </label>

        <select id="relationshipTargetSelect">
            <option value="">
                Select family member
            </option>
        </select>

        <button
            type="button"
            id="calculateRelationshipButton"
            class="find-relationship-button"
        >
            🔗 Find Relationship
        </button>

        <div class="relationship-path">

            ${
                foundPath
                ? `
                    <p>
                        🌳 Connected to:
                    </p>

                    ${foundPath.map(
                        person => `
                            <div class="relationship-path-person">
                                <span class="relationship-path-label">
                                    ${person.relationship}
                                </span>

                                <strong>
                                    ${person.name}
                                </strong>
                            </div>
                        `
                    ).join("")}
                `
                : `
                    <p>
                        🌿 No connected relationship
                        path could be found.
                    </p>
                `
            }

        </div>

    </div>
`;
const relationshipTargetSelect =
    relationshipModal.querySelector(
        "#relationshipTargetSelect"
    );

allMembers.forEach(member => {

    if (member.id === targetMemberId) {
        return;
    }

    const option =
        document.createElement("option");

    option.value = member.id;
    option.textContent =
        member.full_name;

    relationshipTargetSelect.appendChild(
        option
    );

});
    document.body.appendChild(
        relationshipModal
    );
const calculateRelationshipButton =
    relationshipModal.querySelector(
        "#calculateRelationshipButton"
    );

calculateRelationshipButton.addEventListener(
    "click",
    function() {

        const selectedMemberId =
            relationshipTargetSelect.value;

        if (!selectedMemberId) {

            alert(
                "Please select a family member."
            );

            return;
        }

        findFamilyRelationship(
            selectedMemberId
        );

    }
);
    relationshipModal
        .querySelector(
            ".relationship-result-close"
        )
        .addEventListener(
            "click",
            () => relationshipModal.remove()
        );

    relationshipModal.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                relationshipModal
            ) {

                relationshipModal.remove();

            }

        }
    );
}
