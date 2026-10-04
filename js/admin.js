import { supabase } from "./supabase.js";

alert("ADMIN JS IS WORKING");


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
