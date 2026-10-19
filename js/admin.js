import { supabase } from "./supabase.js";

// ===============================
// ADMIN ACCESS PROTECTION
// ===============================

async function checkAdminAccess() {

    const {
        data: { user }
    } = await supabase.auth.getUser();

    if (!user) {

        window.location.href =
            "admin-login.html";

        return false;
    }

    const { data: admin, error } =
        await supabase
            .from("admin_users")
            .select("id")
            .eq("auth_user_id", user.id)
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
// RELATIONSHIP HTML ELEMENTS
// ===============================

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
let editingRelationshipId = null;

const relationshipsList =
    document.getElementById("relationshipsList");


// ===============================
// UNLISTED PARENT FORM ELEMENTS
// ===============================

const unlistedParentForm =
    document.getElementById("unlistedParentForm");

const unlistedParentName =
    document.getElementById("unlistedParentName");

const unlistedParentGender =
    document.getElementById("unlistedParentGender");

const unlistedParentStatus =
    document.getElementById("unlistedParentStatus");

const unlistedParentDateOfDeath =
    document.getElementById("unlistedParentDateOfDeath");

const unlistedParentNotes =
    document.getElementById("unlistedParentNotes");

const unlistedParentMessage =
    document.getElementById("unlistedParentMessage");

// ===============================
// PARENT-CHILD LINK FORM ELEMENTS
// ===============================

const parentChildLinkForm =
    document.getElementById("parentChildLinkForm");

const unlistedParentSelect =
    document.getElementById("unlistedParentSelect");

const parentChildSelect =
    document.getElementById("parentChildSelect");

const parentChildLinkMessage =
    document.getElementById("parentChildLinkMessage");

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

    const { data, error } =
        await supabase
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

        console.error(
            "LOAD MEMBERS ERROR:",
            error
        );

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
console.log("Members returned from Supabase:", data);
console.log("Total members loaded:", allMembers.length);
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
            member =>
                member.is_deceased === true
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

                    viewMember(
                        button.dataset.id
                    );

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

                    editMember(
                        button.dataset.id
                    );

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

                    deleteMember(
                        button.dataset.id
                    );

                }
            );

        });

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
// CLOSE MEMBER FORM
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
            item =>
                item.id === id
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

async function uploadMemberPhoto(
    file,
    id
) {

    if (!file) {
        return null;
    }

    const fileExtension =
        file.name.split(".").pop();

    const fileName =
        id + "." + fileExtension;

    const { error: uploadError } =
        await supabase.storage
            .from("family-photos")
            .upload(
                fileName,
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
            .getPublicUrl(fileName);

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
        // ADD MEMBER
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
        // UPDATE MEMBER
        // ===============================

        else {

            result =
                await supabase
                    .from("members")
                    .update(memberData)
                    .eq(
                        "id",
                        memberId.value
                    )
                    .select("id")
                    .single();

        }


        if (result.error) {

            console.error(
                "SAVE MEMBER ERROR:",
                result.error
            );

            memberMessage.innerHTML = `
                Unable to save member.
                <br>
                ${result.error.message}
            `;

            return;
        }


        const savedMemberId =
            result.data.id;


        // ===============================
        // PHOTO
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

                const { error: photoError } =
                    await supabase
                        .from("members")
                        .update({
                            photo_url:
                                photoUrl
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

                memberMessage.innerHTML = `
                    Member saved, but photo upload failed.
                    <br>
                    ${error.message}
                `;

                await loadMembers();

                return;
            }
        }


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
            item =>
                item.id === id
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
            .eq(
                "id",
                id
            );

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


// =================================
// LOAD RELATIONSHIP DROPDOWNS
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

    const { data, error } = await supabase
        .from("relationships")
        .select(`
            id,
            person_id,
            related_person_id,
            relationship_type
        `);

    if (error) {
        console.error("LOAD RELATIONSHIPS ERROR:", error);

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

        const person = allMembers.find(
            member =>
                String(member.id) ===
                String(relationship.person_id)
        );

        const relatedPersonData = allMembers.find(
            member =>
                String(member.id) ===
                String(relationship.related_person_id)
        );

        const personName =
            person?.full_name || "Unknown family member";

        const relatedPersonName =
            relatedPersonData?.full_name ||
            "Unknown family member";

        let relationshipText =
            relationship.relationship_type;

        if (relationshipText === "child") {
            relationshipText = "Child of";
        } else if (relationshipText === "parent") {
            relationshipText = "Parent of";
        } else if (relationshipText === "spouse") {
            relationshipText = "Spouse of";
        }

        const row = document.createElement("div");

        row.className = "relationship-row";

        const info = document.createElement("div");
        info.className = "relationship-info";

        const firstName = document.createElement("strong");
        firstName.textContent = personName;

        const type = document.createElement("span");
        type.textContent = relationshipText;

        const secondName = document.createElement("strong");
        secondName.textContent = relatedPersonName;

        info.appendChild(firstName);
        info.appendChild(type);
        info.appendChild(secondName);

        const actions = document.createElement("div");
        actions.className = "relationship-actions";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className =
            "admin-edit-button edit-relationship-button";
        editButton.textContent = "Edit";
        editButton.dataset.id = relationship.id;

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className =
            "admin-delete-button delete-relationship-button";
        deleteButton.textContent = "Delete";
        deleteButton.dataset.id = relationship.id;

        actions.appendChild(editButton);
        actions.appendChild(deleteButton);

        row.appendChild(info);
        row.appendChild(actions);

        relationshipsList.appendChild(row);
    });

    relationshipsList
        .querySelectorAll(".delete-relationship-button")
        .forEach(button => {
            button.addEventListener("click", () => {
                deleteRelationship(button.dataset.id);
            });
        });

    relationshipsList
        .querySelectorAll(".edit-relationship-button")
        .forEach(button => {
            button.addEventListener("click", () => {
                editRelationship(button.dataset.id);
            });
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

        let error;

if (editingRelationshipId) {

    const result = await supabase
        .from("relationships")
        .update({
            person_id: personId,
            related_person_id: relatedPersonId,
            relationship_type: type
        })
        .eq("id", editingRelationshipId);

    error = result.error;

} else {

    const result = await supabase
        .from("relationships")
        .insert([
            {
                person_id: personId,
                related_person_id: relatedPersonId,
                relationship_type: type
            }
        ]);

    error = result.error;
}

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

        editingRelationshipId = null;

saveRelationshipButton.textContent =
    "Save Relationship";

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
// EDIT RELATIONSHIP
// =================================

async function editRelationship(id) {

    const { data, error } = await supabase
        .from("relationships")
        .select(`
            id,
            person_id,
            related_person_id,
            relationship_type
        `)
        .eq("id", id)
        .single();

    if (error) {
        console.error("EDIT RELATIONSHIP ERROR:", error);

        alert(
            "Unable to load relationship: " +
            error.message
        );

        return;
    }

    editingRelationshipId = data.id;

    relationshipPerson.value = data.person_id;

    relationshipType.value = data.relationship_type;

    relatedPerson.value = data.related_person_id;

    relationshipMessage.textContent =
    "Editing relationship. Make your changes and save.";

saveRelationshipButton.textContent =
    "Update Relationship";
    }
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


// ===============================
// VIEW MEMBER DETAILS
// ===============================

async function viewMember(memberId) {

    const member =
        allMembers.find(
            item =>
                item.id === memberId
        );

    if (!member) {

        alert(
            "Member information not found."
        );

        return;
    }


    const {
        data: memberRelationships,
        error: relationshipError
    } = await supabase
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
                            relationship.person_id ===
                            memberId
                                ? relationship.related_person_id
                                : relationship.person_id
                        )
                );

            if (!relatedMember) {
                return;
            }


            if (
                relationship.relationship_type ===
                "child"
            ) {

                if (
                    relationship.person_id ===
                    memberId
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


            if (
                relationship.relationship_type ===
                "parent"
            ) {

                if (
                    relationship.person_id ===
                    memberId
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


            if (
                relationship.relationship_type ===
                "spouse"
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
        member.date_of_birth ||
        "Not added";


    const birthPlace =
        member.place_of_birth ||
        "Not added";


    const biography =
        member.biography ||
        "No biography has been added yet.";


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
                >
                    🔗 How am I related?
                </button>


                ${
                    parents.length > 0
                    ? `
                        <div class="member-family-info">

                            <strong>
                                Parents
                            </strong>

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

                            <strong>
                                Spouse
                            </strong>

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

                            <strong>
                                Children
                            </strong>

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
                    <strong>
                        Gender:
                    </strong>
                    ${member.gender || "Not added"}
                </p>


                <p>
                    <strong>
                        Date of Birth:
                    </strong>
                    ${birthDate}
                </p>


                <p>
                    <strong>
                        Place of Birth:
                    </strong>
                    ${birthPlace}
                </p>


                ${
                    member.is_deceased
                    ? `
                        <p>
                            <strong>
                                Date of Death:
                            </strong>
                            ${member.date_of_death || "Not added"}
                        </p>
                    `
                    : ""
                }


                <div class="admin-member-biography">

                    <strong>
                        Biography
                    </strong>

                    <p>
                        ${biography}
                    </p>

                </div>

            </div>

        </div>
    `;


    document.body.appendChild(
        modal
    );


    // ===============================
    // FAMILY MEMBER LINKS
    // ===============================

    modal
        .querySelectorAll(
            ".member-family-link"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const relatedMemberId =
                        button.dataset.memberId;

                    modal.remove();

                    viewMember(
                        relatedMemberId
                    );

                }
            );

        });


    // ===============================
    // HOW AM I RELATED
    // ===============================

    const relationshipButton =
        modal.querySelector(
            ".find-relationship-button"
        );

    relationshipButton.addEventListener(
        "click",
        () => {

            modal.remove();

            findFamilyRelationship(
                member.id
            );

        }
    );


    // ===============================
    // FULLSCREEN PHOTO
    // ===============================

    const memberPhotoElement =
        modal.querySelector(
            ".admin-view-member-photo"
        );

    if (
        memberPhotoElement &&
        member.photo_url
    ) {

        memberPhotoElement.style.cursor =
            "pointer";

        memberPhotoElement.addEventListener(
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
                    () => {
                        photoModal.remove();
                    }
                );

            }
        );

    }


    // ===============================
    // CLOSE MEMBER MODAL
    // ===============================

    modal
        .querySelector(
            ".admin-member-view-close"
        )
        .addEventListener(
            "click",
            () => modal.remove()
        );


    modal.addEventListener(
        "click",
        function(event) {

            if (
                event.target === modal
            ) {

                modal.remove();

            }

        }
    );
}


// ===============================
// HOW AM I RELATED
// ===============================

async function findFamilyRelationship(
    sourceMemberId,
    targetMemberId = null
) {

    const sourceMember =
        allMembers.find(
            member =>
                String(member.id) ===
                String(sourceMemberId)
        );


    if (!sourceMember) {

        alert(
            "Starting family member not found."
        );

        return;
    }


    const {
        data: relationships,
        error
    } = await supabase
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


    let foundPath = null;


    // ===============================
    // FIND PATH ONLY IF TARGET EXISTS
    // ===============================

    if (targetMemberId) {

        const targetMember =
            allMembers.find(
                member =>
                    String(member.id) ===
                    String(targetMemberId)
            );


        if (!targetMember) {

            alert(
                "Selected family member was not found."
            );

            return;
        }


        const queue = [
            {
                id: sourceMemberId,
                path: []
            }
        ];


        const visited =
            new Set();


        while (
            queue.length > 0
        ) {

            const current =
                queue.shift();


            if (
                visited.has(
                    current.id
                )
            ) {
                continue;
            }


            visited.add(
                current.id
            );


            for (
                const relationship
                of relationships || []
            ) {

                let nextId = null;
                let relationshipLabel = "";


                // ===============================
                // CHILD RELATIONSHIP
                // ===============================

                if (
                    relationship.person_id ===
                    current.id
                ) {

                    nextId =
                        relationship.related_person_id;

                    relationshipLabel =
                        relationship.relationship_type ===
                        "child"
                            ? "Parent"
                            : "Child";
                }


                else if (
                    relationship.related_person_id ===
                    current.id
                ) {

                    nextId =
                        relationship.person_id;

                    relationshipLabel =
                        relationship.relationship_type ===
                        "child"
                            ? "Child"
                            : "Parent";
                }


                // ===============================
                // SPOUSE
                // ===============================

                if (
                    relationship.relationship_type ===
                    "spouse"
                ) {

                    relationshipLabel =
                        "Spouse";
                }


                if (!nextId) {
                    continue;
                }


                if (
                    visited.has(nextId)
                ) {
                    continue;
                }


                const nextMember =
                    allMembers.find(
                        member =>
                            String(member.id) ===
                            String(nextId)
                    );


                if (!nextMember) {
                    continue;
                }


                const newPath = [
                    ...current.path,
                    {
                        id:
                            nextMember.id,

                        name:
                            nextMember.full_name,

                        relationship:
                            relationshipLabel
                    }
                ];


                queue.push({
                    id:
                        nextId,

                    path:
                        newPath
                });


                if (
                    String(nextId) ===
                    String(targetMemberId)
                ) {

                    foundPath =
                        newPath;

                    break;
                }

            }


            if (foundPath) {
                break;
            }
        }
    }


    // ===============================
    // CREATE RELATIONSHIP POPUP
    // ===============================

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
                Find the connection between:
            </p>


            <h3>
                ${sourceMember.full_name}
            </h3>


            <label
                for="relationshipTargetSelect"
            >
                Choose a family member:
            </label>


            <select
                id="relationshipTargetSelect"
            >

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


            ${
                targetMemberId
                ? `
                    <div class="relationship-path">

                        ${
                            foundPath
                            ? `
                                <p>
                                    🌳 Family connection:
                                </p>

                                <div class="relationship-path-person">
                                    <span class="relationship-path-label">
                                        Start
                                    </span>

                                    <strong>
                                        ${sourceMember.full_name}
                                    </strong>
                                </div>

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
                `
                : ""
            }

        </div>
    `;


    // ===============================
    // FILL MEMBER DROPDOWN
    // ===============================

    const relationshipTargetSelect =
        relationshipModal.querySelector(
            "#relationshipTargetSelect"
        );


    allMembers.forEach(
        member => {

            if (
                String(member.id) ===
                String(sourceMemberId)
            ) {
                return;
            }


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                member.id;


            option.textContent =
                member.full_name;


            relationshipTargetSelect.appendChild(
                option
            );

        }
    );


    // ===============================
    // SELECT CURRENT TARGET
    // ===============================

    if (targetMemberId) {

        relationshipTargetSelect.value =
            targetMemberId;

    }


    document.body.appendChild(
        relationshipModal
    );


    // ===============================
    // CALCULATE BUTTON
    // ===============================

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


            relationshipModal.remove();


            findFamilyRelationship(
                sourceMemberId,
                selectedMemberId
            );

        }
    );


    // ===============================
    // CLOSE BUTTON
    // ===============================

    relationshipModal
        .querySelector(
            ".relationship-result-close"
        )
        .addEventListener(
            "click",
            () => relationshipModal.remove()
        );


    // ===============================
    // CLOSE OUTSIDE
    // ===============================

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

// =================================
// SAVE UNLISTED PARENT
// =================================

unlistedParentForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        const parentName =
            unlistedParentName.value.trim();

        const parentGender =
            unlistedParentGender.value || null;

        const parentDeceased =
            unlistedParentStatus.value === "true";

        const parentDateOfDeath =
            unlistedParentDateOfDeath.value || null;

        const parentNotes =
            unlistedParentNotes.value.trim() || null;

        if (!parentName) {
            unlistedParentMessage.textContent =
                "Please enter the parent's name.";
            return;
        }

        if (!parentDeceased && parentDateOfDeath) {
            unlistedParentMessage.textContent =
                "A living parent cannot have a date of death.";
            return;
        }

        if (parentDeceased && !parentDateOfDeath) {
            unlistedParentMessage.textContent =
                "Please enter the date of death for a deceased parent.";
            return;
        }

        unlistedParentMessage.textContent =
            "Saving parent...";

        try {

            // Check for an existing parent
            const {
                data: existingParent,
                error: searchError
            } = await supabase
                .from("family_parents")
                .select("id, full_name")
                .ilike("full_name", parentName);

            if (searchError) {
                throw searchError;
            }

            if (existingParent && existingParent.length > 0) {
                unlistedParentMessage.textContent =
                    "A parent with this name already exists. " +
                    "Please check the existing record.";
                return;
            }

            // Save the parent
            const { error: saveError } =
                await supabase
                    .from("family_parents")
                    .insert([
                        {
                            full_name: parentName,
                            gender: parentGender,
                            is_deceased: parentDeceased,
                            date_of_death: parentDateOfDeath,
                            notes: parentNotes
                        }
                    ]);

            if (saveError) {
                throw saveError;
            }

            unlistedParentMessage.textContent =
                "Parent saved successfully!";

            unlistedParentForm.reset();

        } catch (error) {

            console.error(
                "SAVE UNLISTED PARENT ERROR:",
                error
            );

            unlistedParentMessage.textContent =
                "Unable to save parent: " +
                error.message;
        }
    }
);
// =================================
// LOAD PARENT-CHILD LINK OPTIONS
// =================================

async function loadParentChildLinkOptions() {

    // Load parents without full profiles
    const { data: parents, error: parentError } =
        await supabase
            .from("family_parents")
            .select("id, full_name")
            .order("full_name");

    if (parentError) {
        console.error("LOAD PARENTS ERROR:", parentError);
        parentChildLinkMessage.textContent =
            "Unable to load parents: " + parentError.message;
        return;
    }

    unlistedParentSelect.innerHTML =
        '<option value="">Select unlisted parent</option>';

    (parents || []).forEach(parent => {

        const option = document.createElement("option");

        option.value = parent.id;
        option.textContent = parent.full_name;

        unlistedParentSelect.appendChild(option);

    });

    // Load existing family members as children
    parentChildSelect.innerHTML =
        '<option value="">Select family member</option>';

    (allMembers || []).forEach(member => {

        const option = document.createElement("option");

        option.value = member.id;
        option.textContent = member.full_name;

        parentChildSelect.appendChild(option);

    });

}
// =================================
// SAVE PARENT-CHILD LINK
// =================================

parentChildLinkForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        const parentId = unlistedParentSelect.value;
        const childId = parentChildSelect.value;

        if (!parentId || !childId) {

            parentChildLinkMessage.textContent =
                "Please select both the parent and child.";

            return;
        }

        parentChildLinkMessage.textContent =
            "Saving relationship...";

        try {

            // Check whether this link already exists
            const { data: existingLink, error: checkError } =
                await supabase
                    .from("family_parent_links")
                    .select("id")
                    .eq("parent_id", parentId)
                    .eq("child_id", childId)
                    .maybeSingle();

            if (checkError) {
                throw checkError;
            }

            if (existingLink) {

                parentChildLinkMessage.textContent =
                    "This parent is already linked to this child.";

                return;
            }

            // Save the parent-child connection
            const { error: saveError } =
                await supabase
                    .from("family_parent_links")
                    .insert([{
                        parent_id: parentId,
                        child_id: childId
                    }]);

            if (saveError) {
                throw saveError;
            }

            parentChildLinkMessage.textContent =
                "Parent linked to child successfully!";

            parentChildLinkForm.reset();

        } catch (error) {

            console.error("PARENT-CHILD LINK ERROR:", error);

            parentChildLinkMessage.textContent =
                "Unable to link parent: " + error.message;

        }

    }
);
// =================================
// START ADMIN PAGE
// =================================

checkAdminAccess().then(
    async isAdmin => {
        if (!isAdmin) return;

        await loadMembers();

        loadRelationshipMembers();

        loadRelationships();

        await loadParentChildLinkOptions();
    }
);
