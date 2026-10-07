import { supabase } from "./supabase.js";

const familyTree = document.getElementById("familyTree");

window.familyMembers = [];


// =========================================
// LOAD FAMILY TREE
// =========================================

async function loadFamilyTree() {

    familyTree.innerHTML = `
        <p class="loading-tree">
            Loading our family tree...
        </p>
    `;


    // -----------------------------------------
    // LOAD MEMBERS
    // -----------------------------------------

    const { data: members, error: membersError } =
        await supabase
            .from("members")
            .select(`
                id,
                full_name,
                is_deceased,
                photo_url,
                biography,
                date_of_birth,
                place_of_birth
            `);


    if (membersError) {

        console.error(membersError);

        familyTree.innerHTML = `
            <p class="tree-error">
                Unable to load family members.
            </p>
        `;

        return;
    }


    window.familyMembers = members;


    // -----------------------------------------
    // LOAD RELATIONSHIPS
    // -----------------------------------------

    const {
        data: relationships,
        error: relationshipsError
    } = await supabase
        .from("relationships")
        .select(`
            person_id,
            related_person_id,
            relationship_type
        `);


    if (relationshipsError) {

        console.error(relationshipsError);

        familyTree.innerHTML = `
            <p class="tree-error">
                Unable to load family relationships.
            </p>
        `;

        return;
    }


    // -----------------------------------------
    // FIND FOUNDING COUPLE
    // -----------------------------------------

    const patriarch = members.find(
        member =>
            member.full_name ===
            "Alh Aliyu Abdulmuninu Gandu"
    );


    const matriarch = members.find(
        member =>
            member.full_name ===
            "Haj Aisha Mukhtar"
    );


    if (!patriarch || !matriarch) {

        familyTree.innerHTML = `
            <p class="tree-error">
                The main family couple could not be found.
            </p>
        `;

        return;
    }


    // -----------------------------------------
    // CLEAR TREE
    // -----------------------------------------

    familyTree.innerHTML = "";


    const tree =
        document.createElement("div");

    tree.className =
        "family-tree";


    // -----------------------------------------
    // FOUNDING COUPLE
    // -----------------------------------------

    const couple =
        document.createElement("div");

    couple.className =
        "central-couple";


    couple.innerHTML = `

        ${createMemberCard(
            patriarch,
            "Patriarch"
        )}

        <div class="marriage-symbol">
            ❤️
        </div>

        ${createMemberCard(
            matriarch,
            "Matriarch"
        )}

    `;


    tree.appendChild(couple);


    // -----------------------------------------
    // MAIN CONNECTOR
    // -----------------------------------------

    const mainLine =
        document.createElement("div");

    mainLine.className =
        "main-connector";


    tree.appendChild(mainLine);


    // -----------------------------------------
    // GENERATION 1
    // -----------------------------------------

    const firstGeneration =
        getChildren(
            patriarch.id,
            relationships,
            members
        ).filter(
            child =>
                getChildren(
                    matriarch.id,
                    relationships,
                    members
                ).some(
                    motherChild =>
                        motherChild.id === child.id
                )
        );


    const title =
        document.createElement("h3");

    title.className =
        "generation-title";

    title.textContent =
        `Their Children (${firstGeneration.length})`;


    tree.appendChild(title);


    // -----------------------------------------
    // BUILD ALL GENERATIONS
    // -----------------------------------------

    const generationContainer =
        document.createElement("div");

    generationContainer.className =
        "recursive-family-tree";


    firstGeneration.forEach(child => {

        const branch =
            createGenerationBranch(
                child,
                relationships,
                members,
                1
            );

        generationContainer.appendChild(
            branch
        );

    });


    tree.appendChild(
        generationContainer
    );


    familyTree.appendChild(tree);

}


// =========================================
// GET CHILDREN
// =========================================

function getChildren(
    parentId,
    relationships,
    members
) {

    return relationships
        .filter(
            relationship =>
                relationship.related_person_id === parentId &&
                relationship.relationship_type === "child"
        )
        .map(
            relationship =>
                members.find(
                    member =>
                        member.id === relationship.person_id
                )
        )
        .filter(Boolean);

}


// =========================================
// CREATE GENERATION BRANCH
// =========================================

function createGenerationBranch(
    member,
    relationships,
    members,
    generation
) {

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "generation-branch";


    // -----------------------------------------
    // MEMBER CARD
    // -----------------------------------------

    wrapper.innerHTML =
        createMemberCard(
            member,
            getGenerationLabel(generation)
        );


    // -----------------------------------------
    // FIND CHILDREN
    // -----------------------------------------

    const children =
        getChildren(
            member.id,
            relationships,
            members
        );


    if (children.length === 0) {

        return wrapper;

    }


    // -----------------------------------------
    // GENERATION CONNECTOR
    // -----------------------------------------

    const connector =
        document.createElement("div");

    connector.className =
        "generation-connector";


    wrapper.appendChild(
        connector
    );


    // -----------------------------------------
    // CHILDREN TITLE
    // -----------------------------------------

    const childrenTitle =
        document.createElement("div");

    childrenTitle.className =
        "generation-subtitle";


    childrenTitle.textContent =
        `Generation ${generation + 1}`;


    wrapper.appendChild(
        childrenTitle
    );


    // -----------------------------------------
    // CHILDREN CONTAINER
    // -----------------------------------------

    const childrenContainer =
        document.createElement("div");

    childrenContainer.className =
        "generation-children";


    children.forEach(child => {

        const childBranch =
            createGenerationBranch(
                child,
                relationships,
                members,
                generation + 1
            );


        childrenContainer.appendChild(
            childBranch
        );

    });


    wrapper.appendChild(
        childrenContainer
    );


    return wrapper;

}


// =========================================
// GENERATION LABEL
// =========================================

function getGenerationLabel(generation) {

    if (generation === 1) {

        return "Child of Alh Aliyu & Haj Aisha";

    }

    if (generation === 2) {

        return "Grandchild";

    }

    if (generation === 3) {

        return "Great-grandchild";

    }

    if (generation === 4) {

        return "4th Generation Descendant";

    }

    return `${generation + 1}th Generation Descendant`;

}


// =========================================
// MEMBER CARD
// =========================================

function createMemberCard(
    member,
    relationship
) {

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
                <div class="member-photo-placeholder">
                    ${getInitials(member.full_name)}
                </div>
            `;


    return `

        <div
            class="
                member-card
                ${member.is_deceased ? "deceased" : ""}
            "
            data-member-id="${member.id}"
        >

            <div class="member-photo">
                ${photo}
            </div>


            <div class="member-info">

                <h4>
                    ${member.full_name}
                </h4>


                <p class="member-relationship">
                    ${relationship}
                </p>


                <p class="member-status">
                    ${status}
                </p>

            </div>

        </div>

    `;

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
// MEMBER BIOGRAPHY POPUP
// =========================================

const memberModal =
    document.getElementById("memberModal");

const modalMemberContent =
    document.getElementById("modalMemberContent");

const closeMemberModal =
    document.getElementById("closeMemberModal");


function openMemberModal(member) {

    const status =
        member.is_deceased
            ? "Deceased"
            : "Living";


    const statusClass =
        member.is_deceased
            ? "deceased"
            : "";


    const photo =
        member.photo_url

            ? `
                <img
                    src="${member.photo_url}"
                    alt="${member.full_name}"
                >
            `

            : `
                <div class="modal-member-placeholder">
                    ${getInitials(member.full_name)}
                </div>
            `;


    const biography =
        member.biography
            ? member.biography
            : "Biography will be added soon.";


    modalMemberContent.innerHTML = `

        <div class="modal-member-photo">
            ${photo}
        </div>


        <h2 class="modal-member-name">
            ${member.full_name}
        </h2>


        <p class="modal-member-status ${statusClass}">
            ${status}
        </p>


        <div class="modal-member-details">

            ${
                member.date_of_birth
                    ? `
                        <p>
                            🎂
                            <strong>Date of Birth:</strong>
                            ${member.date_of_birth}
                        </p>
                    `
                    : ""
            }


            ${
                member.place_of_birth
                    ? `
                        <p>
                            📍
                            <strong>Place of Birth:</strong>
                            ${member.place_of_birth}
                        </p>
                    `
                    : ""
            }

        </div>


        <div class="modal-member-biography">

            <h3 class="modal-member-biography-title">
                Biography
            </h3>

            <p>
                ${biography}
            </p>

        </div>

    `;


    memberModal.style.display =
        "flex";

}


// =========================================
// CLOSE MEMBER MODAL
// =========================================

function closeMemberModalWindow() {

    memberModal.style.display =
        "none";

}


closeMemberModal.addEventListener(
    "click",
    closeMemberModalWindow
);


memberModal.addEventListener(
    "click",
    function(event) {

        if (event.target === memberModal) {

            closeMemberModalWindow();

        }

    }
);


// =========================================
// CLICK MEMBER CARD
// =========================================

document.addEventListener(
    "click",
    function(event) {

        const card =
            event.target.closest(
                ".member-card"
            );


        if (!card) {

            return;

        }


        const memberId =
            card.dataset.memberId;


        const member =
            window.familyMembers?.find(
                member =>
                    member.id === memberId
            );


        if (member) {

            openMemberModal(member);

        }

    }
);


// =========================================
// START
// =========================================

loadFamilyTree();
