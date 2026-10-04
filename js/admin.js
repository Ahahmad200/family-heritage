alert("ADMIN JS IS WORKING");
import { supabase } from "./supabase.js";


// =========================================
// ELEMENTS
// =========================================

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


// Form fields

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


// Dashboard statistics

const totalMembers =
    document.getElementById("totalMembers");

const livingMembers =
    document.getElementById("livingMembers");

const deceasedMembers =
    document.getElementById("deceasedMembers");


let allMembers = [];


// =========================================
// LOAD MEMBERS
// =========================================

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

    console.error("MEMBERS ERROR:", error);

    membersList.innerHTML = `
        <p class="admin-error">
            Unable to load family members.
            <br><br>
            ${error.message}
        </p>
    `;

    return;
}


    allMembers = data || [];


    updateStatistics();

    displayMembers(allMembers);

}


// =========================================
// STATISTICS
// =========================================

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


// =========================================
// DISPLAY MEMBERS
// =========================================

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


    // Edit buttons

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


    // Delete buttons

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


// =========================================
// INITIALS
// =========================================

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


// =========================================
// OPEN ADD MEMBER FORM
// =========================================

addMemberButton.addEventListener(
    "click",
    () => {

        openMemberForm();

    }
);


function openMemberForm() {

    memberForm.reset();

    memberId.value = "";

    memberFormTitle.textContent =
        "Add Family Member";

    memberMessage.textContent = "";
