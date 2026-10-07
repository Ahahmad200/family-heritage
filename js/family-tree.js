import { supabase } from "./supabase.js";

const familyTree = document.getElementById("familyTree");

window.familyMembers = [];

async function loadFamilyTree() {

    familyTree.innerHTML = `
        <p class="loading-tree">Loading our family tree...</p>
    `;

    // Get all family members
    const { data: members, error: membersError } = await supabase
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

    // Make members available to the popup
    window.familyMembers = members;


    // Get all relationships
    const { data: relationships, error: relationshipsError } =
        await supabase
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


    // Find Patriarch
    const patriarch = members.find(
        member =>
            member.full_name ===
            "Alh Aliyu Abdulmuninu Gandu"
    );


    // Find Matriarch
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


    // Find children belonging to BOTH parents

    const patriarchChildren = relationships
        .filter(
            relationship =>
                relationship.related_person_id === patriarch.id &&
                relationship.relationship_type === "child"
        )
        .map(
            relationship =>
                relationship.person_id
        );


    const matriarchChildren = relationships
        .filter(
            relationship =>
                relationship.related_person_id === matriarch.id &&
                relationship.relationship_type === "child"
        )
        .map(
            relationship =>
                relationship.person_id
        );


    const commonChildren = patriarchChildren.filter(
        id => matriarchChildren.includes(id)
    );


    const children = members.filter(
        member =>
            commonChildren.includes(member.id)
    );


    children.sort((a, b) =>
        a.full_name.localeCompare(b.full_name)
    );


    // Clear loading message
    familyTree.innerHTML = "";


    const tree = document.createElement("div");

    tree.className = "family-tree";


    // =========================================
    // CENTRAL COUPLE
    // =========================================

    const couple = document.createElement("div");

    couple.className = "central-couple";

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


    // =========================================
    // MAIN CONNECTOR
    // =========================================

    const mainLine = document.createElement("div");

    mainLine.className = "main-connector";

    tree.appendChild(mainLine);


    // =========================================
    // CHILDREN TITLE
    // =========================================

    const childrenTitle = document.createElement("h3");

    childrenTitle.className = "generation-title";

    childrenTitle.textContent =
        `Their Children (${children.length})`;

    tree.appendChild(childrenTitle);


    // =========================================
    // CHILDREN GRID
    // =========================================

    const childrenContainer = document.createElement("div");

    childrenContainer.className = "children-grid";


    children.forEach(child => {

        const childWrapper =
            document.createElement("div");

        childWrapper.className =
            "child-wrapper";


        // Child card
        childWrapper.innerHTML =
            createMemberCard(
                child,
                "Child of Alh Aliyu & Haj Aisha"
            );


        // Find this child's children

        const grandchildren =
            relationships
                .filter(
                    relationship =>
                        relationship.related_person_id === child.id &&
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


        // Add expandable section

        if (grandchildren.length > 0) {

            const expandButton =
                document.createElement("button");

            expandButton.className =
                "expand-family-button";

            expandButton.textContent =
                `Show ${grandchildren.length} children ▼`;


            const grandchildrenContainer =
                document.createElement("div");

            grandchildrenContainer.className =
                "grandchildren-container";


            grandchildrenContainer.style.display =
                "none";


            grandchildren.forEach(grandchild => {

                const card =
                    document.createElement("div");

                card.innerHTML =
                    createMemberCard(
                        grandchild,
                        `Child of ${child.full_name}`
                    );

                grandchildrenContainer.appendChild(card);

            });


            expandButton.addEventListener(
                "click",
                (event) => {

                    // Prevent the button click
                    // from affecting the member card
                    event.stopPropagation();


                    const isHidden =
                        grandchildrenContainer.style.display ===
                        "none";


                    if (isHidden) {

                        grandchildrenContainer.style.display =
                            "grid";

                        expandButton.textContent =
                            `Hide ${grandchildren.length} children ▲`;

                    } else {

                        grandchildrenContainer.style.display =
                            "none";

                        expandButton.textContent =
                            `Show ${grandchildren.length} children ▼`;

                    }

                }
            );


            childWrapper.appendChild(
                expandButton
            );


            childWrapper.appendChild(
                grandchildrenContainer
            );

        }


        childrenContainer.appendChild(
            childWrapper
        );

    });


    tree.appendChild(
        childrenContainer
    );


    familyTree.appendChild(tree);

}


// =========================================
// MEMBER CARD
// =========================================

function createMemberCard(member, relationship) {

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
                
<p class="member-branch">
    🌿 Main Family Branch
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


// Open member popup

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
            ? `<p>🎂 <strong>Date of Birth:</strong> ${member.date_of_birth}</p>`
            : ""
    }

    ${
        member.place_of_birth
            ? `<p>📍 <strong>Place of Birth:</strong> ${member.place_of_birth}</p>`
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


    memberModal.style.display = "flex";
}


// Close popup

function closeMemberModalWindow() {

    memberModal.style.display = "none";

}


// Close button

closeMemberModal.addEventListener(
    "click",
    closeMemberModalWindow
);


// Close when clicking outside

memberModal.addEventListener(
    "click",
    function(event) {

        if (event.target === memberModal) {

            closeMemberModalWindow();

        }

    }
);


// Make every member card clickable

document.addEventListener(
    "click",
    function(event) {

        const card =
            event.target.closest(".member-card");

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
